import React from 'react';
import { ActionSignalLabel } from '../../core/types/analysis';
import { Sparkles, TrendingUp, Pause, TrendingDown, AlertOctagon } from 'lucide-react';

interface ActionSignalBadgeProps {
  label: ActionSignalLabel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ActionSignalBadge: React.FC<ActionSignalBadgeProps> = ({
  label,
  size = 'md',
  showIcon = true,
}) => {
  let colorStyles = '';
  let icon = null;

  switch (label) {
    case '강한 매수 제안':
      colorStyles =
        'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20 border-emerald-400/40';
      icon = <Sparkles className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
      break;

    case '매수 제안':
      colorStyles =
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      icon = <TrendingUp className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
      break;

    case '보류':
      colorStyles =
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      icon = <Pause className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
      break;

    case '매도 제안':
      colorStyles =
        'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700';
      icon = <TrendingDown className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
      break;

    case '강한 매도 제안':
      colorStyles =
        'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm shadow-rose-500/20 border-rose-400/40';
      icon = <AlertOctagon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 rounded-md font-bold'
      : size === 'lg'
      ? 'text-xs px-3 py-1.5 rounded-xl font-extrabold tracking-tight'
      : 'text-[11px] px-2.5 py-1 rounded-lg font-black tracking-tight';

  return (
    <span
      className={`inline-flex items-center gap-1 border ${sizeClasses} ${colorStyles} transition-all`}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};
