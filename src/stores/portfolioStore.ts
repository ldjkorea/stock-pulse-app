import { useState, useEffect } from 'react';
import { Position, PriceSnapshot } from '../core/types/models';
import { StockAnalysis } from '../core/types/analysis';
import { Alert } from '../core/types/alert';
import { defaultDataProvider } from '../core/providers/mockDataProvider';
import { MOCK_ALERTS } from '../mock/mockScenarios';
import { SUPPORTED_SYMBOLS } from '../mock/symbols';

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

// 사용자 실전 보유 종목 기반 기본 포트폴리오
export const INITIAL_DEMO_POSITIONS: Position[] = [
  {
    id: 'POS_AMAT',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'AMAT',
    quantity: 5,
    average_cost: 286.15,
    currency: 'USD',
    target_max_weight_percent: 20,
    investment_horizon: 'LONG',
    created_at: '2026-09-01T09:00:00Z',
    updated_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'POS_MSFT',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'MSFT',
    quantity: 5,
    average_cost: 370.07,
    currency: 'USD',
    target_max_weight_percent: 20,
    investment_horizon: 'LONG',
    created_at: '2026-09-01T09:00:00Z',
    updated_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'POS_NVDA',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'NVDA',
    quantity: 15,
    average_cost: 189.05,
    currency: 'USD',
    target_max_weight_percent: 25,
    investment_horizon: 'MEDIUM',
    created_at: '2026-09-01T09:00:00Z',
    updated_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'POS_LLY',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'LLY',
    quantity: 2,
    average_cost: 1017.85,
    currency: 'USD',
    target_max_weight_percent: 15,
    investment_horizon: 'LONG',
    created_at: '2026-09-02T09:00:00Z',
    updated_at: '2026-09-02T09:00:00Z',
  },
  {
    id: 'POS_AVGO',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'AVGO',
    quantity: 8,
    average_cost: 355.78,
    currency: 'USD',
    target_max_weight_percent: 20,
    investment_horizon: 'LONG',
    created_at: '2026-09-02T09:00:00Z',
    updated_at: '2026-09-02T09:00:00Z',
  },
  {
    id: 'POS_GOOGL',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'GOOGL',
    quantity: 8,
    average_cost: 362.39,
    currency: 'USD',
    target_max_weight_percent: 15,
    investment_horizon: 'MEDIUM',
    created_at: '2026-09-03T09:00:00Z',
    updated_at: '2026-09-03T09:00:00Z',
  },
  {
    id: 'POS_CEG',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'CEG',
    quantity: 8,
    average_cost: 280.97,
    currency: 'USD',
    target_max_weight_percent: 15,
    investment_horizon: 'MEDIUM',
    created_at: '2026-09-04T09:00:00Z',
    updated_at: '2026-09-04T09:00:00Z',
  },
  {
    id: 'POS_SPCX',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: 'SPCX',
    quantity: 1,
    average_cost: 166.96,
    currency: 'USD',
    target_max_weight_percent: 10,
    investment_horizon: 'LONG',
    created_at: '2026-09-04T09:00:00Z',
    updated_at: '2026-09-04T09:00:00Z',
  },
  {
    id: 'POS_047050',
    user_id: 'USER_DEFAULT',
    portfolio_id: 'PF_DEFAULT',
    symbol_id: '047050',
    quantity: 15,
    average_cost: 58300,
    currency: 'KRW',
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

        const USD_KRW_RATE = 1400; // 원/달러 기준 환율

        // 총 평가금액 합계 산출 (USD 기준 환산 정규화)
        let grandTotalValueUsd = 0;
        for (const item of results) {
          const sym = SUPPORTED_SYMBOLS.find((s) => s.id === item.pos.symbol_id);
          const isKrw = sym?.currency === 'KRW' || item.pos.currency === 'KRW';
          const currentPrice = item.price?.current_price ?? item.pos.average_cost;
          const posVal = item.pos.quantity * currentPrice;
          grandTotalValueUsd += isKrw ? posVal / USD_KRW_RATE : posVal;
        }

        const enriched: EnrichedPosition[] = results.map(({ pos, price, analysis }) => {
          const sym = SUPPORTED_SYMBOLS.find((s) => s.id === pos.symbol_id);
          const isKrw = sym?.currency === 'KRW' || pos.currency === 'KRW';
          const currentPrice = price?.current_price ?? pos.average_cost;
          const totalValue = pos.quantity * currentPrice;
          const investedAmount = pos.quantity * pos.average_cost;
          const profitAmount = totalValue - investedAmount;
          const profitPercent = investedAmount > 0 ? (profitAmount / investedAmount) * 100 : 0;

          const posValUsd = isKrw ? totalValue / USD_KRW_RATE : totalValue;
          const weightPercent = grandTotalValueUsd > 0 ? (posValUsd / grandTotalValueUsd) * 100 : 0;
          const isOverLimit = !!(
            pos.target_max_weight_percent && weightPercent > pos.target_max_weight_percent
          );

          return {
            ...pos,
            currency: sym?.currency || pos.currency || 'USD',
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

  const USD_KRW_RATE = 1400;

  // 포트폴리오 종합 통계 (USD 기준 환산 집계)
  const totalPortfolioValue = enrichedPositions.reduce((sum, p) => {
    const isKrw = p.currency === 'KRW';
    return sum + (isKrw ? p.total_value / USD_KRW_RATE : p.total_value);
  }, 0);

  const totalInvestedAmount = enrichedPositions.reduce((sum, p) => {
    const isKrw = p.currency === 'KRW';
    return sum + (isKrw ? p.invested_amount / USD_KRW_RATE : p.invested_amount);
  }, 0);

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
    const sym = SUPPORTED_SYMBOLS.find((s) => s.id === newPos.symbol_id);
    const created: Position = {
      ...newPos,
      currency: sym?.currency || newPos.currency || 'USD',
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
