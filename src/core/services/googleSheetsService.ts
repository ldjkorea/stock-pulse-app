import { Position } from '../types/models';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';
import { EnrichedPosition } from '../../stores/portfolioStore';

const STORAGE_KEY_GOOGLE_SHEET_URL = 'stock_pulse_google_sheet_url_v1';
const STORAGE_KEY_LAST_SYNCED = 'stock_pulse_google_sheet_last_synced_v1';

export interface GoogleSheetSyncResult {
  success: boolean;
  message: string;
  count?: number;
  positions?: Position[];
  syncedAt?: string;
}

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;

  private constructor() {}

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  /**
   * 저장된 Web App URL 조회
   */
  public getWebAppUrl(): string {
    try {
      return localStorage.getItem(STORAGE_KEY_GOOGLE_SHEET_URL) || '';
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  /**
   * Web App URL 저장
   */
  public saveWebAppUrl(url: string): void {
    const trimmed = url.trim();
    localStorage.setItem(STORAGE_KEY_GOOGLE_SHEET_URL, trimmed);
  }

  /**
   * Web App URL 삭제
   */
  public clearWebAppUrl(): void {
    localStorage.removeItem(STORAGE_KEY_GOOGLE_SHEET_URL);
    localStorage.removeItem(STORAGE_KEY_LAST_SYNCED);
  }

  /**
   * 마지막 동기화 일시 조회
   */
  public getLastSyncedTime(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_LAST_SYNCED);
    } catch {
      return null;
    }
  }

  private setLastSyncedTime(): void {
    const now = new Date().toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    localStorage.setItem(STORAGE_KEY_LAST_SYNCED, now);
  }

  /**
   * 현재 포트폴리오를 구글 시트로 내보내기/저장
   */
  public async exportToGoogleSheet(positions: (Position | EnrichedPosition)[]): Promise<GoogleSheetSyncResult> {
    const url = this.getWebAppUrl();
    if (!url) {
      return { success: false, message: '구글 시트 Web App URL이 등록되지 않았습니다.' };
    }

    try {
      // 종목 데이터 가공
      const payloadPositions = positions.map((p) => {
        const sym = SUPPORTED_SYMBOLS.find((s) => s.id === p.symbol_id);
        return {
          symbol_id: p.symbol_id,
          name_ko: sym?.name_ko || p.symbol_id,
          quantity: p.quantity,
          average_cost: p.average_cost,
          currency: sym?.currency || p.currency || 'USD',
          target_max_weight_percent: p.target_max_weight_percent || 20,
          investment_horizon: p.investment_horizon || 'MEDIUM',
        };
      });

      // text/plain 방식으로 전송하여 브라우저 CORS 프리플라이트(OPTIONS) 우회
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'save_portfolio',
          payload: {
            positions: payloadPositions,
          },
        }),
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`구글 서버 응답 오류 (${response.status})`);
      }

      const resJson = await response.json();
      if (!resJson.success) {
        throw new Error(resJson.error || '시트 저장 실패');
      }

      this.setLastSyncedTime();

      return {
        success: true,
        message: `${payloadPositions.length}개 종목이 구글 시트에 성공적으로 저장되었습니다!`,
        count: payloadPositions.length,
        syncedAt: this.getLastSyncedTime() || undefined,
      };
    } catch (err: any) {
      console.error('구글 시트 저장 실패:', err);
      return {
        success: false,
        message: `구글 시트 저장 중 오류: ${err.message || '네트워크 연결 실패'}`,
      };
    }
  }

  /**
   * 구글 시트로부터 최신 포트폴리오 불러오기(동기화)
   */
  public async importFromGoogleSheet(): Promise<GoogleSheetSyncResult> {
    const url = this.getWebAppUrl();
    if (!url) {
      return { success: false, message: '구글 시트 Web App URL이 등록되지 않았습니다.' };
    }

    try {
      // GET 요청을 통한 시트 데이터 조회
      const queryUrl = url.includes('?') ? `${url}&action=load_portfolio` : `${url}?action=load_portfolio`;
      const response = await fetch(queryUrl, {
        method: 'GET',
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`구글 서버 응답 오류 (${response.status})`);
      }

      const resJson = await response.json();
      if (!resJson.success) {
        throw new Error(resJson.error || '시트 불러오기 실패');
      }

      const rawList = resJson.positions || [];
      if (!Array.isArray(rawList)) {
        throw new Error('시트 데이터 형식이 올바르지 않습니다.');
      }

      // Position 포맷으로 정규화 및 검증
      const validPositions: Position[] = [];
      const seen = new Set<string>();

      for (const item of rawList) {
        const symbolId = String(item.symbol_id || '').toUpperCase().trim();
        const qty = Number(item.quantity);
        const cost = Number(item.average_cost);

        if (!symbolId || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) {
          continue;
        }

        if (seen.has(symbolId)) continue;
        seen.add(symbolId);

        const sym = SUPPORTED_SYMBOLS.find((s) => s.id === symbolId);

        validPositions.push({
          id: `POS_${symbolId}_${Date.now()}`,
          user_id: 'USER_1',
          portfolio_id: 'PF_1',
          symbol_id: symbolId,
          quantity: qty,
          average_cost: cost,
          currency: sym?.currency || item.currency || 'USD',
          target_max_weight_percent: Number(item.target_max_weight_percent) || 20,
          investment_horizon: item.investment_horizon === 'SHORT' || item.investment_horizon === 'LONG' ? item.investment_horizon : 'MEDIUM',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      this.setLastSyncedTime();

      return {
        success: true,
        message: `${validPositions.length}개 종목을 구글 시트에서 성공적으로 불러왔습니다!`,
        count: validPositions.length,
        positions: validPositions,
        syncedAt: this.getLastSyncedTime() || undefined,
      };
    } catch (err: any) {
      console.error('구글 시트 불러오기 실패:', err);
      return {
        success: false,
        message: `구글 시트 불러오기 오류: ${err.message || 'URL을 확인해주세요.'}`,
      };
    }
  }
}

export const googleSheetsService = GoogleSheetsService.getInstance();
