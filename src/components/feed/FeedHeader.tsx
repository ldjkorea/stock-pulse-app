import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertTriangle, RefreshCw, Activity, Zap, ChevronDown, ChevronRight } from 'lucide-react';

export interface ImportantChangeItem {
  symbolId: string;
  nameKo: string;
  ticker: string;
  scoreChange: number;
  currentScore: number;
  reason: string;
}

interface FeedHeaderProps {
  importantChangesCount: number;
  analyzedStocksCount: number;
  lastCheckedTime: string;
  isSystemDelayed?: boolean;
  onToggleDelaySimulation?: () => void;
  // 실시간 시세 연동 모듈 속성
  isLiveStreaming?: boolean;
  isRefreshing?: boolean;
  lastRefreshedTime?: string;
  onRefreshMarketPrices?: () => void;
  onToggleLiveStreaming?: () => void;
  // 중요 변화 종목 목록 및 상세 이동
  importantChanges?: ImportantChangeItem[];
  onSelectStock?: (symbolId: string) => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  importantChangesCount,
  analyzedStocksCount: _analyzedStocksCount,
  lastCheckedTime,
  isSystemDelayed = false,
  onToggleDelaySimulation,
  isLiveStreaming = true,
  isRefreshing = false,
  lastRefreshedTime,
  onRefreshMarketPrices,
  onToggleLiveStreaming,
  importantChanges,
  onSelectStock,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div className="mb-5 space-y-3">
      {/* 1. 최상단 실시간 금융 시세 연동 LIVE 컨트롤 바 */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-900/90 text-white border border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            {isLiveStreaming ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-white flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                실시간 체결 시세 연동
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {lastRefreshedTime ? `${lastRefreshedTime} 체결 틱 반영` : '실시간 동기화 중'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 수동 새로고침 버튼 */}
          {onRefreshMarketPrices && (
            <button
              onClick={onRefreshMarketPrices}
              disabled={isRefreshing}
              title="실시간 시세 즉시 갱신"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1 text-[11px] font-semibold border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">새로고침</span>
            </button>
          )}

          {/* 자동 스트리밍 토글 버튼 */}
          {onToggleLiveStreaming && (
            <button
              onClick={onToggleLiveStreaming}
              title={isLiveStreaming ? '자동 갱신 일시정지' : '자동 갱신 시작'}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all border ${
                isLiveStreaming
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isLiveStreaming ? '자동갱신 ON' : '자동갱신 OFF'}
            </button>
          )}
        </div>
      </div>

      {/* 2. 상태 타이틀 바 */}
      <div className="flex items-center justify-between">
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

      {/* 3. 상황별 상태 알림 배너 */}
      {isSystemDelayed ? (
        // 데이터 확인 지연 (장애 상태)
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold">일부 데이터 확인 지연</div>
              <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-0.5 leading-normal">
                일부 증권 공시 및 시장 데이터 공급사의 응답이 지연되어 마지막 정상 확인 시각({lastCheckedTime}) 기준의 분석이 표시됩니다.
              </p>
            </div>
          </div>
          {onToggleDelaySimulation && (
            <button
              onClick={onToggleDelaySimulation}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-bold flex-shrink-0 transition-colors"
            >
              정상 복원
            </button>
          )}
        </div>
      ) : importantChangesCount > 0 ? (
        // 중요한 변화 발생 상태
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  오늘 중요한 변화 <span className="text-blue-600 dark:text-blue-400 font-extrabold">{importantChangesCount}건</span> 감지
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  실적 가이던스 상향 및 수급/규제 변동 요인이 발생한 종목입니다.
                </p>
              </div>
            </div>
            {importantChanges && importantChanges.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-900/60 shadow-xs transition-all shrink-0"
              >
                <span>{isExpanded ? '접기' : '상세보기'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* 감지된 중요 변화 종목 요약 리스트 */}
          {isExpanded && importantChanges && importantChanges.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-500/15 space-y-2">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>변화 감지 종목 ({importantChanges.length}개)</span>
                <span className="text-[10px] text-slate-400 font-normal">카드를 누르면 상세 분석으로 이동합니다</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {importantChanges.map((item) => (
                  <div
                    key={item.symbolId}
                    onClick={() => onSelectStock?.(item.symbolId)}
                    className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer flex items-start justify-between gap-2 shadow-xs group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.nameKo}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.ticker}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            item.scoreChange > 0
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {item.scoreChange > 0 ? `+${item.scoreChange}` : item.scoreChange}점
                          ({(item.currentScore - item.scoreChange).toFixed(1)} → {item.currentScore.toFixed(1)})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                        {item.reason}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // 변화 없음 (안정 상태)
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">이상 징후 없음:</span> 보유 종목 모두 핵심 펀더멘털이 안정적으로 유지되고 있습니다.
          </div>
        </div>
      )}
    </div>
  );
};
