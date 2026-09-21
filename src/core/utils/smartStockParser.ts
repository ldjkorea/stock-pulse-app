import { SUPPORTED_SYMBOLS } from '../../mock/symbols';

export interface ParsedStockItem {
  symbol_id: string;
  ticker: string;
  name_ko: string;
  quantity: number;
  average_cost: number;
  target_max_weight_percent: number;
  cost_is_estimated: boolean; // 사용자가 가격을 생략하여 현재 시장가로 추정된 경우
  raw_text: string;
}

export interface ParseResult {
  items: ParsedStockItem[];
  unsupported: string[];
  warnings: string[];
}

// 지원 종목별 기본 추정가 (사용자가 평단가 생략 시 자동 채움)
export const DEFAULT_CURRENT_PRICES: Record<string, number> = {
  NVDA: 182.45,
  MSFT: 432.10,
  GOOGL: 178.60,
  AVGO: 168.30,
  LLY: 945.00,
  AAPL: 215.50,
  AMZN: 185.00,
  META: 510.00,
  TSM: 170.00,
  ASML: 850.00,
  QCOM: 165.00,
  AMD: 155.00,
  CRM: 260.00,
  NFLX: 680.00,
  COST: 880.00,
  ADBE: 520.00,
  INTU: 650.00,
  TXN: 205.00,
  NOW: 840.00,
  AMAT: 210.00,
  CEG: 280.97,
  SPCX: 166.96,
  '047050': 62500,
  '005930': 73500,
  '000660': 188000,
  '005380': 240000,
  '035420': 190000,
};

// 별칭 매핑 테이블
const SYMBOL_ALIASES: Record<string, string> = {
  // NVDA
  nvda: 'NVDA',
  엔비디아: 'NVDA',
  엔비: 'NVDA',
  nvidia: 'NVDA',

  // MSFT
  msft: 'MSFT',
  마이크로소프트: 'MSFT',
  마소: 'MSFT',
  microsoft: 'MSFT',

  // GOOGL
  googl: 'GOOGL',
  goog: 'GOOGL',
  구글: 'GOOGL',
  알파벳: 'GOOGL',
  google: 'GOOGL',
  alphabet: 'GOOGL',

  // AVGO
  avgo: 'AVGO',
  브로드컴: 'AVGO',
  broadcom: 'AVGO',

  // LLY
  lly: 'LLY',
  일라이릴리: 'LLY',
  '일라이 릴리': 'LLY',
  릴리: 'LLY',
  elililly: 'LLY',
  lilly: 'LLY',

  // AAPL
  aapl: 'AAPL',
  애플: 'AAPL',
  아이폰: 'AAPL',
  apple: 'AAPL',

  // AMZN
  amzn: 'AMZN',
  아마존: 'AMZN',
  amazon: 'AMZN',

  // META
  meta: 'META',
  메타: 'META',
  페이스북: 'META',
  facebook: 'META',

  // TSM
  tsm: 'TSM',
  tsmc: 'TSM',
  티에스엠씨: 'TSM',

  // ASML
  asml: 'ASML',
  에이에스엠엘: 'ASML',

  // QCOM
  qcom: 'QCOM',
  퀄컴: 'QCOM',
  qualcomm: 'QCOM',

  // AMD
  amd: 'AMD',
  에이엠디: 'AMD',

  // CRM
  crm: 'CRM',
  세일즈포스: 'CRM',
  salesforce: 'CRM',

  // NFLX
  nflx: 'NFLX',
  넷플릭스: 'NFLX',
  넷플: 'NFLX',
  netflix: 'NFLX',

  // COST
  cost: 'COST',
  코스트코: 'COST',
  costco: 'COST',

  // ADBE
  adbe: 'ADBE',
  어도비: 'ADBE',
  adobe: 'ADBE',

  // INTU
  intu: 'INTU',
  인튜이트: 'INTU',
  intuit: 'INTU',

  // TXN
  txn: 'TXN',
  텍사스인스트루먼트: 'TXN',
  '텍사스 인스트루먼트': 'TXN',
  texas: 'TXN',

  // NOW
  now: 'NOW',
  서비스나우: 'NOW',
  servicenow: 'NOW',

  // AMAT
  amat: 'AMAT',
  어플라이드머티어리얼즈: 'AMAT',
  '어플라이드 머티어리얼즈': 'AMAT',
  어플라이드: 'AMAT',
  applied: 'AMAT',

  // CEG (Constellation Energy)
  ceg: 'CEG',
  컨스텔레이션: 'CEG',
  컨스텔레이션에너지: 'CEG',
  '컨스텔레이션 에너지': 'CEG',
  constellation: 'CEG',

  // SPCX (스페이스X)
  spcx: 'SPCX',
  '스페이스x': 'SPCX',
  스페이스엑스: 'SPCX',
  스페이스: 'SPCX',
  spacex: 'SPCX',

  // 047050 (포스코인터내셔널)
  '047050': '047050',
  포스코인터내셔널: '047050',
  포스코인터: '047050',
  poscointernational: '047050',

  // 005930 (삼성전자)
  '005930': '005930',
  삼성전자: '005930',
  삼전: '005930',
  samsung: '005930',

  // 000660 (SK하이닉스)
  '000660': '000660',
  sk하이닉스: '000660',
  하이닉스: '000660',
  hynix: '000660',

  // 005380 (현대차)
  '005380': '005380',
  현대차: '005380',
  현대자동차: '005380',
  hyundai: '005380',

  // 035420 (NAVER)
  '035420': '035420',
  naver: '035420',
  네이버: '035420',
};

