import { ThesisSnapshot, FutureCheckpoint, DeepDiveAnalysis } from '../types/analysis';

export interface ExplanationContext {
  symbol_id: string;
  name_ko: string;
  total_score: number;
  score_change?: number;
  changed_factors?: string[];
  key_facts: string[];
}

/**
 * AI Explanation Provider 추상화 인터페이스
 * 향후 실제 LLM(Gemini 2.5 Flash, Claude 등)을 연결할 수 있는 인터페이스
 * 
 * 원칙:
 * 1. AI는 절대 임의의 최종 점수를 생성하지 않음 (점수는 Score Engine 담당)
 * 2. 데이터가 없을 때 억지로 숫자를 지어내지 않음
 * 3. 사실 추출, 중복 기사 필터링, 일반인이 이해하기 쉬운 한국어 인과 설명 생성 담당
 */
export interface IAIProvider {
  // 쉬운 설명 2~4개 문단 생성 (무슨 일 발생 -> 기업에 미치는 영향 -> 현재 판단)
  generateEasyExplanation(context: ExplanationContext): Promise<string[]>;

  // 핵심 투자 논리(Thesis) 스냅샷 생성
  generateThesis(context: ExplanationContext): Promise<ThesisSnapshot>;

  // 점수 변화 인과관계 설명 생성 (기존 판단 -> 새로 확인된 사실 -> 요인 변화 -> 점수 변동 이유)
  explainScoreChange(context: ExplanationContext): Promise<string>;

  // 현재 판단에 대한 반대 근거 및 핵심 리스크 생성
  generateCounterThesis(context: ExplanationContext): Promise<{ counter_thesis: string; risks: string[] }>;

  // 앞으로 확인해야 할 핵심 조건(1~3개) 생성
  generateFutureCheckpoints(context: ExplanationContext): Promise<FutureCheckpoint[]>;

  // 전문가용 상세 분석 코멘터리 생성
  generateDeepDive(context: ExplanationContext): Promise<DeepDiveAnalysis>;
}
