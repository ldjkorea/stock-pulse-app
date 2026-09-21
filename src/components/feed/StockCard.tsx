import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight, AlertCircle } from 'lucide-react';
import { EnrichedPosition } from '../../stores/portfolioStore';
import { ScoreBadge, TrustBadge } from '../common/Badge';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';

interface StockCardProps {
  item: EnrichedPosition;
  onClick: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({ item, onClick }) => {
  const symbol = SUPPORTED_SYMBOLS.find((s) => s.id === item.symbol_id);
  const analysis = item.analysis;

  const totalScore = analysis?.total_score ?? 5.0;
  const scoreLabel = analysis?.score_label ?? '중립';
  const previousScore = analysis?.previous_score;
  const scoreChange = analysis?.score_change ?? 0;
  const headline = analysis?.thesis.headline || '기업의 주요 경영 지표가 안정적으로 유지되고 있습니다.';
  
  const evidence = analysis?.evidence_sufficiency ?? '보통';
  const uncertainty = analysis?.forecast_uncertainty ?? '보통';
  const displayTime = analysis?.display_time_ko ?? '오전 8:45';

  const isProfit = item.unrealized_profit_amount >= 0;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="w-full text-left p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all cursor-pointer group active:scale-[0.99] mb-4"
    >
      {/* 1. 상단 헤더: 종목명 + 투자 매력도 점수 + 변화량 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {symbol?.name_ko || item.symbol_id}
            </h2>
            <span className="text-xs font-mono font-medium text-slate-400">
              {symbol?.ticker || item.symbol_id}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {symbol?.sector}
          </span>
        </div>

        {/* 점수 영역 */}
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {totalScore.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10</span>
          </div>
          <div className="mt-0.5 flex items-center justify-end gap-1.5">
            <ScoreBadge label={scoreLabel} size="sm" />
            {/* 점수 변화 */}
            {previousScore !== undefined && scoreChange !== 0 ? (
              <span
                className={`inline-flex items-center text-xs font-mono font-bold ${
                  scoreChange > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {previousScore.toFixed(1)} → {totalScore.toFixed(1)}
                {scoreChange > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-mono text-slate-400">
                <Minus className="w-3 h-3" /> 보합
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. 카드 핵심 이유 문장 */}
      <div className="my-3 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
          {headline}
        </p>
      </div>

      {/* 3. 내 상황 영역 (평균매수가, 현재가, 평가손익, 포트폴리오 비중) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            내 상황
          </span>
          {item.is_over_weight_limit && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              한도({item.target_max_weight_percent}%) 초과
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-center bg-slate-50/70 dark:bg-slate-950/40 rounded-xl p-2.5">
          <div>
            <div className="text-[10px] text-slate-400">현재가</div>
            <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
              {item.currency === 'KRW'
                ? `₩${Math.round(item.current_price).toLocaleString()}`
                : `$${item.current_price.toFixed(2)}`}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">평균매수가</div>
            <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
              {item.currency === 'KRW'
                ? `₩${Math.round(item.average_cost).toLocaleString()}`
                : `$${item.average_cost.toFixed(2)}`}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">평가손익</div>
            <div
              className={`text-xs font-bold font-mono mt-0.5 ${
                isProfit
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isProfit ? '+' : ''}
              {item.unrealized_profit_percent.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">보유비중</div>
            <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
              {item.portfolio_weight_percent}%
            </div>
          </div>
        </div>
      </div>

      {/* 4. 하단 메타: 신뢰도 2축 + 분석 기준 시각 + 상세 보기 힌트 */}
      <div className="mt-3 pt-2.5 flex items-center justify-between text-xs">
        <TrustBadge evidence={evidence} uncertainty={uncertainty} />
        
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 group-hover:text-blue-500 transition-colors">
          <span>기준 {displayTime}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
