import React from 'react';
import { GitCompare, ArrowUpRight, ArrowDownRight, Minus, CornerDownRight } from 'lucide-react';
import { FactorType, FactorScore } from '../../core/types/analysis';

interface WhatChangedProps {
  scoreChange?: number;
  scoreChangeReason?: string;
  previousScore?: number;
  currentScore: number;
  factors: Record<FactorType, FactorScore>;
}

export const WhatChanged: React.FC<WhatChangedProps> = ({
  scoreChange = 0,
  scoreChangeReason,
  previousScore,
  currentScore,
  factors,
}) => {
  const hasChange = scoreChange !== 0 && previousScore !== undefined;

  // 기여도 변화가 있는 요인들 필터링
  const changedFactors = Object.values(factors).filter(
    (f) => f.change_vs_previous !== undefined && f.change_vs_previous !== 0
  );

  return (
    <section className="mb-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            무엇이 달라졌나 (직전 대비)
          </h2>
        </div>
        {previousScore !== undefined && (
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {previousScore.toFixed(1)} → {currentScore.toFixed(1)} (
            {scoreChange > 0 ? `+${scoreChange.toFixed(1)}` : scoreChange.toFixed(1)})
          </span>
        )}
      </div>

      {/* 인과관계 연결 설명 박스 */}
      {scoreChangeReason ? (
        <div className="mb-4 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
            <CornerDownRight className="w-4 h-4" />
            인과관계 요약
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {scoreChangeReason}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500">
          직전 분석 대비 핵심 펀더멘털에 유의미한 변동이 발생하지 않아 기존 평가를 유지합니다.
        </div>
      )}

      {/* 변화한 평가요인 목록 */}
      {changedFactors.length > 0 ? (
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            변동된 세부 요인 및 기여도
          </div>
          {changedFactors.map((f) => {
            const isUp = (f.change_vs_previous ?? 0) > 0;
            return (
              <div
                key={f.factor}
                className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {f.factor_name_ko}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {f.reason_ko}
                  </p>
                </div>
                <div
                  className={`font-mono font-bold flex items-center ml-3 flex-shrink-0 ${
                    isUp
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {f.change_vs_previous?.toFixed(2)}점
                  {isUp ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-slate-400 py-1">
          모든 5대 요인이 직전 평가와 동일한 점수를 유지하고 있습니다.
        </div>
      )}
    </section>
  );
};
