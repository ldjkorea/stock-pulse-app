import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { ThesisSnapshot } from '../../core/types/analysis';

interface EasyExplanationProps {
  score: number;
  paragraphs: string[];
  thesis: ThesisSnapshot;
}

export const EasyExplanation: React.FC<EasyExplanationProps> = ({
  score,
  paragraphs,
  thesis,
}) => {
  return (
    <section className="mb-6 p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
      {/* 섹션 제목 */}
      <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
        <HelpCircle className="w-5 h-5" />
        <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
          왜 {score.toFixed(1)}점인가요?
        </h2>
      </div>

      {/* 2~4개 문단 쉬운 설명 */}
      <div className="space-y-3 mb-4">
        {paragraphs.map((p, idx) => (
          <p
            key={idx}
            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal"
          >
            {p}
          </p>
        ))}
      </div>

      {/* 무슨 일 -> 기업 영향 -> 현재 판단 3단계 인과 구조 박스 */}
      <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-blue-100/80 dark:border-blue-900/30 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 w-20">
            무슨 일인가
          </span>
          <span className="text-slate-700 dark:text-slate-300 leading-normal">
            {thesis.what_happened}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0 w-20">
            기업 영향
          </span>
          <span className="text-slate-700 dark:text-slate-300 leading-normal">
            {thesis.impact_on_business}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 w-20">
            현재 판단
          </span>
          <span className="text-slate-700 dark:text-slate-300 leading-normal font-medium">
            {thesis.current_verdict}
          </span>
        </div>
      </div>
    </section>
  );
};
