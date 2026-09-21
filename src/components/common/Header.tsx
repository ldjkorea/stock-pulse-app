import React from 'react';
import { Bell, Moon, Sun, Smartphone, Sparkles } from 'lucide-react';
import { ThemeMode } from '../../stores/themeStore';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  unreadCount: number;
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
  onOpenInstallModal?: () => void;
  onOpenSmartImport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  unreadCount,
  onOpenAlerts,
  onOpenInstallModal,
  onOpenSmartImport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 & 데모 표시 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Stock Pulse
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Demo
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 -mt-0.5">
              투자 매력도 변화 분석
            </p>
          </div>
        </div>

        {/* 우측 아이콘 액션 */}
        <div className="flex items-center gap-1.5">
          {/* 스마트 주식 일괄 등록 버튼 */}
          {onOpenSmartImport && (
            <button
              onClick={onOpenSmartImport}
              title="내 주식 스마트 일괄 등록"
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all flex items-center gap-1 text-xs font-bold shadow-sm"
              aria-label="스마트 등록"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>스마트 등록</span>
            </button>
          )}

          {/* 스마트폰 앱 설치 버튼 */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              title="스마트폰 앱으로 설치"
              className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-1 text-xs font-bold"
              aria-label="앱 설치"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">앱 설치</span>
            </button>
          )}

          {/* 다크모드 토글 */}
          <button
            onClick={onToggleTheme}
            title="테마 전환"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* 알림 버튼 */}
          <button
            onClick={onOpenAlerts}
            title="알림 확인"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
