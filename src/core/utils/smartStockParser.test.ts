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

  it('미지원 종목(테슬라 등)이 포함된 경우 미지원 목록으로 분리한다', () => {
    const text = '엔비디아 10주 130달러, 테슬라 20주 240불, 카카오 50주';
    const result = parseSmartStockText(text);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].symbol_id === 'NVDA').toBe(true);
    expect(result.unsupported.some((u) => u.includes('테슬라'))).toBe(true);
    expect(result.unsupported.some((u) => u.includes('카카오'))).toBe(true);
  });

  it('사용자가 입력한 실제 탭 구분 데이터(스페이스X, 컨스텔레이션 에너지, 포스코인터내셔널)를 3종목 모두 성공적으로 인식한다', () => {
    const text = `스페이스X\tSPCX\t1주\t$166.96
컨스텔레이션 에너지\tCEG\t8주\t$280.97
포스코인터내셔널\t047050\t15주\t미확인`;
    const result = parseSmartStockText(text);

    expect(result.items).toHaveLength(3);

    const spcx = result.items.find((i) => i.symbol_id === 'SPCX');
    expect(spcx).toBeDefined();
    expect(spcx?.quantity).toBe(1);
    expect(spcx?.average_cost).toBe(166.96);

    const ceg = result.items.find((i) => i.symbol_id === 'CEG');
    expect(ceg).toBeDefined();
    expect(ceg?.quantity).toBe(8);
    expect(ceg?.average_cost).toBe(280.97);

    const posco = result.items.find((i) => i.symbol_id === '047050');
    expect(posco).toBeDefined();
    expect(posco?.quantity).toBe(15);
    expect(posco?.average_cost).toBe(58300); // 실시간 시장가 58,300원 적용
    expect(posco?.cost_is_estimated).toBe(true);
  });

  it('사용자가 직접 붙여넣은 증권사 멀티라인 복사 포맷(9개 종목 전체)을 100% 인식한다', () => {
    const text = `어플라이드 머티리얼즈
내 평균 $286.15
$461.47
+3.80%
마이크로소프트
내 평균 $370.07
$494.34
+0.11%
엔비디아
내 평균 $189.05
$225.65
+1.52%
일라이 릴리
내 평균 $1,017.85
$1,159.17
+0.54%
브로드컴
내 평균 $355.78
$360.66
+1.03%
알파벳 A
내 평균 $362.39
$356.32
+1.93%
컨스털레이션 에너지
내 평균 $280.97
$265.18
+4.11%
스페이스X
내 평균 $166.96
$155.24
+1.65%
국내주식
포스코인터내셔널
내 평균 0원
58,300원
+1.74%`;

    const result = parseSmartStockText(text);

    // 9개 종목 모두 완벽 인식
    expect(result.items).toHaveLength(9);
    // 국내주식 같은 카테고리 헤더가 미지원 종목으로 잡히지 않아야 함
    expect(result.unsupported).toHaveLength(0);

    // AMAT
    const amat = result.items.find((i) => i.symbol_id === 'AMAT');
    expect(amat?.average_cost).toBe(286.15);

    // MSFT
    const msft = result.items.find((i) => i.symbol_id === 'MSFT');
    expect(msft?.average_cost).toBe(370.07);

    // NVDA
    const nvda = result.items.find((i) => i.symbol_id === 'NVDA');
    expect(nvda?.average_cost).toBe(189.05);

    // LLY
    const lly = result.items.find((i) => i.symbol_id === 'LLY');
    expect(lly?.average_cost).toBe(1017.85);

    // AVGO
    const avgo = result.items.find((i) => i.symbol_id === 'AVGO');
    expect(avgo?.average_cost).toBe(355.78);

    // GOOGL
    const googl = result.items.find((i) => i.symbol_id === 'GOOGL');
    expect(googl?.average_cost).toBe(362.39);

    // CEG
    const ceg = result.items.find((i) => i.symbol_id === 'CEG');
    expect(ceg?.average_cost).toBe(280.97);

    // SPCX
    const spcx = result.items.find((i) => i.symbol_id === 'SPCX');
    expect(spcx?.average_cost).toBe(166.96);

    // 047050 (내 평균 0원 -> 현재가 58,300원 반영)
    const posco = result.items.find((i) => i.symbol_id === '047050');
    expect(posco?.average_cost).toBe(58300);
  });
});
