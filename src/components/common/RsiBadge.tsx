import React from 'react';
import { Zap, Flame, Scale, Info } from 'lucide-react';

interface RsiBadgeProps {
  rsi?: number;
  status?: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  showHint?: boolean;
}

export const RsiBadge: React.FC<RsiBadgeProps> = ({
  rsi = 50,
  status,
  hint,
  size = 'md',
  showHint = true,
}) => {
  // 상태 자동 결정 (명시적이지 않은 경우)
  const resolvedStatus = status || (rsi <= 30 ? 'OVERSOLD' : rsi >= 70 ? 'OVERBOUGHT' : 'NEUTRAL');

  // 스타일 및 라벨 설정
  let colorStyle = '';
  let statusLabel = '';
  let Icon = Scale;

  if (resolvedStatus === 'OVERSOLD') {
    colorStyle = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80';
    statusLabel = '단기 과매도';
    Icon = Zap;
  } else if (resolvedStatus === 'OVERBOUGHT') {
    colorStyle = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
    statusLabel = '단기 과열';
    Icon = Flame;
  } else {
    colorStyle = 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    statusLabel = '수급 균형';
    Icon = Scale;
  }

  const isSmall = size === 'sm';

  return (
    <div className="inline-flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${colorStyle} ${isSmall ? 'text-[10px]' : 'text-xs'}`}>
        <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="font-mono font-bold">RSI {rsi}</span>
        <span className="opacity-40">|</span>
        <span className="font-semibold">{statusLabel}</span>
      </div>

      {showHint && hint && (
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pl-0.5">
          <Info className="w-3 h-3 shrink-0 text-slate-400" />
          <span className="truncate">{hint}</span>
        </div>
      )}
    </div>
  );
};