// 미지원 종목 식별 (친절한 가이드 제공용)
const UNSUPPORTED_ALIASES: Record<string, string> = {
  tsla: '테슬라 (TSLA)',
  테슬라: '테슬라 (TSLA)',
  tesla: '테슬라 (TSLA)',
  pltr: '팔란티어 (PLTR)',
  팔란티어: '팔란티어 (PLTR)',
  intc: '인텔 (INTC)',
  인텔: '인텔 (INTC)',
  coin: '코인베이스 (COIN)',
  코인베이스: '코인베이스 (COIN)',
  baba: '알리바바 (BABA)',
  알리바바: '알리바바 (BABA)',
  카카오: '카카오 (035720 - 향후 지원 예정)',
  '035720': '카카오 (035720 - 향후 지원 예정)',
  lg에너지솔루션: 'LG에너지솔루션 (373220 - 향후 지원 예정)',
  '373220': 'LG에너지솔루션 (373220 - 향후 지원 예정)',
};

/**
 * 대략적인 자연어 텍스트나 증권사 복사본에서 보유 종목, 수량, 평단가를 스마트하게 추출하는 함수
 */
export function parseSmartStockText(inputText: string): ParseResult {
  if (!inputText || !inputText.trim()) {
    return { items: [], unsupported: [], warnings: [] };
  }

  // 줄바꿈, 쉼표(,), 슬래시(/), 세미콜론(;) 기준으로 분할
  // 단, 숫자 사이의 쉼표(예: 1,000)는 분할되지 않도록 처리
  const sanitizedText = inputText.replace(/(\d),(\d)/g, '$1$2');
  const rawSegments = sanitizedText.split(/[\n/;,]+/).map((s) => s.trim()).filter(Boolean);

  const resultMap = new Map<string, ParsedStockItem>();
  const unsupportedSet = new Set<string>();
  const warnings: string[] = [];

  for (const segment of rawSegments) {
    const lower = segment.toLowerCase();

    // 1. 미지원 종목 체크
    for (const [alias, displayName] of Object.entries(UNSUPPORTED_ALIASES)) {
      if (lower.includes(alias.toLowerCase())) {
        unsupportedSet.add(displayName);
      }
    }

    // 2. 지원 종목 매칭
    let matchedSymbolId: string | null = null;
    // 긴 별칭 우선 매칭
    const sortedAliases = Object.keys(SYMBOL_ALIASES).sort((a, b) => b.length - a.length);
    for (const alias of sortedAliases) {
      // 정규식으로 단어 경계 또는 문자열 내 존재 확인
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9가-힣])${escaped}([^a-zA-Z0-9가-힣]|$)`, 'i');
      if (regex.test(segment) || lower.includes(alias.toLowerCase())) {
        matchedSymbolId = SYMBOL_ALIASES[alias];
        break;
      }
    }

    if (!matchedSymbolId) {
      // 탭이나 공백으로 분리된 첫 번째 단어에서 종목명 후보 추출
      const tokens = segment.split(/[\t,/\s]+/).filter(Boolean);
      const candidate = tokens[0]?.trim();
      if (candidate && candidate.length >= 2 && !/^\d+$/.test(candidate) && !/^[\$#@%]/.test(candidate)) {
        const alreadyCaptured = Array.from(unsupportedSet).some((u) => u.includes(candidate));
        if (!alreadyCaptured) {
          unsupportedSet.add(`${candidate} (분석 미지원)`);
        }
      }
      continue;
    }

    const sym = SUPPORTED_SYMBOLS.find((s) => s.id === matchedSymbolId);
    if (!sym) continue;

    // 3. 수량(Quantity) 추출
    // 패턴: 15주, 15 주, 15개, 15ea, 15 shares 또는 숫자 단독
    let quantity = 0;
    const qtyExplicitMatch = segment.match(/(\d+(?:\.\d+)?)\s*(?:주|개|ea|shares?)/i);
    if (qtyExplicitMatch) {
      quantity = parseFloat(qtyExplicitMatch[1]);
    }

    // 4. 평단가(Average Cost) 추출
    // 패턴: $140, 140달러, 140불, 140.50 usd, 140.50$
    let averageCost = 0;
    let costIsEstimated = false;

    const costExplicitMatch = segment.match(
      /(?:\$|usd|달러|불)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:\$|usd|달러|불)/i
    );
    if (costExplicitMatch) {
      const numStr = costExplicitMatch[1] || costExplicitMatch[2];
      averageCost = parseFloat(numStr);
    } else {
      // 원화(KRW)로 기재된 경우 (예: 200000원 -> 달러 환산)
      const krwMatch = segment.match(/(\d+(?:\.\d+)?)\s*(?:원|krw)/i);
      if (krwMatch) {
        const krw = parseFloat(krwMatch[1]);
        if (krw > 1000) {
          averageCost = Math.round((krw / 1400) * 10) / 10;
        }
      }
    }

    // 5. 명시적 단위가 없는데 숫자가 나열된 경우 (예: "NVDA 15 140")
    if (quantity === 0 || averageCost === 0) {
      // 6자리 한국 종목코드(047050 등) 및 이미 명시적으로 추출된 수량 부분은 숫자 후보에서 제외
      const segmentWithoutCodes = segment
        .replace(/\b\d{6}\b/g, '')
        .replace(/(\d+(?:\.\d+)?)\s*(?:주|개|ea|shares?)/gi, '');

      const remainingNumbers = segmentWithoutCodes.match(/\b\d+(?:\.\d+)?\b/g);
      if (remainingNumbers && remainingNumbers.length >= 2 && quantity === 0 && averageCost === 0) {
        quantity = parseFloat(remainingNumbers[0]);
        averageCost = parseFloat(remainingNumbers[1]);
      } else if (remainingNumbers && remainingNumbers.length >= 1) {
        if (quantity === 0) {
          quantity = parseFloat(remainingNumbers[0]);
        } else if (averageCost === 0) {
          averageCost = parseFloat(remainingNumbers[0]);
        }
      }
    }

    // 수량 기본값 (최소 1주)
    if (quantity <= 0) {
      quantity = 10; // 기본 수량 10주
    }

    // 단가 생략 시 현재 시장 추정가 사용
    if (averageCost <= 0) {
      averageCost = DEFAULT_CURRENT_PRICES[matchedSymbolId] || 150.0;
      costIsEstimated = true;
    }

    // 결과 맵에 저장 (중복 시 최신값 갱신)
    resultMap.set(matchedSymbolId, {
      symbol_id: matchedSymbolId,
      ticker: sym.ticker,
      name_ko: sym.name_ko,
      quantity,
      average_cost: Math.round(averageCost * 100) / 100,
      target_max_weight_percent: 20,
      cost_is_estimated: costIsEstimated,
      raw_text: segment,
    });
  }

  const items = Array.from(resultMap.values());
  const unsupported = Array.from(unsupportedSet);

  if (items.length === 0 && unsupported.length > 0) {
    warnings.push('입력하신 종목은 현재 MVP 20개 대형 우량주 지원 대상 외의 종목입니다.');
  }

  return {
    items,
    unsupported,
    warnings,
  };
}
