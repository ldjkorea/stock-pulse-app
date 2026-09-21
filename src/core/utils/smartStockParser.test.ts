import { describe, it, expect } from 'vitest';
import { parseSmartStockText } from './smartStockParser';

describe('smartStockParser', () => {
  it('쉼표나 줄바꿈으로 나뉜 한국어 자연어 주식 목록을 파싱한다', () => {
    const text = '엔비디아 15주 140달러, 마소 10주 420불, 애플 20주 215$';
    const result = parseSmartStockText(text);

    expect(result.items).toHaveLength(3);

    const nvda = result.items.find((i) => i.symbol_id === 'NVDA');
    expect(nvda).toBeDefined();
    expect(nvda?.quantity).toBe(15);
    expect(nvda?.average_cost).toBe(140);
    expect(nvda?.cost_is_estimated).toBe(false);

    const msft = result.items.find((i) => i.symbol_id === 'MSFT');
    expect(msft?.quantity).toBe(10);
    expect(msft?.average_cost).toBe(420);

    const aapl = result.items.find((i) => i.symbol_id === 'AAPL');
    expect(aapl?.quantity).toBe(20);
    expect(aapl?.average_cost).toBe(215);
  });

  it('티커 기호와 숫자만 나열된 형식을 파싱한다 (예: NVDA 15 140 / LLY 5 950)', () => {
    const text = `NVDA 15 140
    LLY 5 950
    AVGO 12 165`;
    const result = parseSmartStockText(text);

    expect(result.items).toHaveLength(3);
    expect(result.items.find((i) => i.symbol_id === 'LLY')?.average_cost).toBe(950);
    expect(result.items.find((i) => i.symbol_id === 'AVGO')?.quantity).toBe(12);
  });

  it('평단가가 생략된 경우 현재 시장 추정가로 채우고 cost_is_estimated=true 플래그를 설정한다', () => {
    const text = '구글 10주, 아마존 25주';
    const result = parseSmartStockText(text);

    expect(result.items).toHaveLength(2);
    const googl = result.items.find((i) => i.symbol_id === 'GOOGL');
    expect(googl?.quantity).toBe(10);
    expect(googl?.average_cost).toBeGreaterThan(0);
    expect(googl?.cost_is_estimated).toBe(true);
  });

  it('미지원 종목(테슬라, 삼전 등)이 포함된 경우 미지원 목록으로 분리한다', () => {
    const text = '엔비디아 10주 130달러, 테슬라 20주 240불, 삼전 50주';
    const result = parseSmartStockText(text);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].symbol_id === 'NVDA').toBe(true);
    expect(result.unsupported.some((u) => u.includes('테슬라'))).toBe(true);
    expect(result.unsupported.some((u) => u.includes('삼성전자'))).toBe(true);
  });
});
