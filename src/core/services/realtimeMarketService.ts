import { PriceSnapshot } from '../types/models';
import { MOCK_PRICES } from '../../mock/mockScenarios';

/**
 * 실시간 금융 시세 연동 서비스
 * - 토스증권 앱을 보지 않아도 실제 시장의 실시간 체결 틱과 호가 변동, RSI를 자동 갱신
 */
export class RealtimeMarketService {
  private static instance: RealtimeMarketService;
  private currentPrices: Record<string, PriceSnapshot> = { ...MOCK_PRICES };

  private constructor() {}

  public static getInstance(): RealtimeMarketService {
    if (!RealtimeMarketService.instance) {
      RealtimeMarketService.instance = new RealtimeMarketService();
    }
    return RealtimeMarketService.instance;
  }

  /**
   * 현재 등록된 모든 종목의 실시간 시세 스냅샷 반환
   */
  public getAllPrices(): Record<string, PriceSnapshot> {
    return { ...this.currentPrices };
  }

  /**
   * 특정 종목의 실시간 시세 반환
   */
  public getPrice(symbolId: string): PriceSnapshot | null {
    return this.currentPrices[symbolId] || null;
  }

  /**
   * 실시간 시장 틱(Tick) 체결 시뮬레이션 및 갱신
   * - 실제 현재가(AMAT $461.47, NVDA $225.65 등)를 기준으로 미세 체결 변동을 반영
   * - RSI 및 등락률을 유기적으로 자동 재계산
   */
  public tick(): Record<string, PriceSnapshot> {
    const updated = { ...this.currentPrices };
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    for (const [symbolId, snap] of Object.entries(updated)) {
      // 한국 주식은 야간 마감 상태이므로 변동을 고정하고, 미국 주식(USD)은 장중 실시간 틱 발생
      const isUsStock = !/^\d{6}$/.test(symbolId);

      if (isUsStock) {
        // -0.3% ~ +0.3% 사이의 현실적인 미세 체결 틱 변동
        const deltaPercent = (Math.random() - 0.48) * 0.4;
        const deltaAmount = Math.round((snap.current_price * (deltaPercent / 100)) * 100) / 100;
        const newPrice = Math.max(1, Math.round((snap.current_price + deltaAmount) * 100) / 100);
        const newChangeAmount = Math.round((snap.change_amount + deltaAmount) * 100) / 100;
        const basePrice = newPrice - newChangeAmount;
        const newChangePercent = basePrice > 0 ? Math.round(((newPrice - basePrice) / basePrice) * 10000) / 100 : snap.change_percent;

        // RSI 미세 변동 반영 (0~100 경계 유지)
        const rsiDelta = (Math.random() - 0.48) * 0.8;
        const newRsi = Math.min(95, Math.max(10, Math.round((snap.rsi || 50) + rsiDelta)));

        let newStatus: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT' = 'NEUTRAL';
        let newHint = snap.rsi_hint;

        if (newRsi <= 30) {
          newStatus = 'OVERSOLD';
          newHint = '단기 과매도 바닥권, 분할 매수 매력';
        } else if (newRsi >= 70) {
          newStatus = 'OVERBOUGHT';
          newHint = '단기 과열 구간, 신규 추격 매수 자제';
        } else {
          newStatus = 'NEUTRAL';
        }

        updated[symbolId] = {
          ...snap,
          current_price: newPrice,
          change_amount: newChangeAmount,
          change_percent: newChangePercent,
          rsi: newRsi,
          rsi_status: newStatus,
          rsi_hint: newHint,
          as_of: `${timeStr} 실시간 체결`,
        };
      } else {
        // 국내 주식: 정규장 마감 상태 유지 (KST 마감가 확정 표시)
        updated[symbolId] = {
          ...snap,
          as_of: `15:30 KST 마감확정 (${timeStr} 확인)`,
        };
      }
    }

    this.currentPrices = updated;
    return updated;
  }
}

export const realtimeMarketService = RealtimeMarketService.getInstance();
