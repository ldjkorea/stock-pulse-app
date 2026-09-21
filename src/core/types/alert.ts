/**
 * 알림 시스템 타입 정의
 */
import { ScoreLabel } from './analysis';

export type AlertType =
  | 'SCORE_CHANGE_THRESHOLD'  // 점수 누적 변화 0.8 이상
  | 'LABEL_TRANSITION'        // 평가 단계 변경 (예: 우호적 -> 중립)
  | 'THESIS_SHIFT'            // 투자 논리 핵심 변화
  | 'EARNINGS_GUIDANCE'       // 실적 및 가이던스 변화
  | 'REGULATION'              // 중요한 규제
  | 'MEGA_CONTRACT'           // 대형 계약 체결
  | 'COMPETITION_SHIFT'       // 주요 경쟁 환경 변화
  | 'CORRECTION_ISSUED';      // 정정 발생

export interface AlertStockImpact {
  symbol_id: string;
  ticker: string;
  name_ko: string;
  previous_score: number;
  new_score: number;
  previous_label: ScoreLabel;
  new_label: ScoreLabel;
  impact_summary_ko: string;
}

export interface Alert {
  id: string;
  user_id?: string;
  type: AlertType;
  title: string;
  summary_ko: string;
  is_read: boolean;
  created_at: string;
  display_time_ko: string;
  
  // 단일 종목 또는 복수 종목 묶음 알림
  impacted_stocks: AlertStockImpact[];
  
  // 관련 이벤트 및 출처
  event_id?: string;
  source_doc_ids?: string[];
  correction_id?: string;
}
