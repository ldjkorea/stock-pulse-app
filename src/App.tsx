import React, { useState } from 'react';
import { usePortfolioStore } from './stores/portfolioStore';
import { useTheme } from './stores/themeStore';
import { Header } from './components/common/Header';
import { BottomNav, TabType } from './components/common/BottomNav';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { OnboardingView } from './components/onboarding/OnboardingView';
import { FeedView } from './components/feed/FeedView';
import { StockDetailView } from './components/detail/StockDetailView';
import { PortfolioManageView } from './components/portfolio/PortfolioManageView';
import { AlertsView } from './components/alerts/AlertsView';
import { SettingsView } from './components/settings/SettingsView';
import { SmartImportModal } from './components/portfolio/SmartImportModal';
import { SUPPORTED_SYMBOLS } from './mock/symbols';
import { defaultDataProvider } from './core/providers/mockDataProvider';
import { StockAnalysis } from './core/types/analysis';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    enrichedPositions,
    totalPortfolioValue,
    totalInvestedAmount,
    totalProfitAmount,
    totalProfitPercent,
    isOnboarded,
    setIsOnboarded,
    completeOnboarding,
    addPosition,
    updatePosition,
    removePosition,
    resetToDemoPortfolio,
    exportPortfolio,
    importPortfolio,
    alerts,
    unreadAlertCount,
    markAlertAsRead,
    markAllAlertsAsRead,
  } = usePortfolioStore();

  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [dynamicAnalysis, setDynamicAnalysis] = useState<StockAnalysis | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);

  // 스마트 일괄 등록 처리
  const handleSmartBatchImport = (newPositions: Parameters<typeof addPosition>[0][]) => {
    newPositions.forEach((pos) => {
      addPosition(pos);
    });
  };

  // 종목 상세 선택 처리
  const handleSelectStock = async (symbolId: string) => {
    setSelectedStockId(symbolId);
    const analysis = await defaultDataProvider.getStockAnalysis(symbolId);
    setDynamicAnalysis(analysis);
  };

  const handleBackToFeed = () => {
    setSelectedStockId(null);
    setDynamicAnalysis(null);
  };

  // 1. 첫 방문자 온보딩 화면
  if (!isOnboarded) {
    return (
      <OnboardingView
        onComplete={(positions) => {
          completeOnboarding(positions);
        }}
      />
    );
  }

  // 2. 종목 상세 화면 활성화 시
  if (selectedStockId) {
    const symbol = SUPPORTED_SYMBOLS.find((s) => s.id === selectedStockId) || {
      id: selectedStockId,
      ticker: selectedStockId,
      name_ko: selectedStockId,
      name_en: selectedStockId,
      sector: '대형주',
      currency: 'USD',
      is_supported: true,
      description: '',
    };

    const position = enrichedPositions.find((p) => p.symbol_id === selectedStockId);
    const analysis = position?.analysis || dynamicAnalysis;

    if (analysis) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <StockDetailView
            symbol={symbol}
            analysis={analysis}
            position={position}
            onBack={handleBackToFeed}
          />
        </div>
      );
    }
  }

  // 3. 메인 탭 화면
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* 상단 공통 헤더 */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        unreadCount={unreadAlertCount}
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenSmartImport={() => setIsSmartModalOpen(true)}
      />

      {/* 탭별 뷰 컨텐츠 */}
      <main className="flex-1">
        {activeTab === 'feed' && (
          <FeedView
            positions={enrichedPositions}
            onSelectStock={handleSelectStock}
            onOpenPortfolioManage={() => setActiveTab('portfolio')}
            onOpenSmartImport={() => setIsSmartModalOpen(true)}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioManageView
            positions={enrichedPositions}
            totalValue={totalPortfolioValue}
            totalInvested={totalInvestedAmount}
            totalProfit={totalProfitAmount}
            totalProfitPercent={totalProfitPercent}
            onAddPosition={addPosition}
            onUpdatePosition={updatePosition}
            onRemovePosition={removePosition}
            onSelectStock={handleSelectStock}
            onExportPortfolio={exportPortfolio}
            onImportPortfolio={importPortfolio}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onSelectStock={handleSelectStock}
            onMarkAllRead={markAllAlertsAsRead}
            onMarkRead={markAlertAsRead}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            theme={theme}
            onToggleTheme={toggleTheme}
            onResetDemo={resetToDemoPortfolio}
            onRestartOnboarding={() => setIsOnboarded(false)}
            onSelectStock={handleSelectStock}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        )}
      </main>

      {/* 하단 고정 네비게이션 탭바 */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setSelectedStockId(null);
          setActiveTab(tab);
        }}
        unreadAlertCount={unreadAlertCount}
      />

      {/* 스마트폰 앱(PWA) 설치 안내 모달 */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* 스마트 일괄 등록 모달 */}
      <SmartImportModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
        onImportPositions={handleSmartBatchImport}
      />
    </div>
  );
}

export default App;
