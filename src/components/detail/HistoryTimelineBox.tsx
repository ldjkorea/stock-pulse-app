import React from 'react';
import { History, Calendar, CheckCircle2 } from 'lucide-react';
import { AnalysisSnapshot } from '../../core/types/analysis';

interface HistoryTimelineBoxProps {
  snapshots: AnalysisSnapshot[];
  currentScore: number;
}

export const HistoryTimelineBox: React.FC<HistoryTimelineBoxProps> = ({
  snapshots,
  currentScore,
}) => {
  if (snapshots.length === 0) return null;

  return (
    <section className="mb-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            과거 판단 이력 타임라인
          </h2>
        </div>
        <span className="text-[10px] text-slate-400">불변 스냅샷 보존</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {snapshots.map((snap, idx) => {
          const isLatest = idx === snapshots.length - 1;

          return (
            <div key={snap.id} className="relative group">
              {/* 타임라인 노드 점 */}
              <div
                className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  isLatest
                    ? 'bg-blue-600 border-white dark:border-slate-900 text-white ring-2 ring-blue-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                }`}
              >
                {isLatest && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              {/* 스냅샷 카드 */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {snap.display_time_ko}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {snap.total_score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">점</span>
                  </div>
                </div>

                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {snap.thesis.headline}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {snap.thesis.what_happened}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
