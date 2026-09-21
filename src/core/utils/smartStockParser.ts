import { SUPPORTED_SYMBOLS } from '../../mock/symbols';

export interface ParsedStockItem {
  symbol_id: string;
  ticker: string;
  name_ko: string;
  quantity: number;
  average_cost: number;
  target_max_weight_percent: number;
  cost_is_estimated: boolean;
  raw_text: string;
}

export interface ParseResult {
  items: ParsedStockItem[];
  unsupported: string[];
  warnings: string[];
}

// 지원 종목별 기본 추정가 (실시간 체결 시세 동기화)
export const DEFAULT_CURRENT_PRICES: Record<string, number> = {
  NVDA: 225.65,
  MSFT: 494.34,
  GOOGL: 356.32,
  AVGO: 360.66,
  LLY: 1159.17,
  AAPL: 228.50,
  AMZN: 189.20,
  META: 575.40,
  TSM: 174.80,
  ASML: 842.00,
  QCOM: 166.50,
  AMD: 156.20,
  CRM: 264.30,
  NFLX: 692.00,
  COST: 895.00,
  ADBE: 518.50,
  INTU: 654.00,
  TXN: 203.20,
  NOW: 845.00,
  AMAT: 461.47,
  CEG: 265.18,
  SPCX: 155.24,
  '047050': 58300,
  '005930': 73500,
  '000660': 188000,
  '005380': 242000,
  '035420': 191500,
};

// 증권사 복사본에서 스킵할 헤더 및 무의미한 단어
const IGNORE_HEADER_TOKENS = [
  '국내주식', '해외주식', '미국주식', '보유주식', '내 주식', '내주식',
  '포트폴리오', '종목명', '현재가', '평균단가', '수익률', '평가손익',
  '매입금액', '평가금액', '보유수량', '국내', '해외', '미국', '주식'
];

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
  '알파벳 a': 'GOOGL',
  '알파벳a': 'GOOGL',
  알파벳: 'GOOGL',
  구글: 'GOOGL',
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
  암드: 'AMD',

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
  어플라이드머티리얼즈: 'AMAT',
  '어플라이드 머티리얼즈': 'AMAT',
  어플라이드머티어리얼즈: 'AMAT',
  '어플라이드 머티어리얼즈': 'AMAT',
  어플라이드: 'AMAT',
  applied: 'AMAT',

  // CEG (Constellation Energy)
  ceg: 'CEG',
  컨스털레이션에너지: 'CEG',
  '컨스털레이션 에너지': 'CEG',
  컨스털레이션: 'CEG',
  컨스텔레이션에너지: 'CEG',
  '컨스텔레이션 에너지': 'CEG',
  컨스텔레이션: 'CEG',
  constellation: 'CEG',

  // SPCX (스페이스X)
  spcx: 'SPCX',
  '스페이스x': 'SPCX',
  스페이스엑스: 'SPCX',
  '스페이스 엑스': 'SPCX',
  스페이스: 'SPCX',
  spacex: 'SPCX',

  // 047050 (포스코인터내셔널)
  '047050': '047050',
  포스코인터내셔널: '047050',
  포스코인터: '047050',
  포인: '047050',
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
 * 텍스트에서 종목 ID를 탐지하는 헬퍼
 */
