import { FactorType } from '../types/analysis';

/**
 * 5대 요인 가중치 상수
 * 총합은 정확히 1.0 (100%)
 */
export const FACTOR_WEIGHTS: Record<FactorType, number> = {
  PERFORMANCE_CASH: 0.25,     // 실적·현금창출 25%
  VALUATION: 0.25,            // 밸류에이션 25%
  MARKET_EXPECTATION: 0.20,   // 시장 기대 변화 20%
  INDUSTRY_ENVIRONMENT: 0.15, // 산업·외부환경 15%
  FINANCIAL_RESILIENCE: 0.15,  // 재무 회복력 15%
};

export const CURRENT_SCORE_MODEL_VERSION = 'v1.0.0';
