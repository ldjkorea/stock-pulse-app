import React from 'react';
import { Bell, ArrowRight, CheckCheck, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { Alert } from '../../core/types/alert';
import { ScoreBadge } from '../common/Badge';

interface AlertsViewProps {
  alerts: Alert[];
  onSelectStock: (symbolId: string) => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onSelectStock,
  onMarkAllRead,
  onMarkRead,
}) => {
  const getBadgeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'REGULATION':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'SCORE_CHANGE_THRESHOLD':
      case 'LABEL_TRANSITION':
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24">
      {/* 알림 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            알림 피드
          </h1>
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          모두 읽음
        </button>
      </div>

      <div className="mb-4 text-xs text-slate-500 leading-relaxed">
        * 동일한 사건이 여러 종목에 영향을 미친 경우 묶음 알림으로 자동 통합 제공됩니다.
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            새로운 알림이 없습니다.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            보유 종목에 유의미한 점수 변화나 핵심 사건이 감지되면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-3xl border transition-all ${
                alert.is_read
                  ? 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 opacity-80'
                  : 'bg-white dark:bg-slate-900 border-blue-500/40 dark:border-blue-500/40 shadow-sm'
              }`}
            >
              {/* 상단 메타 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {getBadgeIcon(alert.type)}
                  <span>{alert.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {alert.display_time_ko}
                </span>
              </div>

              {/* 사건 요약 설명 */}
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                {alert.summary_ko}
              </p>

              {/* 영향받은 종목 카드 목록 (다중 종목 묶음 지원) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {alert.impacted_stocks.map((stock) => (
                  <div
                    key={stock.symbol_id}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {stock.name_ko}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {stock.ticker}
                        </span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                          {stock.previous_score.toFixed(1)} → {stock.new_score.toFixed(1)}
                        </span>
                        <ScoreBadge label={stock.new_label} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                        {stock.impact_summary_ko}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onMarkRead(alert.id);
                        onSelectStock(stock.symbol_id);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 flex-shrink-0 shadow-sm transition-all"
                    >
                      무슨 일인지 보기
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
