import React, { useEffect } from 'react';
import { StockAnalysis } from '../../core/types/analysis';
import { Symbol } from '../../core/types/models';
import { EnrichedPosition } from '../../stores/portfolioStore';
import { DetailHeader } from './DetailHeader';
import { EasyExplanation } from './EasyExplanation';
import { MyPositionBox } from './MyPositionBox';
import { FactorBars } from './FactorBars';
import { WhatChanged } from './WhatChanged';
import { CounterThesisBox } from './CounterThesisBox';
import { FutureCheckpointsBox } from './FutureCheckpointsBox';
import { DeepDiveBox } from './DeepDiveBox';
import { SourcesBox } from './SourcesBox';
import { HistoryTimelineBox } from './HistoryTimelineBox';
import { CorrectionBox } from './CorrectionBox';

interface StockDetailViewProps {
  symbol: Symbol;
  analysis: StockAnalysis;
  position?: EnrichedPosition;
  onBack: () => void;
}

export const StockDetailView: React.FC<StockDetailViewProps> = ({
  symbol,
  analysis,
  position,
  onBack,
}) => {
  // 상세 화면 진입 시 스크롤 최상단 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [symbol.id]);

  return (
    <div className="max-w-xl mx-auto px-4 py-2 pb-24">
      {/* A. 현재 결론 & 상단 네비게이션 */}
      <DetailHeader symbol={symbol} analysis={analysis} onBack={onBack} />

      {/* 정정 내역(Correction) 존재 시 최우선 표시 */}
      {analysis.corrections && analysis.corrections.length > 0 && (
        <CorrectionBox corrections={analysis.corrections} />
      )}

      {/* B. 쉬운 설명 (왜 X점인가요? 무슨 일 -> 기업 영향 -> 현재 판단) */}
      <EasyExplanation
        score={analysis.total_score}
        paragraphs={analysis.easy_explanation_paragraphs}
        thesis={analysis.thesis}
      />

      {/* C. 내 상황 (평균매수가, 현재가, 미실현 손익, 비중, 설정 한도 비교 및 분리 안내) */}
      <MyPositionBox
        position={position}
        scoreLabel={analysis.score_label}
        symbolName={symbol.name_ko}
      />

      {/* D. 5대 평가요인 막대 게이지 */}
      <FactorBars factors={analysis.factors} />

      {/* E. 무엇이 달라졌나 (직전 분석 비교 및 기여도 변동) */}
      <WhatChanged
        scoreChange={analysis.score_change}
        scoreChangeReason={analysis.score_change_reason_ko}
        previousScore={analysis.previous_score}
        currentScore={analysis.total_score}
        factors={analysis.factors}
      />

      {/* F. 반대 근거 & 리스크 */}
      <CounterThesisBox
        counterThesis={analysis.counter_thesis_ko}
        risks={analysis.key_risks_ko}
      />

      {/* G. 앞으로 확인할 것 (1~3개 핵심 조건) */}
      <FutureCheckpointsBox checkpoints={analysis.future_checkpoints} />

      {/* H. 상세 분석 (전문가용 지표 아코디언) */}
      <DeepDiveBox deepDive={analysis.deep_dive} />

      {/* I. 검증된 출처 문서 */}
      <SourcesBox sourceDocIds={analysis.source_document_ids} />

      {/* J. 과거 판단 이력 타임라인 */}
      <HistoryTimelineBox
        snapshots={analysis.history_snapshots}
        currentScore={analysis.total_score}
      />
    </div>
  );
};
