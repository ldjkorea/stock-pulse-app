import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface FeedHeaderProps {
  importantChangesCount: number;
  analyzedStocksCount: number;
  lastCheckedTime: string;
  isSystemDelayed?: boolean;
  onToggleDelaySimulation?: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  importantChangesCount,
  analyzedStocksCount,
  lastCheckedTime,
  isSystemDelayed = false,
  onToggleDelaySimulation,
}) => {
  return (
    <div className="mb-5">
      {/* 최상단 상태 타이틀 바 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-blue-500" />
          오늘 확인할 변화
        </h1>

        {/* 정상 확인 vs 지연 장애 토글 (UX 검증용) */}
        {onToggleDelaySimulation && (
          <button
            onClick={onToggleDelaySimulation}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
            title="데이터 수신 장애 상태 시뮬레이션 토글"
          >
            {isSystemDelayed ? '정상 모드로 전환' : '지연 시뮬레이션'}
          </button>
        )}
      </div>

      {/* 상황별 상태 알림 배너 */}
      {isSystemDelayed ? (
        // 데이터 확인 지연 (장애 상태)
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold">일부 데이터 확인 지연</div>
            <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-0.5 leading-normal">
              일부 증권 공시 및 시장 데이터 공급사의 응답이 지연되어 마지막 정상 확인 시각({lastCheckedTime}) 기준의 분석이 표시됩니다.
            </p>
          </div>
        </div>
      ) : importantChangesCount > 0 ? (
        // 중요한 변화 발생 상태
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                오늘 중요한 변화 <span className="text-blue-600 dark:text-blue-400 font-extrabold">{importantChangesCount}건</span> 감지
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>분석 완료 {analyzedStocksCount}종목</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  마지막 정상 확인 {lastCheckedTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 중요한 변화 없음 (정상 상태)
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              오늘 확인할 중요한 변화는 없습니다.
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>보유 {analyzedStocksCount}개 종목 정상 확인 완료</span>
              <span>•</span>
              <span>마지막 확인 {lastCheckedTime}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
