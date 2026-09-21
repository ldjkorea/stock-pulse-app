import { IDataProvider } from './dataProvider.interface';
import { Symbol, PriceSnapshot, FinancialSnapshot, ConsensusSnapshot, SourceDocument, MarketEvent } from '../types/models';
import { StockAnalysis, AnalysisSnapshot, Correction } from '../types/analysis';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';
import {
  MOCK_PRICES,
  MOCK_FINANCIALS,
  MOCK_CONSENSUS,
  MOCK_SOURCE_DOCS,
  MOCK_ANALYSES,
  MOCK_CORRECTIONS,
  getMockPriceForSymbol,
} from '../../mock/mockScenarios';
import { calculateScore } from '../engine/scoreEngine';

import { realtimeMarketService } from '../services/realtimeMarketService';

export class MockDataProvider implements IDataProvider {
  async getSupportedSymbols(): Promise<Symbol[]> {
    return SUPPORTED_SYMBOLS;
  }

  async searchSymbol(query: string): Promise<{ symbol?: Symbol; isSupported: boolean; message?: string }> {
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return { isSupported: false, message: '종목명을 입력해주세요.' };

    const matched = SUPPORTED_SYMBOLS.find(
      (s) =>
        s.ticker.toUpperCase() === cleanQuery ||
        s.name_ko.includes(query.trim()) ||
        s.name_en.toUpperCase().includes(cleanQuery)
    );

    if (matched) {
      return { symbol: matched, isSupported: true };
    }

    // 미지원 종목
    return {
      isSupported: false,
      message: '현재 분석을 지원하지 않는 종목입니다.',
    };
  }

  async getPriceSnapshot(symbolId: string): Promise<PriceSnapshot | null> {
    const realPrice = realtimeMarketService.getPrice(symbolId);
    if (realPrice) return realPrice;
    return getMockPriceForSymbol(symbolId);
  }

  async getFinancialSnapshot(symbolId: string): Promise<FinancialSnapshot | null> {
    return MOCK_FINANCIALS[symbolId] || {
      id: `FS_${symbolId}`,
      symbol_id: symbolId,
      revenue_growth_yoy: 12.0,
      operating_margin: 28.0,
      net_margin: 22.0,
      fcf_growth_yoy: 15.0,
      roe: 25.0,
      debt_to_equity: 40.0,
      as_of: 'FY2026 Q2',
    };
  }

  async getConsensusSnapshot(symbolId: string): Promise<ConsensusSnapshot | null> {
    return MOCK_CONSENSUS[symbolId] || {
      id: `CS_${symbolId}`,
      symbol_id: symbolId,
      forward_pe: 24.5,
      peg_ratio: 1.5,
      target_price_consensus: 230.0,
      eps_revision_up_count: 18,
      eps_revision_down_count: 6,
      as_of: '2026-09-20',
    };
  }

