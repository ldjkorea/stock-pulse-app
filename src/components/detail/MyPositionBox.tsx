import React from 'react';
import { UserCheck, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EnrichedPosition } from '../../stores/portfolioStore';
import { ScoreLabel } from '../../core/types/analysis';

interface MyPositionBoxProps {
  position?: EnrichedPosition;
  scoreLabel: ScoreLabel;
  symbolName: string;
}

export const MyPositionBox: React.FC<MyPositionBoxProps> = ({
  position,
  scoreLabel,
  symbolName,
}) => {
  if (!position) {
    return (
      <section className="mb-6 p-5 rounded-3xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
          <UserCheck className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-black tracking-tight">내 상황</h2>
        </div>
        <p className="text-xs text-slate-500">
          현재 포트폴리오에 등록되지 않은 종목입니다. 포트폴리오에 추가하면 평균매수가와 비중 관리 정보를 확인할 수 있습니다.
        </p>
      </section>
    );
  }

  const isProfit = position.unrealized_profit_amount >= 0;
  const isOverLimit = position.is_over_weight_limit;
  const targetLimit = position.target_max_weight_percent;

  return (
    <section className="mb-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
      {/* 타이틀 및 원칙 고지 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            내 상황
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          매수단가는 종목 점수에 미반영
        </span>
      </div>

      {/* 개인 포지션 지표 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mb-3 text-center">
        <div>
          <span className="text-[10px] text-slate-400">현재가</span>
          <p className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
            ${position.current_price.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400">평균매수가 ({position.quantity}주)</span>
          <p className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
            ${position.average_cost.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400">미실현 손익</span>
          <p
            className={`text-sm font-black font-mono mt-0.5 ${
              isProfit
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isProfit ? '+' : ''}
            {position.unrealized_profit_percent.toFixed(1)}%
            <span className="text-[10px] font-normal block text-slate-400">
              (${position.unrealized_profit_amount > 0 ? '+' : ''}
              {position.unrealized_profit_amount.toFixed(0)})
            </span>
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400">포트폴리오 비중</span>
          <p className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">
            {position.portfolio_weight_percent}%
            {targetLimit && (
              <span className="text-[10px] font-normal block text-slate-400">
                한도 {targetLimit}%
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 공통 종목 평가와 개인 보유 상황 분리 해석 안내 */}
      <div
        className={`p-3 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
          isOverLimit
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
        }`}
      >
        {isOverLimit ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <p>
            종목 자체 평가는 <strong>[{scoreLabel}]</strong>입니다.
            {isOverLimit ? (
              <span>
                {' '}
                다만 현재 포트폴리오에서 <strong>{position.portfolio_weight_percent}%</strong>를
                차지하고 있어 사용자가 설정한 한도(<strong>{targetLimit}%</strong>)보다 높습니다.
                리스크 관리를 위해 비중 조절을 검토해보세요.
              </span>
            ) : (
              <span>
                {' '}
                현재 포트폴리오 비중({position.portfolio_weight_percent}%)은 설정 한도 내에서
                안정적으로 유지되고 있습니다.
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
};
