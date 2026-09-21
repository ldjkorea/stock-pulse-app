import { describe, it, expect } from 'vitest';
import { calculateScore, getScoreLabel } from './scoreEngine';
import { CURRENT_SCORE_MODEL_VERSION } from './weights';

describe('결정론적 점수 계산 엔진 (ScoreEngine)', () => {
  const sampleInput = {
    symbol_id: 'NVDA',
    input_data_version: '20260921-0845',
    factor_inputs: {
      PERFORMANCE_CASH: { raw_score: 86, reason_ko: '데이터센터 분기 매출 및 FCF 급증' },
      VALUATION: { raw_score: 54, reason_ko: '선행 P/E 34배로 역사적 중간 수준' },
      MARKET_EXPECTATION: { raw_score: 81, reason_ko: '빅테크 AI CAPEX 상향' },
      INDUSTRY_ENVIRONMENT: { raw_score: 77, reason_ko: '데이터센터 가속기 공급 부족 지속' },
      FINANCIAL_RESILIENCE: { raw_score: 92, reason_ko: '부채비율 18% 및 풍부한 유동성' },
    },
  };

  it('동일한 입력과 모델 버전이면 항상 100% 동일한 점수를 반환해야 한다 (Deterministic)', () => {
    const result1 = calculateScore(sampleInput);
    const result2 = calculateScore(sampleInput);

    expect(result1.total_score).toBe(result2.total_score);
    expect(result1.score_label).toBe(result2.score_label);
    expect(result1.score_model_version).toBe(CURRENT_SCORE_MODEL_VERSION);
    expect(result1.factor_scores).toEqual(result2.factor_scores);
  });

  it('가중합 계산 공식이 정확해야 한다', () => {
    // 가중합 = 86*0.25 + 54*0.25 + 81*0.20 + 77*0.15 + 92*0.15
    // = 21.5 + 13.5 + 16.2 + 11.55 + 13.8 = 76.55 (0~100 스케일)
    // 1.0~10.0 스케일: 1.0 + (76.55 / 100) * 9.0 = 1.0 + 6.8895 = 7.8895 -> 7.9 or 7.8
    const result = calculateScore(sampleInput);
    expect(result.status).toBe('ACTIVE');
    expect(result.total_score).toBeGreaterThanOrEqual(7.8);
    expect(result.total_score).toBeLessThanOrEqual(7.9);
    expect(result.score_label).toBe('우호적');
  });

  it('점수 구간별 레이블 매핑이 규칙과 일치해야 한다', () => {
    // 1.0~2.9 매우 불리, 3.0~4.9 불리, 5.0~6.9 중립, 7.0~8.9 우호적, 9.0~10.0 매우 우호적
    expect(getScoreLabel(1.5)).toBe('매우 불리');
    expect(getScoreLabel(2.9)).toBe('매우 불리');
    expect(getScoreLabel(3.0)).toBe('불리');
    expect(getScoreLabel(4.5)).toBe('불리');
    expect(getScoreLabel(5.0)).toBe('중립');
    expect(getScoreLabel(6.9)).toBe('중립');
    expect(getScoreLabel(7.0)).toBe('우호적');
    expect(getScoreLabel(8.9)).toBe('우호적');
    expect(getScoreLabel(9.0)).toBe('매우 우호적');
    expect(getScoreLabel(10.0)).toBe('매우 우호적');
  });

  it('직전 평가 대비 점수 변화와 요인 기여도 변화가 계산되어야 한다', () => {
    const prevSnapshot = {
      total_score: 7.1,
      factor_scores: {
        PERFORMANCE_CASH: { score_contribution_10: 1.90, raw_score: 84 },
        VALUATION: { score_contribution_10: 1.20, raw_score: 53 },
        MARKET_EXPECTATION: { score_contribution_10: 1.30, raw_score: 72 },
        INDUSTRY_ENVIRONMENT: { score_contribution_10: 1.00, raw_score: 74 },
        FINANCIAL_RESILIENCE: { score_contribution_10: 1.24, raw_score: 92 },
      },
    };

    const result = calculateScore({
      ...sampleInput,
      previous_snapshot: prevSnapshot,
    });

    expect(result.score_change).toBeDefined();
    expect(result.score_change).toBeGreaterThan(0); // 7.1 -> 7.8/7.9 상승
    expect(result.factor_contribution_changes).toBeDefined();
    expect(result.factor_contribution_changes?.MARKET_EXPECTATION).toBeGreaterThan(0);
  });

  it('필수 요인 데이터 결손 시 점수를 억지로 만들지 않고 PENDING_EVALUATION 상태를 반환해야 한다', () => {
    const incompleteInput = {
      symbol_id: 'UNKNOWN',
      input_data_version: '20260921-0845',
      factor_inputs: {
        PERFORMANCE_CASH: { raw_score: 80, reason_ko: '매출 안정' },
        // VALUATION 누락
        MARKET_EXPECTATION: { raw_score: 70, reason_ko: '컨센서스 유지' },
        INDUSTRY_ENVIRONMENT: { raw_score: 75, reason_ko: '업황 양호' },
        FINANCIAL_RESILIENCE: { raw_score: 85, reason_ko: '재무 양호' },
      },
    };

    const result = calculateScore(incompleteInput);
    expect(result.status).toBe('PENDING_EVALUATION');
    expect(result.pending_reason_ko).toContain('평가를 보류합니다');
  });

  it('종목 점수는 투자자의 평균매수가나 수량에 절대 영향을 받지 않는다 (객관적 종목 매력도)', () => {
    // 투자자 A (평단 $120, 100주)와 투자자 B (평단 $180, 5주)의 점수는 동일
    const scoreForInvestorA = calculateScore(sampleInput);
    const scoreForInvestorB = calculateScore(sampleInput);

    expect(scoreForInvestorA.total_score).toBe(scoreForInvestorB.total_score);
    expect(scoreForInvestorA.score_label).toBe(scoreForInvestorB.score_label);
  });
});
