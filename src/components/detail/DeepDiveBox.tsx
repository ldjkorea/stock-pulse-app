import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { DeepDiveAnalysis } from '../../core/types/analysis';

interface DeepDiveBoxProps {
  deepDive: DeepDiveAnalysis;
}

export const DeepDiveBox: React.FC<DeepDiveBoxProps> = ({ deepDive }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mb-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              상세 분석 (전문 지표)
            </h2>
            <p className="text-[11px] text-slate-400">
              재무 지표, Forward P/E, 컨센서스 개정치 세부 내용
            </p>
          </div>
        </div>
        <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-xs">
          {/* 매출 & 이익/FCF */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              매출 성장 및 이익·FCF 흐름
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
              {deepDive.revenue_growth_text}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {deepDive.profit_and_fcf_text}
            </p>
          </div>

          {/* 선행 P/E 및 밸류에이션 */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-500" />
              Forward P/E & 밸류에이션 분석
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {deepDive.forward_pe_analysis}
            </p>
          </div>

          {/* 컨센서스 & 산업 데이터 */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" />
              컨센서스 개정 및 산업 경쟁 환경
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
              {deepDive.consensus_revision_text}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {deepDive.industry_trend_text}
            </p>
          </div>

          {/* 규제 및 리스크 세부 */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              규제 정책 및 잠재 리스크 상세
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {deepDive.regulation_and_risk_text}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
