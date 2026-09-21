import React from 'react';
import { ScoreLabel, EvidenceSufficiency, ForecastUncertainty } from '../../core/types/analysis';

// 점수 라벨 배지 컴포넌트
export const ScoreBadge: React.FC<{ label: ScoreLabel; score?: number; size?: 'sm' | 'md' | 'lg' }> = ({
  label,
  score,
  size = 'md',
}) => {
  const getColors = () => {
    switch (label) {
      case '매우 우호적':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case '우호적':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case '중립':
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
      case '불리':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case '매우 불리':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-sm px-2.5 py-1 font-semibold',
    lg: 'text-base px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${getColors()} ${sizeClasses}`}
    >
      {score !== undefined && (
        <span className="font-mono">{score.toFixed(1)}</span>
      )}
      <span>{label}</span>
    </span>
  );
};

// 신뢰도 2축 배지 컴포넌트 (근거 충실도 / 전망 불확실성 분리)
export const TrustBadge: React.FC<{
  evidence: EvidenceSufficiency;
  uncertainty: ForecastUncertainty;
}> = ({ evidence, uncertainty }) => {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">근거</span>
        <span className="font-medium text-slate-700 dark:text-slate-200">{evidence}</span>
      </span>
      <span className="text-slate-300 dark:text-slate-600">•</span>
      <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">불확실성</span>
        <span className="font-medium text-slate-700 dark:text-slate-200">{uncertainty}</span>
      </span>
    </div>
  );
};
