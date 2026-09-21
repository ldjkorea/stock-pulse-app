import React, { useState } from 'react';
import { TenIndicatorItem } from '../../core/types/analysis';
import { getTenIndicatorsForSymbol } from '../../core/utils/actionSignalHelper';
import { CheckCircle2, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Layers, Activity } from 'lucide-react';

interface TenIndicatorsBoxProps {
  symbolId: string;
  symbolName: string;
  rsiValue?: number;
}

export const TenIndicatorsBox: React.FC<TenIndicatorsBoxProps> = ({
  symbolId,
  symbolName,
  rsiValue,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const indicators: TenIndicatorItem[] = getTenIndicatorsForSymbol(symbolId, rsiValue);

  // 카테고리별 그룹화
  const categories: Array<TenIndicatorItem['category']> = [
    '수급/모멘텀',
    '실적/성장성',
    '밸류에이션',
    '재무/리스크',
  ];

  // 긍정 지표 수 집계
  const positiveCount = indicators.filter((i) => i.status === 'POSITIVE').length;

  return (
    <div className="my-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden transition-all">
      {/* 1. 헤더 */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                10대 핵심 투자 지표 종합 점검표
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                10개 중 {positiveCount}개 긍정
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              RSI 수급부터 재무·밸류에이션까지 {symbolName}의 종합 펀더멘털을 10가지 렌즈로 진단
            </p>
          </div>
        </div>
        <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. 본문 지표 그리드 */}
      {isExpanded && (
        <div className="p-4 space-y-4 text-xs">
          {categories.map((cat) => {
            const catIndicators = indicators.filter((i) => i.category === cat);
            if (catIndicators.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {cat}
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {catIndicators.map((ind) => {
                    const isPositive = ind.status === 'POSITIVE';
                    const isCaution = ind.status === 'CAUTION';

                    return (
                      <div
                        key={ind.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isPositive
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                            : isCaution
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40'
                            : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {isPositive ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : isCaution ? (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                            ) : (
                              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {ind.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 dark:text-white text-xs">
                              {ind.current_value}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] ${
                                isPositive
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : isCaution
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {ind.status_label}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {ind.comment}
                        </p>

                        {ind.benchmark && (
                          <div className="mt-1 text-[10px] text-slate-400 font-mono">
                            기준치: {ind.benchmark}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
