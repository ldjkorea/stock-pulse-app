import {
  FactorType,
  FactorScore,
  ScoreLabel,
  FACTOR_LABELS_KO,
} from '../types/analysis';
import { FACTOR_WEIGHTS, CURRENT_SCORE_MODEL_VERSION } from './weights';

export interface FactorInputItem {
  raw_score: number;      // 0 ~ 100
  reason_ko: string;      // 산정 근거
}

export interface ScoreEngineInput {
  symbol_id: string;
  factor_inputs: Partial<Record<FactorType, FactorInputItem>>;
  input_data_version: string;
  analysis_timestamp?: string;
  previous_snapshot?: {
    total_score: number;
    factor_scores: Record<FactorType, { score_contribution_10: number; raw_score: number }>;
  };
}

export interface ScoreEngineOutput {
  status: 'ACTIVE' | 'PENDING_EVALUATION';
  pending_reason_ko?: string;
  total_score: number;                     // 1.0 ~ 10.0 (소수점 1자리)
  score_label: ScoreLabel;
  factor_scores: Record<FactorType, FactorScore>;
  factor_contributions: Record<FactorType, number>; // 1.0~10.0 스케일 기여도
  score_model_version: string;
  analysis_timestamp: string;
  input_data_version: string;
  score_change?: number;                   // 직전 대비 점수 변화
  factor_contribution_changes?: Record<FactorType, number>; // 요인별 기여도 변화
}

/**
 * 1.0 ~ 10.0 점수에 따른 레이블 반환
 * 1.0~2.9 = 매우 불리
 * 3.0~4.9 = 불리
 * 5.0~6.9 = 중립
 * 7.0~8.9 = 우호적
 * 9.0~10.0 = 매우 우호적
 */
export function getScoreLabel(score: number): ScoreLabel {
  if (score < 3.0) return '매우 불리';
  if (score < 5.0) return '불리';
  if (score < 7.0) return '중립';
  if (score < 9.0) return '우호적';
  return '매우 우호적';
}

/**
 * 순수 결정론적 Score Engine (AI가 임의 생성하지 않음)
 * 
 * - 5대 요인 점수(0~100)의 가중합(0~100)을 1.0~10.0 스케일로 변환
 * - 변환 공식: total_score = 1.0 + (weighted_sum / 100) * 9.0
 * - 각 요인의 10점 만점 기준 기여도: contribution_10 = (raw_score * weight / 100) * 9.0
 * - 따라서 sum(contribution_10) = (total_score - 1.0)
 * - 점수 변화(delta Total) == sum(delta Factor Contribution)이 수학적으로 항상 성립
 */
export function calculateScore(input: ScoreEngineInput): ScoreEngineOutput {
  const timestamp = input.analysis_timestamp || new Date().toISOString();
  const allFactors: FactorType[] = [
    'PERFORMANCE_CASH',
    'VALUATION',
    'MARKET_EXPECTATION',
    'INDUSTRY_ENVIRONMENT',
    'FINANCIAL_RESILIENCE',
  ];

  // 1. 필수 데이터 검증: 요인 데이터가 결손된 경우 '평가 보류' 상태 반환
  for (const factor of allFactors) {
    const item = input.factor_inputs[factor];
    if (!item || typeof item.raw_score !== 'number' || isNaN(item.raw_score)) {
      return {
        status: 'PENDING_EVALUATION',
        pending_reason_ko: `${FACTOR_LABELS_KO[factor]}에 대한 검증 가능한 최신 데이터가 부족하여 평가를 보류합니다.`,
        total_score: 0,
        score_label: '중립',
        factor_scores: {} as Record<FactorType, FactorScore>,
        factor_contributions: {} as Record<FactorType, number>,
        score_model_version: CURRENT_SCORE_MODEL_VERSION,
        analysis_timestamp: timestamp,
        input_data_version: input.input_data_version,
      };
    }
  }

  // 2. 가중합 및 요인별 기여도 계산
  let weightedSum100 = 0;
  const factorScores: Partial<Record<FactorType, FactorScore>> = {};
  const factorContributions: Partial<Record<FactorType, number>> = {};
  const factorContributionChanges: Partial<Record<FactorType, number>> = {};

  for (const factor of allFactors) {
    const inputItem = input.factor_inputs[factor]!;
    // raw_score는 0 ~ 100 범위로 클램프
    const rawScore = Math.min(100, Math.max(0, inputItem.raw_score));
    const weight = FACTOR_WEIGHTS[factor];
    const weightedContribution = rawScore * weight; // 0 ~ 25 or 0 ~ 20 etc.
    weightedSum100 += weightedContribution;

    // 1.0~10.0 스케일상 기여도 (소수점 2자리 반올림)
    const scoreContrib10 = Number(((weightedContribution / 100) * 9.0).toFixed(2));

    let changeVsPrevious: number | undefined = undefined;
    if (input.previous_snapshot?.factor_scores[factor]) {
      const prevContrib = input.previous_snapshot.factor_scores[factor].score_contribution_10;
      changeVsPrevious = Number((scoreContrib10 - prevContrib).toFixed(2));
      factorContributionChanges[factor] = changeVsPrevious;
    }

    factorScores[factor] = {
      factor,
      factor_name_ko: FACTOR_LABELS_KO[factor],
      raw_score: rawScore,
      weight,
      weighted_contribution: Number(weightedContribution.toFixed(2)),
      score_contribution_10: scoreContrib10,
      change_vs_previous: changeVsPrevious,
      reason_ko: inputItem.reason_ko,
    };

    factorContributions[factor] = scoreContrib10;
  }

  // 3. 최종 점수 산출 (1.0 ~ 10.0, 소수점 1자리)
  const rawTotal = 1.0 + (weightedSum100 / 100) * 9.0;
  const totalScore = Number(Math.min(10.0, Math.max(1.0, rawTotal)).toFixed(1));
  const scoreLabel = getScoreLabel(totalScore);

  let scoreChange: number | undefined = undefined;
  if (input.previous_snapshot) {
    scoreChange = Number((totalScore - input.previous_snapshot.total_score).toFixed(1));
  }

  return {
    status: 'ACTIVE',
    total_score: totalScore,
    score_label: scoreLabel,
    factor_scores: factorScores as Record<FactorType, FactorScore>,
    factor_contributions: factorContributions as Record<FactorType, number>,
    score_model_version: CURRENT_SCORE_MODEL_VERSION,
    analysis_timestamp: timestamp,
    input_data_version: input.input_data_version,
    score_change: scoreChange,
    factor_contribution_changes: input.previous_snapshot
      ? (factorContributionChanges as Record<FactorType, number>)
      : undefined,
  };
}
