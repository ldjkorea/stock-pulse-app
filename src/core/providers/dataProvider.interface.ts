import { Symbol, PriceSnapshot, FinancialSnapshot, ConsensusSnapshot, SourceDocument, MarketEvent } from '../types/models';
import { StockAnalysis, AnalysisSnapshot, Correction } from '../types/analysis';

/**
 * Data Provider 추상화 인터페이스
 * 향후 실제 증권/금융 API(Polygon, AlphaVantage, SEC EDGAR 등)로 원활하게 교체 가능하도록 설계
 */
export interface IDataProvider {
  // 지원 종목 목록 조회
  getSupportedSymbols(): Promise<Symbol[]>;
  
  // 특정 종목 검색 (지원 여부 판별)
  searchSymbol(query: string): Promise<{ symbol?: Symbol; isSupported: boolean; message?: string }>;

  // 최신 주가 스냅샷 조회
  getPriceSnapshot(symbolId: string): Promise<PriceSnapshot | null>;

  // 재무 및 컨센서스 데이터 조회
  getFinancialSnapshot(symbolId: string): Promise<FinancialSnapshot | null>;
  getConsensusSnapshot(symbolId: string): Promise<ConsensusSnapshot | null>;

  // 종목 종합 분석 조회
  getStockAnalysis(symbolId: string): Promise<StockAnalysis | null>;

  // 종목의 과거 스냅샷 타임라인 조회
  getAnalysisHistory(symbolId: string): Promise<AnalysisSnapshot[]>;

  // 정정 내역(Correction) 조회
  getCorrections(symbolId: string): Promise<Correction[]>;

  // 출처 문서 조회
  getSourceDocuments(docIds: string[]): Promise<SourceDocument[]>;

  // 시장 이벤트 조회
  getMarketEvents(): Promise<MarketEvent[]>;
}
