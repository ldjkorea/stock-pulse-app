import { IAIProvider, ExplanationContext } from './aiProvider.interface';
import { ThesisSnapshot, FutureCheckpoint, DeepDiveAnalysis } from '../types/analysis';

export class MockAIProvider implements IAIProvider {
  async generateEasyExplanation(context: ExplanationContext): Promise<string[]> {
    return [
      `${context.name_ko}의 최근 주요 소식과 실적 흐름을 종합 검토했습니다.`,
      `핵심 사업 부문에서 ${context.key_facts.join(', ')} 등의 변화가 확인되었습니다.`,
      `이에 따라 향후 12개월 관점에서의 종합 투자 매력도는 ${context.total_score}점 수준으로 평가됩니다.`,
    ];
  }

  async generateThesis(context: ExplanationContext): Promise<ThesisSnapshot> {
    return {
      headline: `${context.name_ko}의 실적 전망과 펀더멘털 분석 결과입니다.`,
      what_happened: context.key_facts.join('. '),
      impact_on_business: '핵심 수익 모델의 안정성과 경쟁력에 긍정적/부정적 요인이 복합 작용 중입니다.',
      current_verdict: `현재 점수는 ${context.total_score}점입니다.`,
    };
  }

  async explainScoreChange(context: ExplanationContext): Promise<string> {
    if (!context.score_change || context.score_change === 0) {
      return '직전 평가 대비 기업의 중대한 펀더멘털 변화는 감지되지 않아 기존 점수를 유지합니다.';
    }
    const direction = context.score_change > 0 ? '상향' : '하향';
    return `기존 판단 대비 새로 확인된 사실(${context.key_facts[0] || '최신 실적/외부 변수'})로 인해 주요 평가요인이 변동되어, 최종 매력도가 ${Math.abs(context.score_change)}점 ${direction}되었습니다.`;
  }

  async generateCounterThesis(context: ExplanationContext): Promise<{ counter_thesis: string; risks: string[] }> {
    return {
      counter_thesis: '현재 판단을 뒤집을 수 있는 주요 요인은 매크로 불확실성과 전방 산업 투자 사이클의 변동입니다.',
      risks: ['단기 밸류에이션 부담', '글로벌 규제 정책 리스크', '원자재 및 인프라 공급 병목'],
    };
  }

  async generateFutureCheckpoints(context: ExplanationContext): Promise<FutureCheckpoint[]> {
    return [
      {
        id: `CP_${context.symbol_id}_GEN_1`,
        condition_ko: '차기 분기 실적 컨센서스 상회 여부',
        monitoring_focus: '매출 성장률 추이',
        impact_level: 'HIGH',
      },
      {
        id: `CP_${context.symbol_id}_GEN_2`,
        condition_ko: '주요 경쟁사의 신제품 출시 및 점유율 변화',
        monitoring_focus: '시장 지배력 유지력',
        impact_level: 'MEDIUM',
      },
    ];
  }

  async generateDeepDive(context: ExplanationContext): Promise<DeepDiveAnalysis> {
    return {
      revenue_growth_text: '핵심 부문 매출이 견조한 추세를 이어가고 있습니다.',
      profit_and_fcf_text: '현금 창출력과 마진율이 안정적입니다.',
      forward_pe_analysis: '동종 업계 대비 적정 수준의 멀티플을 형성 중입니다.',
      consensus_revision_text: '주요 증권사 추정치가 중립 이상을 유지하고 있습니다.',
      industry_trend_text: '전방 산업의 디지털 전환 수요가 우호적입니다.',
      regulation_and_risk_text: '관련 정책 및 규제 환경을 지속 모니터링할 필요가 있습니다.',
    };
  }
}

export const defaultAIProvider = new MockAIProvider();
