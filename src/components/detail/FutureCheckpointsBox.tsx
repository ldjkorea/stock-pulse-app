import React from 'react';
import { CheckSquare, ArrowUpRight } from 'lucide-react';
import { FutureCheckpoint } from '../../core/types/analysis';

interface FutureCheckpointsBoxProps {
  checkpoints: FutureCheckpoint[];
}

export const FutureCheckpointsBox: React.FC<FutureCheckpointsBoxProps> = ({ checkpoints }) => {
  return (
    <section className="mb-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            앞으로 확인할 것
          </h2>
        </div>
        <span className="text-[10px] text-slate-400">향후 판단 변경 트리거</span>
      </div>

      <div className="space-y-2.5">
        {checkpoints.map((cp, idx) => (
          <div
            key={cp.id || idx}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-normal">
                {cp.condition_ko}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span>집중 포인트: {cp.monitoring_focus}</span>
                <span>•</span>
                <span
                  className={`font-semibold ${
                    cp.impact_level === 'HIGH' ? 'text-rose-500' : 'text-amber-500'
                  }`}
                >
                  중요도 {cp.impact_level === 'HIGH' ? '높음' : '보통'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
