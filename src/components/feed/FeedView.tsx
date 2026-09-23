import React, { useState } from 'react';
import { EnrichedPosition } from '../../stores/portfolioStore';
import { FeedHeader, ImportantChangeItem } from './FeedHeader';
import { StockCard } from './StockCard';
import { PlusCircle, Sparkles } from 'lucide-react';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';

interface FeedViewProps {
  positions: EnrichedPosition[];
  onSelectStock: (symbolId: string) => void;
  onOpenPortfolioManage: () => void;
  onOpenSmartImport?: () => void;
  // 실시간 금융 시세 연동 모듈
  isLiveStreaming?: boolean;
  isRefreshing?: boolean;
  lastRefreshedTime?: string;
  onRefreshMarketPrices?: () => void;
  onToggleLiveStreaming?: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  positions,
  onSelectStock,
  onOpenPortfolioManage,
  onOpenSmartImport,
  isLiveStreaming = true,
  isRefreshing = false,
  lastRefreshedTime,
  onRefreshMarketPrices,
  onToggleLiveStreaming,
}) => {
  const [isSystemDelayed, setIsSystemDelayed] = useState(false);

  // 중복 종목 자동 방어 (symbol_id 기준 고유화)
  const uniquePositionsMap = new Map<string, EnrichedPosition>();
  positions.forEach((p) => {
    if (!uniquePositionsMap.has(p.symbol_id)) {
      uniquePositionsMap.set(p.symbol_id, p);
    }
  });
  const displayPositions = Array.from(uniquePositionsMap.values());

  // 중요 변화가 있는 종목 추출 (점수 변화가 유의미하게 발생한 종목)
  const importantChangeItems: ImportantChangeItem[] = displayPositions
    .filter(
      (p) => p.analysis?.score_change !== undefined && Math.abs(p.analysis.score_change) >= 0.3
    )
    .map((p) => {
      const sym = SUPPORTED_SYMBOLS.find((s) => s.id === p.symbol_id);
      return {
        symbolId: p.symbol_id,
        nameKo: sym?.name_ko || p.symbol_id,
        ticker: sym?.ticker || p.symbol_id,
        scoreChange: p.analysis!.score_change!,
        currentScore: p.analysis!.total_score,
        reason: p.analysis!.score_change_reason_ko || p.analysis!.thesis?.headline || '펀더멘털 및 시장 기대 변동 감지',
      };
    });

  const importantChangesCount = importantChangeItems.length;

  // 현재 시각 기준 마지막 정상 확인 시각 (최신 갱신 시간 또는 직전 5분 전)
  const dynamicLastCheckedTime =
    lastRefreshedTime ||
    new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 md:pb-12">
      {/* 1. 상단 요약 바 & 실시간 체결 시세 컨트롤 */}
      <FeedHeader
        importantChangesCount={importantChangesCount}
        importantChanges={importantChangeItems}
        onSelectStock={onSelectStock}
        analyzedStocksCount={positions.length}
        lastCheckedTime={dynamicLastCheckedTime}
        isSystemDelayed={isSystemDelayed}
        onToggleDelaySimulation={() => setIsSystemDelayed((prev) => !prev)}
        isLiveStreaming={isLiveStreaming}
        isRefreshing={isRefreshing}
        lastRefreshedTime={lastRefreshedTime}
        onRefreshMarketPrices={onRefreshMarketPrices}
        onToggleLiveStreaming={onToggleLiveStreaming}
      />

      {/* 1.5 첫 화면 스마트 등록 배너 */}
      {onOpenSmartImport && (
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white">
                내 주식 한번에 넣기
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                대략 적거나 증권사 복사본 붙여넣기
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSmartImport}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>스마트 등록</span>
          </button>
        </div>
      )}

      {/* 2. 포트폴리오 카드 피드: 모바일 1열 / 태블릿 2열 / PC 와이드 3열 그리드 */}
      {displayPositions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            등록된 종목이 없습니다.
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            관심 종목을 등록하고 투자 매력도 변화를 실시간으로 확인해보세요.
          </p>
          <button
            onClick={onOpenPortfolioManage}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            종목 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPositions.map((item) => (
            <StockCard
              key={item.id}
              item={item}
              onClick={() => onSelectStock(item.symbol_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
