import React from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';

interface CounterThesisBoxProps {
  counterThesis: string;
  risks: string[];
}

export const CounterThesisBox: React.FC<CounterThesisBoxProps> = ({
  counterThesis,
  risks,
}) => {
  return (
    <section className="mb-6 p-5 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
      <div className="flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400">
        <ShieldAlert className="w-5 h-5" />
        <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
          반대 근거 및 주요 리스크
        </h2>
      </div>

      {/* 현재 판단을 틀리게 만들 수 있는 내용 */}
      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-rose-100 dark:border-rose-900/30 mb-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">
          현재 판단을 뒤집을 수 있는 요인
        </span>
        {counterThesis}
      </div>

      {/* 핵심 리스크 불릿 리스트 */}
      {risks && risks.length > 0 && (
        <div className="space-y-1.5 pl-1">
          <span className="text-[11px] font-bold text-slate-400">
            모니터링 대상 리스크:
          </span>
          {risks.map((risk, idx) => (
            <div
              key={idx}
              className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{risk}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
