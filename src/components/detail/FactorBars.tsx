import React from 'react';
import { BarChart3 } from 'lucide-react';
import { FactorType, FactorScore } from '../../core/types/analysis';

interface FactorBarsProps {
  factors: Record<FactorType, FactorScore>;
}

export const FactorBars: React.FC<FactorBarsProps> = ({ factors }) => {
  const factorList: FactorType[] = [
    'PERFORMANCE_CASH',
    'VALUATION',
    'MARKET_EXPECTATION',
    'INDUSTRY_ENVIRONMENT',
    'FINANCIAL_RESILIENCE',
  ];

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-blue-600 dark:bg-blue-500';
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <section className="mb-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            5대 평가요인 분석
          </h2>
        </div>
        <span className="text-[10px] text-slate-400">가중합 100점 만점 기준</span>
      </div>

      <div className="space-y-4">
        {factorList.map((fKey) => {
          const item = factors[fKey];
          if (!item) return null;

          const weightPercent = Math.round(item.weight * 100);

          return (
            <div key={fKey} className="group">
              {/* 요인 이름 + 가중치 + 점수 */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.factor_name_ko}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    가중치 {weightPercent}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                    {item.raw_score}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
                </div>
              </div>

              {/* 시각적 막대 바 */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                    item.raw_score
                  )}`}
                  style={{ width: `${item.raw_score}%` }}
                />
              </div>

              {/* 요인 산정 이유 */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal pl-0.5">
                {item.reason_ko}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
