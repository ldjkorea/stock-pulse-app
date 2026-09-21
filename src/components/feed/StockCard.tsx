import React from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { EnrichedPosition } from '../../stores/portfolioStore';
import { ActionSignalBadge } from '../common/ActionSignalBadge';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';
import { calculateActionSignal } from '../../core/utils/actionSignalHelper';

interface StockCardProps {
  item: EnrichedPosition;
  onClick: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({ item, onClick }) => {
  const symbol = SUPPORTED_SYMBOLS.find((s) => s.id === item.symbol_id);
  const analysis = item.analysis;

  const totalScore = analysis?.total_score ?? 5.0;
  const previousScore = analysis?.previous_score;
  const scoreChange = analysis?.score_change ?? 0;
  const headline = analysis?.thesis.headline || '기업의 주요 경영 지표가 안정적으로 유지되고 있습니다.';
  const changeReason = analysis?.score_change_reason_ko;

  const isProfit = item.unrealized_profit_amount >= 0;

  // 4) 5단계 투자 제안 및 그렇게 생각하는 근거 (펀더멘털 점수 + 실시간 RSI + 내 평단가/수익률/비중 3차원 맞춤 계산)
  const actionInfo = calculateActionSignal(totalScore, item.price_snapshot?.rsi, {
    average_cost: item.average_cost,
    current_price: item.current_price,
    unrealized_profit_percent: item.unrealized_profit_percent,
    portfolio_weight_percent: item.portfolio_weight_percent,
    target_max_weight_percent: item.target_max_weight_percent,
    is_over_weight_limit: item.is_over_weight_limit,
  });

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="w-full text-left p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all cursor-pointer group active:scale-[0.99] mb-4 space-y-3.5"
    >
      {/* [1] 종목명 & 점수 & 5단계 행동 제안 뱃지 */}
      <div className="flex items-start justify-between">
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

        {/* 1) 왜 몇 점인가: 점수 블록 & 5단계 제안 */}
        <div className="text-right flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {totalScore.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10</span>
          </div>
          <ActionSignalBadge label={actionInfo.label} size="sm" />
        </div>
      </div>

      {/* [2] 1) 왜 이 점수이고, 4) 5단계 제안의 근거는 무엇인가? */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            왜 {totalScore.toFixed(1)}점인가
          </span>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {headline}
          </p>
        </div>

        <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-start gap-1 text-[11px]">
          <span className="font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
            [{actionInfo.label} 근거]:
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {actionInfo.timing_hint}
          </span>
        </div>
      </div>

      {/* [3] 직전 대비 달라진 것 */}
      {previousScore !== undefined && (
        <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
              직전 대비 변화:
            </span>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
              {changeReason || (scoreChange > 0 ? '실적 및 수급 지표 개선' : scoreChange < 0 ? '시장 기대치 하향 조정' : '주요 펀더멘털 안정 유지')}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono font-bold text-xs shrink-0 ml-2">
            <span className="text-slate-400">{previousScore.toFixed(1)}</span>
            <span className="text-slate-300">→</span>
            <span className={scoreChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : scoreChange < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}>
              {totalScore.toFixed(1)} ({scoreChange >= 0 ? '+' : ''}{scoreChange.toFixed(1)})
            </span>
          </div>
        </div>
      )}

      {/* [4] 내 상황 (현재가, 평균매수가, 평가손익, 보유비중) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
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
            <div className="text-[10px] text-slate-400">내 평균매수가</div>
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

      {/* 카드 하단 푸터: 10대 지표 및 상세 분석 보기 */}
      <div className="pt-1 flex items-center justify-end text-[11px] text-slate-400 group-hover:text-blue-500 font-semibold transition-colors">
        <span>10대 지표 상세분석 보기</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
