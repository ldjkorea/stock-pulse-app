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
   * HTML 및 비정상 응답을 방어하는 안전한 JSON 파싱 헬퍼
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
      let errorMsg = `토스증권 API 오류 (${res.status})`;
      try {
        const errJson = JSON.parse(trimmed);
        if (errJson.message) errorMsg = errJson.message;
        else if (errJson.error_description) errorMsg = errJson.error_description;
        else if (errJson.error) errorMsg = String(errJson.error);
      } catch (_) {
        if (trimmed) errorMsg += `: ${trimmed.slice(0, 100)}`;
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
  public async getAccessToken(clientId?: string, clientSecret?: string): Promise<string> {
    const creds = this.getCredentials();
    const cId = clientId || creds?.clientId;
    const cSecret = clientSecret || creds?.clientSecret;

    if (!cId || !cSecret) {
      throw new Error('토스증권 Client ID와 Client Secret을 먼저 입력해주세요.');
    }

    // 캐시 확인
    const cached = this.getCachedToken();
    if (cached && !clientId) {
      return cached;
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
   */
  public async getAccounts(accessToken?: string): Promise<TossAccountInfo[]> {
    const token = accessToken || (await this.getAccessToken());
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/api/v1/accounts`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (netErr: any) {
      throw new Error(`계좌 목록 네트워크 요청 실패: ${netErr.message}`);
    }

    const data = await this.parseJsonResponse(res, '계좌 목록 조회');
    const rawList = Array.isArray(data) ? data : data.accounts || data.data || [];
    return rawList.map((item: any) => ({
      accountSeq: String(item.accountSeq || item.seq || item.id || ''),
      accountNo: String(item.accountNo || item.account_number || item.accountSeq || ''),
      accountName: item.accountName || item.name || '종합매매계좌',
    }));
  }

  /**
   * 토스증권 계좌의 보유 잔고(Holdings) 조회
   */
  public async getHoldings(accountSeq?: string, accessToken?: string): Promise<TossHoldingItem[]> {
    const token = accessToken || (await this.getAccessToken());
    let seq = accountSeq;

    if (!seq) {
      const creds = this.getCredentials();
      seq = creds?.accountSeq;
      if (!seq) {
        // 계좌 목록 조회해서 첫 번째 계좌 사용
        const accounts = await this.getAccounts(token);
        if (accounts.length === 0) {
          throw new Error('토스증권에 개설된 주식 계좌를 찾을 수 없습니다.');
        }
        seq = accounts[0].accountSeq;
        // 저장해둠
        if (creds) {
          this.saveCredentials({ ...creds, accountSeq: seq });
        }
      }
    }

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/api/v1/holdings`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tossinvest-Account': seq,
        },
      });
    } catch (netErr: any) {
      throw new Error(`보유 주식 잔고 네트워크 요청 실패: ${netErr.message}`);
    }

    const data = await this.parseJsonResponse(res, '보유 주식 잔고 조회');
    const rawHoldings = Array.isArray(data) ? data : data.holdings || data.data || [];

    const items: TossHoldingItem[] = [];

    for (const h of rawHoldings) {
      const rawSymbol = String(h.symbol || h.ticker || h.code || h.symbolId || '').trim();
      if (!rawSymbol) continue;

      const qty = parseFloat(String(h.quantity || h.qty || h.holdingQty || '0'));
      const avgPrice = parseFloat(String(h.averagePrice || h.averageCost || h.avgPrice || '0'));
      const curPrice = parseFloat(String(h.currentPrice || h.price || '0'));
      const isKrw = /^\d{6}$/.test(rawSymbol);

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
    const holdings = await this.getHoldings();
    const convertedPositions: Position[] = [];
    let unsupportedCount = 0;

    for (const h of holdings) {
      // 대소문자 정규화
      const upper = h.symbol.toUpperCase();
      const matched = SUPPORTED_SYMBOLS.find(
        (s) => s.id.toUpperCase() === upper || s.ticker.toUpperCase() === upper
      );

      if (!matched) {
        unsupportedCount++;
        continue;
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
    const creds = this.getCredentials();
    if (creds) {
      this.saveCredentials({
        ...creds,
        lastConnectedAt: new Date().toLocaleString('ko-KR'),
      });
    }

    return {
      positions: convertedPositions,
      syncedCount: convertedPositions.length,
      unsupportedCount,
    };
  }
}

export const tossApiService = TossApiService.getInstance();
