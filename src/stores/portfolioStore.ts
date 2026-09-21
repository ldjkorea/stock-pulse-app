import { useState, useEffect } from 'react';
import { Position, PriceSnapshot } from '../core/types/models';
import { StockAnalysis } from '../core/types/analysis';
import { Alert } from '../core/types/alert';
import { defaultDataProvider } from '../core/providers/mockDataProvider';
import { MOCK_ALERTS } from '../mock/mockScenarios';

export interface EnrichedPosition extends Position {
  current_price: number;
  total_value: number;            // quantity * current_price
  invested_amount: number;        // quantity * average_cost
  unrealized_profit_amount: number; // total_value - invested_amount
  unrealized_profit_percent: number; // (profit / invested) * 100
  portfolio_weight_percent: number;  // (total_value / total_portfolio_value) * 100
  is_over_weight_limit: boolean;     // weight > target_max_weight_percent
  analysis: StockAnalysis | null;
  price_snapshot: PriceSnapshot | null;
}

const LOCAL_STORAGE_KEY_POSITIONS = 'stock_pulse_positions_v1';
const LOCAL_STORAGE_KEY_ONBOARDED = 'stock_pulse_onboarded_v1';
const LOCAL_STORAGE_KEY_ALERTS = 'stock_pulse_alerts_v1';

// 기본 초기 데모 포트폴리오
export const INITIAL_DEMO_POSITIONS: Position[] = [
  {
    id: 'POS_NVDA',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'NVDA',
    quantity: 15,
    average_cost: 140.0,
    currency: 'USD',
    target_max_weight_percent: 25,
    investment_horizon: 'MEDIUM',
    created_at: '2026-09-01T09:00:00Z',
    updated_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'POS_AVGO',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'AVGO',
    quantity: 12,
    average_cost: 162.5,
    currency: 'USD',
    target_max_weight_percent: 20,
    investment_horizon: 'LONG',
    created_at: '2026-09-02T09:00:00Z',
    updated_at: '2026-09-02T09:00:00Z',
  },
  {
    id: 'POS_MSFT',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'MSFT',
    quantity: 5,
    average_cost: 415.0,
    currency: 'USD',
    target_max_weight_percent: 20,
    investment_horizon: 'LONG',
    created_at: '2026-09-03T09:00:00Z',
    updated_at: '2026-09-03T09:00:00Z',
  },
  {
    id: 'POS_GOOGL',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'GOOGL',
    quantity: 10,
    average_cost: 168.0,
    currency: 'USD',
    target_max_weight_percent: 15,
    investment_horizon: 'MEDIUM',
    created_at: '2026-09-04T09:00:00Z',
    updated_at: '2026-09-04T09:00:00Z',
  },
];

