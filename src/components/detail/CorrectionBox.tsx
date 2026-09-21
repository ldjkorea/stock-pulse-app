import React from 'react';
import { AlertOctagon, CheckCheck } from 'lucide-react';
import { Correction } from '../../core/types/analysis';

interface CorrectionBoxProps {
  corrections?: Correction[];
}

export const CorrectionBox: React.FC<CorrectionBoxProps> = ({ corrections }) => {
  if (!corrections || corrections.length === 0) return null;

  return (
    <section className="mb-6 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100">
      <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
        <AlertOctagon className="w-5 h-5" />
        <h2 className="text-base font-black tracking-tight">
          공시 데이터 정정 내역 (Correction)
        </h2>
      </div>

      <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mb-3">
        잘못된 정보나 데이터 오류가 확인될 경우 과거 기록을 삭제하지 않고 정정 사유와 판단에 미친 영향을 투명하게 기록합니다.
      </p>

      <div className="space-y-3">
        {corrections.map((c) => (
          <div
            key={c.id}
            className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-amber-500/20 text-xs space-y-2 text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>정정 시각: {c.corrected_at}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">정정 완료</span>
            </div>

            <div>
              <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                기존 분석 내용 (오류)
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-normal">
                {c.previous_fact}
              </p>
            </div>

            <div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                새로 확인되어 정정된 사실
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-normal">
                {c.corrected_fact}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              <CheckCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>현재 판단 영향:</strong> {c.impact_on_score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
