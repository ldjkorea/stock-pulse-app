import { Position } from '../types/models';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';

export interface TossCredentials {
  clientId: string;
  clientSecret: string;
  accountSeq?: string;
  lastConnectedAt?: string;
}

export interface TossTokenInfo {
  accessToken: string;
  expiresAt: number; // timestamp
}

export interface TossAccountInfo {
  accountSeq: string;
  accountNo: string;
  accountName?: string;
  accountType?: string;
}

export interface TossHoldingItem {
  symbol: string;         // 'AMAT', '047050' 등
  name?: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  currency?: 'USD' | 'KRW';
}

const STORAGE_KEY_CREDENTIALS = 'stock_pulse_toss_credentials_v1';
const STORAGE_KEY_TOKEN = 'stock_pulse_toss_token_v1';

export class TossApiService {
  private static instance: TossApiService;

  private constructor() {}

  public static getInstance(): TossApiService {
    if (!TossApiService.instance) {
      TossApiService.instance = new TossApiService();
    }
    return TossApiService.instance;
  }

  /**
   * 로컬 개발 환경(Vite Reverse Proxy 구동 환경) 여부 확인
   */
  public isLocalEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  }

  /**
   * API Base URL 결정 (로컬 개발 환경에서는 Vite 프록시, 기타 환경에서는 직접 호출)
   */
  public getBaseUrl(): string {
    if (this.isLocalEnvironment()) {
      return '/toss-api';
    }
    return 'https://openapi.tossinvest.com';
  }

  /**
   * 저장된 인증정보 조회
   */
  public getCredentials(): TossCredentials | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CREDENTIALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('토스 인증정보 로드 실패:', e);
    }
    return null;
  }

  /**
   * 인증정보 안전 저장 (기기 브라우저 LocalStorage에만 저장)
   */
  public saveCredentials(creds: TossCredentials): void {
    localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(creds));
  }

  /**
   * 인증정보 영구 삭제
   */
  public clearCredentials(): void {
    localStorage.removeItem(STORAGE_KEY_CREDENTIALS);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }

  /**
   * 캐시된 토큰 조회
   */
  private getCachedToken(): string | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (saved) {
        const tokenInfo: TossTokenInfo = JSON.parse(saved);
        // 만료 1분 전까지 유효한 것으로 처리
        if (Date.now() < tokenInfo.expiresAt - 60000) {
          return tokenInfo.accessToken;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  /**
   * 토큰 캐시 강제 무효화
   */
  public invalidateToken(): void {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }

  /**
   * HTML 및 비정상 응답을 방어하는 안전한 JSON 파싱 헬퍼 (토스증권 error 객체 완벽 대응)
   */
  private async parseJsonResponse(res: Response, endpointName: string): Promise<any> {
    const rawText = await res.text();
    const trimmed = rawText.trim();

    // 응답이 HTML(<!doctype 또는 <html)인 경우 감지하여 상세 원인 안내
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      if (!this.isLocalEnvironment()) {
        throw new Error(
          '토스증권 API는 보안 규정(CORS)으로 인해 웹 배포 환경(GitHub Pages)에서의 브라우저 직접 호출을 차단합니다. PC에 구동 중인 로컬 개발 환경(http://localhost:5173)에서 접속하시면 Vite 역방향 프록시를 통해 즉시 정상 연동됩니다.'
        );
      } else {
        throw new Error(
          `토스증권 API 응답 대신 HTML 웹페이지가 수신되었습니다 (${endpointName}). Vite 개발 서버 프록시 라우팅을 점검해주세요.`
        );
      }
    }

    if (!res.ok) {
      // 401 Unauthorized인 경우 캐시된 토큰 무효화
      if (res.status === 401) {
        this.invalidateToken();
      }

      let errorMsg = `토스증권 API 오류 (${res.status})`;
      try {
        const errJson = JSON.parse(trimmed);
        if (errJson.error && typeof errJson.error === 'object') {
          const innerMsg = errJson.error.message || errJson.error.code || JSON.stringify(errJson.error);
          errorMsg = `${innerMsg}${errJson.error.code ? ` [코드: ${errJson.error.code}]` : ''}`;
        } else if (errJson.message) {
          errorMsg = typeof errJson.message === 'string' ? errJson.message : JSON.stringify(errJson.message);
        } else if (errJson.error_description) {
          errorMsg = String(errJson.error_description);
        } else if (errJson.error) {
          errorMsg = typeof errJson.error === 'string' ? errJson.error : JSON.stringify(errJson.error);
        }
      } catch (_) {
        if (trimmed) errorMsg += `: ${trimmed.slice(0, 150)}`;
      }
      throw new Error(errorMsg);
    }

    try {
      return JSON.parse(trimmed);
    } catch (parseErr: any) {
      throw new Error(`토스증권 데이터 파싱 실패 (${endpointName}): ${parseErr.message}`);
    }
  }

  /**
   * OAuth2 Access Token 발급
   */
  public async getAccessToken(clientId?: string, clientSecret?: string, forceRefresh = false): Promise<string> {
    const creds = this.getCredentials();
    const cId = clientId || creds?.clientId;
    const cSecret = clientSecret || creds?.clientSecret;

    if (!cId || !cSecret) {
      throw new Error('토스증권 Client ID와 Client Secret을 먼저 입력해주세요.');
    }

    // 캐시 확인 (강제 갱신이 아닐 때)
    if (!forceRefresh) {
      const cached = this.getCachedToken();
      if (cached && !clientId) {
        return cached;
      }
    }

    const baseUrl = this.getBaseUrl();
    const tokenUrl = `${baseUrl}/oauth2/token`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: cId.trim(),
      client_secret: cSecret.trim(),
    });

    let res: Response;
    try {
      res = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
    } catch (netErr: any) {
      if (!this.isLocalEnvironment()) {
        throw new Error(
          '토스증권 서버와 통신할 수 없습니다 (브라우저 CORS 차단). 금융 보안 규정에 따라 웹 배포 환경에서는 증권사 API 직접 호출이 차단되므로, 로컬 환경(http://localhost:5173)에서 접속해 주세요.'
        );
      }
      if (netErr.name === 'TypeError' && netErr.message?.includes('Failed to fetch')) {
        throw new Error(
          '토스증권 서버와 통신할 수 없습니다. 토스증권 개발자 센터(developers.tossinvest.com)의 [허용 IP 관리]에 현재 접속 중인 공인 IP가 등록되어 있는지 확인해주세요.'
        );
      }
      throw netErr;
    }

    const data = await this.parseJsonResponse(res, 'OAuth2 토큰 발급');
    const token = data.access_token;
    if (!token) {
      throw new Error('토큰 발급 응답에 access_token 필드가 없습니다.');
    }
    const expiresIn = data.expires_in || 86400;

    // 캐싱 저장
    const tokenInfo: TossTokenInfo = {
      accessToken: token,
      expiresAt: Date.now() + expiresIn * 1000,
    };
    localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(tokenInfo));

    return token;
  }

  /**
   * 계좌 목록 및 기본 accountSeq 조회
   * 토스증권 OpenAPI 스펙: GET /api/v1/accounts
   * 응답: { result: [ { accountNo: "...", accountSeq: 1, accountType: "BROKERAGE" } ] }
   */
  public async getAccounts(accessToken?: string): Promise<TossAccountInfo[]> {
    let token = accessToken || (await this.getAccessToken());
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/api/v1/accounts`;

    let res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 401이면 토큰 만료 가능성이 있으므로 즉시 토큰 강제 갱신 후 1회 재시도
    if (res.status === 401) {
      this.invalidateToken();
      token = await this.getAccessToken(undefined, undefined, true);
      res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    const data = await this.parseJsonResponse(res, '계좌 목록 조회');

    // 토스증권 공식 응답 구조 파싱 ({ result: [...] })
    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && Array.isArray(data.result)) {
      rawList = data.result;
    } else if (data && Array.isArray(data.accounts)) {
      rawList = data.accounts;
    } else if (data && Array.isArray(data.data)) {
      rawList = data.data;
    }

    return rawList.map((item: any) => ({
      accountSeq: String(item.accountSeq ?? item.seq ?? item.id ?? ''),
      accountNo: String(item.accountNo ?? item.account_number ?? item.accountSeq ?? ''),
      accountName:
        item.accountType === 'BROKERAGE'
          ? '종합매매계좌'
          : item.accountName || item.name || '주식계좌',
      accountType: item.accountType,
    }));
  }

  /**
   * 토스증권 계좌의 보유 잔고(Holdings) 조회
   * 토스증권 OpenAPI 스펙: GET /api/v1/holdings
   * 헤더: X-Tossinvest-Account: {accountSeq}
   * 응답: { result: { items: [ { symbol, name, quantity, averagePurchasePrice, lastPrice, currency, marketCountry } ] } }
   */
  public async getHoldings(accountSeq?: string, accessToken?: string): Promise<TossHoldingItem[]> {
    let token = accessToken || (await this.getAccessToken());
    let seq = accountSeq;

    // 계좌 번호가 없으면 계좌 목록을 조회하여 첫 번째 계좌 자동 선택
    if (!seq) {
      const creds = this.getCredentials();
      const accounts = await this.getAccounts(token);
      if (accounts.length === 0) {
        throw new Error('토스증권에 개설된 주식 계좌를 찾을 수 없습니다. 토스증권 앱에서 증권 계좌가 정상 개설되어 있는지 확인해주세요.');
      }
      seq = accounts[0].accountSeq;
      if (creds) {
        this.saveCredentials({ ...creds, accountSeq: seq });
      }
    }

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/api/v1/holdings`;

    let res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tossinvest-Account': String(seq),
      },
    });

    // 401이면 토큰 강제 갱신 후 1회 재시도
    if (res.status === 401) {
      this.invalidateToken();
      token = await this.getAccessToken(undefined, undefined, true);
      res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tossinvest-Account': String(seq),
        },
      });
    }

    const data = await this.parseJsonResponse(res, '보유 주식 잔고 조회');

    // 토스증권 공식 응답 구조 파싱 ({ result: { items: [...] } })
    let rawHoldings: any[] = [];
    if (Array.isArray(data)) {
      rawHoldings = data;
    } else if (data && data.result) {
      if (Array.isArray(data.result.items)) {
        rawHoldings = data.result.items;
      } else if (Array.isArray(data.result)) {
        rawHoldings = data.result;
      }
    } else if (data && Array.isArray(data.items)) {
      rawHoldings = data.items;
    } else if (data && Array.isArray(data.holdings)) {
      rawHoldings = data.holdings;
    } else if (data && Array.isArray(data.data)) {
      rawHoldings = data.data;
    }

    const items: TossHoldingItem[] = [];

    for (const h of rawHoldings) {
      const rawSymbol = String(h.symbol || h.ticker || h.code || h.symbolId || '').trim();
      if (!rawSymbol) continue;

      const qty = parseFloat(String(h.quantity || h.qty || h.holdingQty || '0'));
      const avgPrice = parseFloat(
        String(h.averagePurchasePrice || h.averagePrice || h.averageCost || h.avgPrice || '0')
      );
      const curPrice = parseFloat(
        String(h.lastPrice || h.currentPrice || h.price || '0')
      );
      const isKrw = h.currency === 'KRW' || h.marketCountry === 'KR' || /^\d{6}$/.test(rawSymbol);

      items.push({
        symbol: rawSymbol,
        name: h.name || h.stockName || rawSymbol,
        quantity: qty,
        averagePrice: avgPrice,
        currentPrice: curPrice,
        currency: isKrw ? 'KRW' : 'USD',
      });
    }

    return items;
  }

  /**
   * 토스증권 잔고 데이터를 Stock Pulse의 Position[] 객체 배열로 변환
   */
  public async syncPositionsFromToss(): Promise<{
    positions: Position[];
    syncedCount: number;
    unsupportedCount: number;
  }> {
    // 계좌 목록부터 새로 확인하여 accountSeq 보장
    const creds = this.getCredentials();
    const token = await this.getAccessToken();
    const accounts = await this.getAccounts(token);

    if (accounts.length === 0) {
      throw new Error('토스증권에 개설된 주식 계좌를 찾을 수 없습니다.');
    }

    const activeSeq = accounts[0].accountSeq;
    if (creds) {
      this.saveCredentials({ ...creds, accountSeq: activeSeq });
    }

    const holdings = await this.getHoldings(activeSeq, token);
    const convertedPositions: Position[] = [];

    for (const h of holdings) {
      const upper = h.symbol.toUpperCase();
      let matched = SUPPORTED_SYMBOLS.find(
        (s) => s.id.toUpperCase() === upper || s.ticker.toUpperCase() === upper
      );

      // 만약 기존 사전 목록에 없는 종목이라도 동적으로 자동 등록하여 누락 방지
      if (!matched) {
        matched = {
          id: upper,
          ticker: upper,
          name_ko: h.name || upper,
          name_en: h.name || upper,
          sector: h.currency === 'KRW' ? '국내 시장 종목' : '해외 시장 종목',
          currency: h.currency || (h.averagePrice > 1000 ? 'KRW' : 'USD'),
          is_supported: true,
          description: `토스증권 계좌에서 실시간 연동된 종목 (${h.name || upper})`,
        };
        SUPPORTED_SYMBOLS.push(matched);
      }

      convertedPositions.push({
        id: `POS_TOSS_${matched.id}`,
        user_id: 'USER_DEFAULT',
        portfolio_id: 'PF_DEFAULT',
        symbol_id: matched.id,
        quantity: h.quantity > 0 ? h.quantity : 1,
        average_cost: h.averagePrice > 0 ? h.averagePrice : (h.currentPrice || 100),
        currency: matched.currency || h.currency || 'USD',
        target_max_weight_percent: 20,
        investment_horizon: 'LONG',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 인증정보에 최종 동기화 시간 기록
    if (creds) {
      this.saveCredentials({
        ...creds,
        accountSeq: activeSeq,
        lastConnectedAt: new Date().toLocaleString('ko-KR'),
      });
    }

    return {
      positions: convertedPositions,
      syncedCount: convertedPositions.length,
      unsupportedCount: 0,
    };
  }
}

export const tossApiService = TossApiService.getInstance();
