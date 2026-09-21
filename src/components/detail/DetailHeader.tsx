import React from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Share2 } from 'lucide-react';
import { StockAnalysis } from '../../core/types/analysis';
import { Symbol } from '../../core/types/models';
import { ScoreBadge, TrustBadge } from '../common/Badge';

interface DetailHeaderProps {
  symbol: Symbol;
  analysis: StockAnalysis;
  onBack: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({ symbol, analysis, onBack }) => {
  const isProfit = (analysis.score_change ?? 0) > 0;
  const isLoss = (analysis.score_change ?? 0) < 0;

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 -mx-4 px-4 py-3 mb-4">
      {/* 뒤로가기 & 상단 액션 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          카드 피드로 돌아가기
        </button>

        <div className="text-[11px] text-slate-400 font-mono">
          기준 {analysis.display_time_ko}
        </div>
      </div>

      {/* A. 현재 결론 섹션 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {symbol.name_ko}
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {symbol.ticker}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{symbol.sector}</span>
            <span>•</span>
            <TrustBadge
              evidence={analysis.evidence_sufficiency}
              uncertainty={analysis.forecast_uncertainty}
            />
          </div>
        </div>

        {/* 점수 요약 블록 */}
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {analysis.total_score.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 10</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <ScoreBadge label={analysis.score_label} size="sm" />
            {analysis.previous_score !== undefined && (
              <span
                className={`inline-flex items-center text-xs font-mono font-bold ${
                  isProfit
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isLoss
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                이전 {analysis.previous_score.toFixed(1)}
                {isProfit && <ArrowUpRight className="w-3.5 h-3.5" />}
                {isLoss && <ArrowDownRight className="w-3.5 h-3.5" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
