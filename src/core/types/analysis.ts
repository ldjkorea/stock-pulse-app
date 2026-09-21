/**
 * 종목 분석, 5대 요인 점수, 스냅샷, 정정(Correction) 타입 정의
 */

// 5대 요인 구분
export type FactorType =
  | 'PERFORMANCE_CASH'       // 실적·현금창출 (25%)
  | 'VALUATION'              // 밸류에이션 (25%)
  | 'MARKET_EXPECTATION'     // 시장 기대 변화 (20%)
  | 'INDUSTRY_ENVIRONMENT'   // 산업·외부환경 (15%)
  | 'FINANCIAL_RESILIENCE';  // 재무 회복력 (15%)

export const FACTOR_LABELS_KO: Record<FactorType, string> = {
  PERFORMANCE_CASH: '실적·현금창출',
  VALUATION: '밸류에이션',
  MARKET_EXPECTATION: '시장 기대 변화',
  INDUSTRY_ENVIRONMENT: '산업·외부환경',
  FINANCIAL_RESILIENCE: '재무 회복력',
};

// 1.0 ~ 10.0 점수 라벨
export type ScoreLabel = '매우 불리' | '불리' | '중립' | '우호적' | '매우 우호적';

// 신뢰도 2차원 축
export type EvidenceSufficiency = '높음' | '보통' | '낮음';
export type ForecastUncertainty = '낮음' | '보통' | '높음';

// 각 요인별 점수 및 기여도
export interface FactorScore {
  factor: FactorType;
  factor_name_ko: string;
  raw_score: number;             // 0 ~ 100
  weight: number;                // 0.25, 0.20, 0.15 등 (합계 1.0)
  weighted_contribution: number; // raw_score * weight (0 ~ 100 스케일 기여도)
  score_contribution_10: number; // 1.0~10.0 스케일 상 기여도 (weighted_contribution * 0.09)
  change_vs_previous?: number;   // 직전 대비 기여도 변화
  reason_ko: string;             // 이 요인 점수가 산정된 구체적 팩트
}

// 투자 논리 스냅샷 (Thesis)
export interface ThesisSnapshot {
  headline: string;              // "AI 서버 투자 전망 상향으로 실적 기대 강화"
  what_happened: string;         // 무슨 일이 일어났는가
  impact_on_business: string;    // 기업에 미치는 영향
  current_verdict: string;       // 현재 판단
}

// 앞으로 확인할 조건 (1~3개)
export interface FutureCheckpoint {
  id: string;
  condition_ko: string;          // 예: "다음 분기 데이터센터 매출 300억 달러 유지 여부"
  monitoring_focus: string;      // 무엇을 집중해서 봐야 하는지
  impact_level: 'HIGH' | 'MEDIUM';
}

// 전문 상세 분석 (전문가용)
export interface DeepDiveAnalysis {
  revenue_growth_text: string;
  profit_and_fcf_text: string;
  forward_pe_analysis: string;
  consensus_revision_text: string;
  industry_trend_text: string;
  regulation_and_risk_text: string;
}

// 데이터 정정 기록 (Correction)
// 잘못된 정보나 오류 발생 시 과거 분석을 삭제하지 않고 정정 이력을 보존
export interface Correction {
  id: string;
  analysis_id: string;
  symbol_id: string;
  corrected_at: string;
  previous_fact: string;         // 이전 분석 내용 (오류가 있던 부분)
  corrected_fact: string;        // 새로 확인되어 정정된 내용
  impact_on_score: string;       // 이번 정정이 점수와 판단에 미친 영향 (예: -0.4점 하향)
  source_doc_id?: string;
}

// 불변 과거 분석 스냅샷 (AnalysisSnapshot)
export interface AnalysisSnapshot {
  id: string;
  symbol_id: string;
  total_score: number;           // 1.0 ~ 10.0
  score_label: ScoreLabel;
  factor_scores: Record<FactorType, FactorScore>;
  factor_contributions: Record<FactorType, number>;
  evidence_sufficiency: EvidenceSufficiency;
  forecast_uncertainty: ForecastUncertainty;
  thesis: ThesisSnapshot;
  score_model_version: string;
  input_data_version: string;
  analyzed_at: string;           // ISO 시각
  display_time_ko: string;       // 예: "오전 8:45" 또는 "9월 21일"
}

// 종합 종목 분석 데이터 (StockAnalysis)
export interface StockAnalysis {
  id: string;
  symbol_id: string;
  status: 'ACTIVE' | 'PENDING_EVALUATION'; // 데이터 부족 시 'PENDING_EVALUATION' (평가 보류)
  pending_reason_ko?: string;
  
  total_score: number;           // 1.0 ~ 10.0
  score_label: ScoreLabel;
  previous_score?: number;       // 직전 평가 점수 (예: 7.1)
  score_change?: number;         // +0.7, -1.4 등
  
  // 신뢰도 2축 지표
  evidence_sufficiency: EvidenceSufficiency;
  forecast_uncertainty: ForecastUncertainty;

  // 요인별 점수
  factors: Record<FactorType, FactorScore>;
  factor_contributions: Record<FactorType, number>;

  // 설명 및 인과관계
  thesis: ThesisSnapshot;
  easy_explanation_paragraphs: string[]; // 쉬운 설명 2~4개 문단
  score_change_reason_ko?: string;       // 직전 대비 점수가 변한 인과 설명

  // 반대 근거 및 리스크
  counter_thesis_ko: string;     // 현재 긍정/부정 판단을 틀리게 만들 수 있는 내용
  key_risks_ko: string[];

  // 앞으로 확인할 것
  future_checkpoints: FutureCheckpoint[];

  // 전문가용 상세 분석
  deep_dive: DeepDiveAnalysis;

  // 출처 문서 ID 목록
  source_document_ids: string[];

  // 정정 내역 (존재 시)
  corrections?: Correction[];

  // 과거 스냅샷 이력
  history_snapshots: AnalysisSnapshot[];

  // 버전 및 메타데이터
  score_model_version: string;
  input_data_version: string;
  analyzed_at: string;
  display_time_ko: string;
}
