import React from 'react';
import { Bell, Moon, Sun, Smartphone, Sparkles, LayoutGrid, PieChart, Settings } from 'lucide-react';
import { ThemeMode } from '../../stores/themeStore';
import { TabType } from './BottomNav';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  unreadCount: number;
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
  onOpenInstallModal?: () => void;
  onOpenSmartImport?: () => void;
  activeTab?: TabType;
  onChangeTab?: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  unreadCount,
  onOpenAlerts,
  onOpenSettings,
  onOpenInstallModal,
  onOpenSmartImport,
  activeTab = 'feed',
  onChangeTab,
}) => {
  const navTabs = [
    { id: 'feed' as TabType, label: '피드', icon: LayoutGrid },
    { id: 'portfolio' as TabType, label: '포트폴리오', icon: PieChart },
    { id: 'alerts' as TabType, label: '알림', icon: Bell, badge: unreadCount },
    { id: 'settings' as TabType, label: '설정', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 1. 로고 & 데모 표시 */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onChangeTab && onChangeTab('feed')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Stock Pulse
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 -mt-0.5">
                실시간 펀더멘털 & 수급 분석
              </p>
            </div>
          </div>
        </div>

        {/* 2. 데스크톱 와이드 GNB 탭 메뉴 (md 이상 화면에서 노출) */}
        {onChangeTab && (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* 3. 우측 액션 버튼들 */}
        <div className="flex items-center gap-1.5">
          {/* 스마트 주식 일괄 등록 버튼 */}
          {onOpenSmartImport && (
            <button
              onClick={onOpenSmartImport}
              title="내 주식 스마트 일괄 등록"
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
              aria-label="스마트 등록"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>스마트 등록</span>
            </button>
          )}

          {/* 모바일 앱 설치 안내 버튼 */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              title="스마트폰 앱으로 설치"
              className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-1 text-xs font-bold"
              aria-label="앱 설치"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">모바일 앱</span>
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

          {/* 모바일 화면용 알림 버튼 (PC에서는 GNB에 포함) */}
          <button
            onClick={onOpenAlerts}
            title="알림 확인"
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* 모바일 화면용 설정 버튼 (PC에서는 GNB에 포함) */}
          <button
            onClick={onOpenSettings}
            title="설정"
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