function detectSymbolId(text: string): string | null {
  const lower = text.toLowerCase().trim();
  const sortedAliases = Object.keys(SYMBOL_ALIASES).sort((a, b) => b.length - a.length);

  for (const alias of sortedAliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9가-힣])${escaped}([^a-zA-Z0-9가-힣]|$)`, 'i');
    if (regex.test(text) || lower === alias.toLowerCase() || lower.startsWith(alias.toLowerCase() + ' ') || lower.endsWith(' ' + alias.toLowerCase())) {
      return SYMBOL_ALIASES[alias];
    }
  }
  return null;
}

/**
 * 대략적인 자연어 텍스트나 증권사 복사본에서 보유 종목, 수량, 평단가를 스마트하게 추출하는 함수
 * (한 줄 포맷 및 증권사 멀티라인 복사 포맷 모두 완벽 지원)
 */
export function parseSmartStockText(inputText: string): ParseResult {
  if (!inputText || !inputText.trim()) {
    return { items: [], unsupported: [], warnings: [] };
  }

  // 1. 천 단위 쉼표 제거 (예: 1,017.85 -> 1017.85, 58,300 -> 58300)
  const sanitizedText = inputText.replace(/(\d),(\d)/g, '$1$2');

  // 줄바꿈 기준으로 1차 분할
  const rawLines = sanitizedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const lines: string[] = [];

  for (const rawLine of rawLines) {
    // 만약 한 줄에 쉼표(,)나 세미콜론(;)이 있는 경우 분할 (예: "엔비디아 15주 140달러, 마소 10주 420불")
    if (rawLine.includes(',') || rawLine.includes(';')) {
      const parts = rawLine.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
      lines.push(...parts);
    } else {
      lines.push(rawLine);
    }
  }

  const resultMap = new Map<string, ParsedStockItem>();
  const unsupportedSet = new Set<string>();
  const warnings: string[] = [];

  // 멀티라인 블록 빌더 상태
  let currentSymbolId: string | null = null;
  let currentQuantity = 0;
  let currentAverageCost = 0;
  let currentRawLines: string[] = [];
  let currentEstimatedCost = 0;

  const commitCurrentBlock = () => {
    if (!currentSymbolId) return;

    const sym = SUPPORTED_SYMBOLS.find((s) => s.id === currentSymbolId);
    if (!sym) return;

    let finalCost = currentAverageCost;
    let costIsEstimated = false;

    // 평단가가 0이거나 미입력인 경우
    if (finalCost <= 0) {
      if (currentEstimatedCost > 0) {
        finalCost = currentEstimatedCost;
      } else {
        finalCost = DEFAULT_CURRENT_PRICES[currentSymbolId] || 150.0;
        costIsEstimated = true;
      }
    }

    const finalQty = currentQuantity > 0 ? currentQuantity : 1; // 기본 수량 1주

    resultMap.set(currentSymbolId, {
      symbol_id: currentSymbolId,
      ticker: sym.ticker,
      name_ko: sym.name_ko,
      quantity: finalQty,
      average_cost: Math.round(finalCost * 100) / 100,
      target_max_weight_percent: 20,
      cost_is_estimated: costIsEstimated,
      raw_text: currentRawLines.join(' | '),
    });

    // 상태 리셋
    currentSymbolId = null;
    currentQuantity = 0;
    currentAverageCost = 0;
    currentRawLines = [];
    currentEstimatedCost = 0;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // 0. 증권사 섹션 헤더 단독 줄 무시 (예: "국내주식", "해외주식")
    if (IGNORE_HEADER_TOKENS.includes(lowerLine)) {
      continue;
    }

    // 1. 미지원 종목 탐지
    for (const [alias, displayName] of Object.entries(UNSUPPORTED_ALIASES)) {
      if (lowerLine.includes(alias.toLowerCase())) {
        unsupportedSet.add(displayName);
      }
    }

    // 2. 새 종목 탐지
    const matchedId = detectSymbolId(line);

    if (matchedId) {
      // 이전 블록이 있으면 먼저 커밋
      if (currentSymbolId) {
        commitCurrentBlock();
      }

      currentSymbolId = matchedId;
      currentRawLines.push(line);

      // 같은 줄에 수량이나 단가가 포함되어 있는지 확인 (한 줄 포맷 호환)
      // 수량 추출
      const qtyMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:주|개|ea|shares?)/i);
      if (qtyMatch) {
        currentQuantity = parseFloat(qtyMatch[1]);
      }

      // 평단가 추출
      const costMatch = line.match(/(?:내\s*평균\s*)?(?:\$|usd|달러|불)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:\$|usd|달러|불)/i);
      if (costMatch) {
        const num = parseFloat(costMatch[1] || costMatch[2]);
        if (num > 0) currentAverageCost = num;
      } else {
        const krwMatch = line.match(/(?:내\s*평균\s*)?(\d+(?:\.\d+)?)\s*(?:원|krw)/i);
        if (krwMatch) {
          const num = parseFloat(krwMatch[1]);
          if (num > 0) currentAverageCost = num;
        }
      }

      // 단위 없는 숫자 나열 검사 (예: "NVDA 15 140", "LLY 5 950")
      if (currentQuantity === 0 || currentAverageCost === 0) {
        const lineWithoutCode = line
          .replace(/\b\d{6}\b/g, '')
          .replace(/(\d+(?:\.\d+)?)\s*(?:주|개|ea|shares?)/gi, '');
        const nums = lineWithoutCode.match(/\b\d+(?:\.\d+)?\b/g);
        if (nums && nums.length >= 2 && currentQuantity === 0 && currentAverageCost === 0) {
          currentQuantity = parseFloat(nums[0]);
          currentAverageCost = parseFloat(nums[1]);
        } else if (nums && nums.length >= 1) {
          if (currentQuantity === 0) currentQuantity = parseFloat(nums[0]);
          else if (currentAverageCost === 0) currentAverageCost = parseFloat(nums[0]);
        }
      }

      continue;
    }

    // 만약 현재 추적 중인 종목 블록이 있는 경우, 부가 정보 추출
    if (currentSymbolId) {
      currentRawLines.push(line);

      // A. "내 평균 $286.15" 또는 "내 평균 0원" 또는 "내평균 58300원" 패턴
      const myAvgMatch = line.match(/내\s*평균\s*(?:\$|usd)?\s*(\d+(?:\.\d+)?)\s*(?:원|달러|불|krw|usd)?/i);
      if (myAvgMatch) {
        const avgNum = parseFloat(myAvgMatch[1]);
        if (avgNum > 0) {
          currentAverageCost = avgNum;
        }
        continue;
      }

      // B. 수량 패턴 (예: "1주", "15주")
      const qtyMatch = line.match(/^(\d+(?:\.\d+)?)\s*(?:주|개|ea|shares?)$/i);
      if (qtyMatch) {
        currentQuantity = parseFloat(qtyMatch[1]);
        continue;
      }

      // C. 현재가 단독 라인 (예: "$461.47", "58300원")
      const priceOnlyMatch = line.match(/^(?:\$|usd)?\s*(\d+(?:\.\d+)?)\s*(?:원|달러|불|krw)?$/i);
      if (priceOnlyMatch) {
        const pNum = parseFloat(priceOnlyMatch[1]);
        if (pNum > 0) {
          currentEstimatedCost = pNum;
        }
        continue;
      }

      // D. 등락률 단독 라인 (예: "+3.80%", "-1.5%") -> 스킵
      if (/^[+-]?\d+(?:\.\d+)?%$/.test(line)) {
        continue;
      }
    } else {
      // 종목이 아직 매칭되지 않은 일반 줄
      // 쉼표나 슬래시로 한 줄에 여러 종목이 있을 수 있는 레거시 지원
      const tokens = line.split(/[\t,/\s]+/).filter(Boolean);
      const candidate = tokens[0]?.trim();
      if (
        candidate &&
        candidate.length >= 2 &&
        !/^\d+$/.test(candidate) &&
        !/^[\$#@%+-]/.test(candidate) &&
        !IGNORE_HEADER_TOKENS.includes(candidate.toLowerCase())
      ) {
        const alreadyCaptured = Array.from(unsupportedSet).some((u) => u.includes(candidate));
        if (!alreadyCaptured) {
          unsupportedSet.add(`${candidate} (분석 미지원)`);
        }
      }
    }
  }

  // 마지막 블록 커밋
  if (currentSymbolId) {
    commitCurrentBlock();
  }

  const items = Array.from(resultMap.values());
  const unsupported = Array.from(unsupportedSet);

  if (items.length === 0 && unsupported.length > 0) {
    warnings.push('입력하신 종목은 현재 MVP 대형 우량주 지원 대상 외의 종목입니다.');
  }

  return {
    items,
    unsupported,
    warnings,
  };
}
