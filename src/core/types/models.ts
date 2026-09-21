/**
 * 핵심 도메인 모델 정의
 */

// 종목 마스터 정보
export interface Symbol {
  id: string;             // 예: 'NVDA'
  ticker: string;         // 'NVDA'
  name_ko: string;        // '엔비디아'
  name_en: string;        // 'NVIDIA Corporation'
  sector: string;         // '반도체 & AI 하드웨어'
  currency: 'USD' | 'KRW';
  is_supported: boolean;  // MVP 20개 지원 여부
  description: string;
}

// 사용자 정보
export interface User {
  id: string;
  name: string;
  created_at: string;
  investment_horizon_default?: 'SHORT' | 'MEDIUM' | 'LONG'; // 단기(6개월), 중기(1년), 장기(3년 이상)
}

// 사용자 포트폴리오
export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// 사용자 보유 포지션 (내 상황)
// 중요: 평균매수가(average_cost)는 종목 자체의 투자 매력도 점수 계산에 절대 직접 사용하지 않음.
export interface Position {
  id: string;
  user_id: string;
  portfolio_id: string;
  symbol_id: string;
  quantity: number;                     // 보유수량
  average_cost: number;                 // 평균매수가 (USD 또는 KRW)
  currency: 'USD' | 'KRW';
  target_max_weight_percent?: number;   // 사용자가 설정한 종목별 최대 허용 비중 (예: 20%)
  investment_horizon?: 'SHORT' | 'MEDIUM' | 'LONG'; // 선택적 투자기간
  created_at: string;
  updated_at: string;
}

// 주가 스냅샷
export interface PriceSnapshot {
  id: string;
  symbol_id: string;
  current_price: number;
  change_amount: number;
  change_percent: number;
  market_cap_billions: number;
  as_of: string;
}

// 재무 스냅샷 (전문 분석용)
export interface FinancialSnapshot {
  id: string;
  symbol_id: string;
  revenue_growth_yoy: number;       // 전년비 매출 성장률 (%)
  operating_margin: number;         // 영업이익률 (%)
  net_margin: number;               // 순이익률 (%)
  fcf_growth_yoy: number;           // 잉여현금흐름 성장률 (%)
  roe: number;                      // 자기자본이익률 (%)
  debt_to_equity: number;           // 부채비율 (%)
  as_of: string;
}

// 컨센서스 스냅샷
export interface ConsensusSnapshot {
  id: string;
  symbol_id: string;
  forward_pe: number;               // 선행 P/E
  peg_ratio: number;                // PEG
  target_price_consensus: number;   // 목표주가 평균
  eps_revision_up_count: number;    // EPS 상향 조정 애널리스트 수
  eps_revision_down_count: number;  // EPS 하향 조정 애널리스트 수
  as_of: string;
}

// 팩트 원문 출처 문서
export interface SourceDocument {
  id: string;
  title: string;
  publisher: string;                // 예: 'SEC 공시(10-Q)', 'Bloomberg', 'NVIDIA 어닝콜'
  published_at: string;
  url: string;
  snippet_ko: string;               // 핵심 발췌 번역문
}

// 시장 및 기업 이벤트
export interface MarketEvent {
  id: string;
  symbols: string[];                // 단일 또는 복수 종목 (묶음 알림용)
  event_type: 'EARNINGS' | 'REGULATION' | 'CONTRACT' | 'COMPETITION' | 'MACRO' | 'CORRECTION';
  title: string;
  description_ko: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  occurred_at: string;
  source_doc_ids: string[];
}
