import React, { useState } from 'react';
import { EnrichedPosition } from '../../stores/portfolioStore';
import { FeedHeader } from './FeedHeader';
import { StockCard } from './StockCard';
import { PlusCircle } from 'lucide-react';

interface FeedViewProps {
  positions: EnrichedPosition[];
  onSelectStock: (symbolId: string) => void;
  onOpenPortfolioManage: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  positions,
  onSelectStock,
  onOpenPortfolioManage,
}) => {
  const [isSystemDelayed, setIsSystemDelayed] = useState(false);

  // 중요 변화가 있는 종목 수 (점수 변화가 0이 아니거나 특정 이슈 있는 종목)
  const importantChangesCount = positions.filter(
    (p) => (p.analysis?.score_change !== undefined && Math.abs(p.analysis.score_change) >= 0.5)
  ).length;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24">
      {/* 1. 상단 요약 바 */}
      <FeedHeader
        importantChangesCount={importantChangesCount}
        analyzedStocksCount={positions.length}
        lastCheckedTime="오전 8:45"
        isSystemDelayed={isSystemDelayed}
        onToggleDelaySimulation={() => setIsSystemDelayed((prev) => !prev)}
      />

      {/* 2. 포트폴리오 카드 피드 */}
      {positions.length === 0 ? (
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
        <div>
          {positions.map((item) => (
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