export function usePortfolioStore() {
  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_POSITIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEMO_POSITIONS;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ONBOARDED);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return false; // 첫 방문 시 온보딩 표시
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ALERTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return MOCK_ALERTS;
  });

  const [enrichedPositions, setEnrichedPositions] = useState<EnrichedPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 로컬스토리지 영속화
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_POSITIONS, JSON.stringify(positions));
    } catch (e) {
      console.error(e);
    }
  }, [positions]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ONBOARDED, JSON.stringify(isOnboarded));
    } catch (e) {
      console.error(e);
    }
  }, [isOnboarded]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

  // 포지션 데이터 풍부화 (현재가, 평가금액, 손익, 비중 계산)
  useEffect(() => {
    let isMounted = true;

    async function enrich() {
      setIsLoading(true);
      try {
        const results: { pos: Position; price: PriceSnapshot | null; analysis: StockAnalysis | null }[] = [];
        
        for (const pos of positions) {
          const [price, analysis] = await Promise.all([
            defaultDataProvider.getPriceSnapshot(pos.symbol_id),
            defaultDataProvider.getStockAnalysis(pos.symbol_id),
          ]);
          results.push({ pos, price, analysis });
        }

        // 총 평가금액 합계 산출
        let grandTotalValue = 0;
        for (const item of results) {
          const currentPrice = item.price?.current_price ?? item.pos.average_cost;
          grandTotalValue += item.pos.quantity * currentPrice;
        }

        const enriched: EnrichedPosition[] = results.map(({ pos, price, analysis }) => {
          const currentPrice = price?.current_price ?? pos.average_cost;
          const totalValue = pos.quantity * currentPrice;
          const investedAmount = pos.quantity * pos.average_cost;
          const profitAmount = totalValue - investedAmount;
          const profitPercent = investedAmount > 0 ? (profitAmount / investedAmount) * 100 : 0;
          const weightPercent = grandTotalValue > 0 ? (totalValue / grandTotalValue) * 100 : 0;
          const isOverLimit = !!(
            pos.target_max_weight_percent && weightPercent > pos.target_max_weight_percent
          );

          return {
            ...pos,
            current_price: currentPrice,
            total_value: Number(totalValue.toFixed(2)),
            invested_amount: Number(investedAmount.toFixed(2)),
            unrealized_profit_amount: Number(profitAmount.toFixed(2)),
            unrealized_profit_percent: Number(profitPercent.toFixed(2)),
            portfolio_weight_percent: Number(weightPercent.toFixed(1)),
            is_over_weight_limit: isOverLimit,
            analysis,
            price_snapshot: price,
          };
        });

        if (isMounted) {
          setEnrichedPositions(enriched);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setIsLoading(false);
      }
    }

    enrich();

    return () => {
      isMounted = false;
    };
  }, [positions]);

  // 포트폴리오 종합 통계
  const totalPortfolioValue = enrichedPositions.reduce((sum, p) => sum + p.total_value, 0);
  const totalInvestedAmount = enrichedPositions.reduce((sum, p) => sum + p.invested_amount, 0);
  const totalProfitAmount = totalPortfolioValue - totalInvestedAmount;
  const totalProfitPercent =
    totalInvestedAmount > 0 ? (totalProfitAmount / totalInvestedAmount) * 100 : 0;

  // 알림 관련
  const unreadAlertCount = alerts.filter((a) => !a.is_read).length;

  const markAlertAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
    );
  };

  const markAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  };

  // 포지션 CRUD
  const addPosition = (newPos: Omit<Position, 'id' | 'created_at' | 'updated_at'>) => {
    const created: Position = {
      ...newPos,
      id: `POS_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPositions((prev) => [...prev, created]);
  };

  const updatePosition = (id: string, updates: Partial<Position>) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
  };

  const removePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDemoPortfolio = () => {
    setPositions(INITIAL_DEMO_POSITIONS);
    setAlerts(MOCK_ALERTS);
    setIsOnboarded(true);
  };

  const completeOnboarding = (initialPositions?: Position[]) => {
    if (initialPositions && initialPositions.length > 0) {
      setPositions(initialPositions);
    }
    setIsOnboarded(true);
  };

  const exportPortfolio = () => {
    const dataToExport = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      positions,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-pulse-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPortfolio = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const importedPositions: Position[] = Array.isArray(parsed)
        ? parsed
        : parsed.positions;

      if (!Array.isArray(importedPositions) || importedPositions.length === 0) {
        return { success: false, message: '올바른 포트폴리오 데이터 형식이 아닙니다.' };
      }

      // 유효성 체크
      for (const p of importedPositions) {
        if (!p.symbol_id || typeof p.quantity !== 'number' || typeof p.average_cost !== 'number') {
          return { success: false, message: '포지션 데이터에 필수 항목(종목, 수량, 평단가)이 누락되었습니다.' };
        }
      }

      setPositions(importedPositions);
      setIsOnboarded(true);
      return { success: true, message: `${importedPositions.length}개 종목을 성공적으로 불러왔습니다.` };
    } catch (err) {
      return { success: false, message: 'JSON 파일 파싱 중 오류가 발생했습니다.' };
    }
  };

  return {
    positions,
    enrichedPositions,
    isLoading,
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
  };
}