  async getStockAnalysis(symbolId: string): Promise<StockAnalysis | null> {
    if (MOCK_ANALYSES[symbolId]) {
      return MOCK_ANALYSES[symbolId];
    }

    // 지원 목록에 있는 기타 종목인 경우 ScoreEngine을 사용해 기본 생성
    const symbol = SUPPORTED_SYMBOLS.find((s) => s.id === symbolId);
    if (!symbol) return null;

    // Score Engine에 입력할 요인 점수 계산
    const scoreResult = calculateScore({
      symbol_id: symbolId,
      input_data_version: '20260921-0845',
      factor_inputs: {
        PERFORMANCE_CASH: { raw_score: 75, reason_ko: '안정적인 분기 실적 및 견조한 영업현금흐름' },
        VALUATION: { raw_score: 65, reason_ko: '업종 평균 수준의 적정 밸류에이션 형성' },
        MARKET_EXPECTATION: { raw_score: 70, reason_ko: '컨센서스 대체로 부합하는 중립적 전망' },
        INDUSTRY_ENVIRONMENT: { raw_score: 72, reason_ko: '글로벌 업황 안정세 지속' },
        FINANCIAL_RESILIENCE: { raw_score: 85, reason_ko: '건전한 대차대조표와 충분한 유동성' },
      },
    });

    return {
      id: `AN_${symbolId}_AUTO`,
      symbol_id: symbolId,
      status: scoreResult.status,
      total_score: scoreResult.total_score,
      score_label: scoreResult.score_label,
      previous_score: scoreResult.total_score,
      score_change: 0.0,
      evidence_sufficiency: '보통',
      forecast_uncertainty: '보통',
      factors: scoreResult.factor_scores,
      factor_contributions: scoreResult.factor_contributions,
      thesis: {
        headline: `${symbol.name_ko}의 펀더멘털은 견고하며 업종 내 안정적 지위를 유지하고 있습니다.`,
        what_happened: '주요 경영 지표가 시장 예상치에 부합하며 특이 돌발 변수는 발생하지 않았습니다.',
        impact_on_business: '핵심 사업 부문의 현금 창출 능력이 지속되고 있습니다.',
        current_verdict: '균형 잡힌 지표를 바탕으로 중립 이상의 투자 매력도를 보이고 있습니다.',
      },
      easy_explanation_paragraphs: [
        `${symbol.name_ko}의 최근 실적과 사업 환경은 큰 돌발 변수 없이 안정적으로 유지되고 있습니다.`,
        '업종 전반의 수요 흐름이 견조하며 회사의 재무 구조 역시 건전한 수준입니다.',
        '향후 12개월 관점에서 무난하고 안정적인 투자 매력도를 나타내고 있습니다.',
      ],
      counter_thesis_ko: '글로벌 경기 둔화 또는 환율 변동성 확대 시 단기 수요 둔화 가능성.',
      key_risks_ko: ['업종 내 경쟁 심화', '매크로 금리 변동성'],
      future_checkpoints: [
        {
          id: `CP_${symbolId}_01`,
          condition_ko: '다음 분기 실적 가이던스 달성 여부',
          monitoring_focus: '실적 일관성 점검',
          impact_level: 'MEDIUM',
        },
      ],
      deep_dive: {
        revenue_growth_text: '전년비 12% 수준의 완만한 성장 유지 중입니다.',
        profit_and_fcf_text: '영업이익률 28%로 업계 평균 상회.',
        forward_pe_analysis: '선행 P/E 24.5배로 적정 수준 평가.',
        consensus_revision_text: '목표주가 및 EPS 전망치 횡보세 유지.',
        industry_trend_text: '안정적 산업 생태계 유지.',
        regulation_and_risk_text: '특이 규제 리스크 제한적.',
      },
      source_document_ids: [],
      history_snapshots: [],
      score_model_version: scoreResult.score_model_version,
      input_data_version: scoreResult.input_data_version,
      analyzed_at: scoreResult.analysis_timestamp,
      display_time_ko: '오전 8:45',
    };
  }

  async getAnalysisHistory(symbolId: string): Promise<AnalysisSnapshot[]> {
    const analysis = MOCK_ANALYSES[symbolId];
    return analysis ? analysis.history_snapshots : [];
  }

  async getCorrections(symbolId: string): Promise<Correction[]> {
    return MOCK_CORRECTIONS[symbolId] || [];
  }

  async getSourceDocuments(docIds: string[]): Promise<SourceDocument[]> {
    return docIds.map((id) => MOCK_SOURCE_DOCS[id]).filter(Boolean);
  }

  async getMarketEvents(): Promise<MarketEvent[]> {
    return [
      {
        id: 'EV_001',
        symbols: ['NVDA', 'AVGO'],
        event_type: 'REGULATION',
        title: '미국 상무부 첨단 컴퓨팅 및 네트워킹 수출 규제 가이드 개정 예고',
        description_ko: '해외 우회 수출 국가에 대한 라이선스 심사 요건 강화 발표',
        importance: 'HIGH',
        occurred_at: '2026-09-21T08:00:00Z',
        source_doc_ids: ['DOC_US_COMMERCE_RULE'],
      },
      {
        id: 'EV_002',
        symbols: ['LLY'],
        event_type: 'EARNINGS',
        title: '일라이 릴리 경구용 비만 치료제 임상 3상 긍정적 데이터 발표',
        description_ko: '15% 이상 감량 및 우수한 내약성 확인으로 시장 기대 급증',
        importance: 'HIGH',
        occurred_at: '2026-09-20T16:00:00Z',
        source_doc_ids: ['DOC_LLY_TRIAL'],
      },
    ];
  }
}

export const defaultDataProvider = new MockDataProvider();
