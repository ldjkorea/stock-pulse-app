import React, { useEffect } from 'react';
import { StockAnalysis } from '../../core/types/analysis';
import { Symbol } from '../../core/types/models';
import { EnrichedPosition } from '../../stores/portfolioStore';
import { getMockPriceForSymbol } from '../../mock/mockScenarios';
import { DetailHeader } from './DetailHeader';
import { EasyExplanation } from './EasyExplanation';
import { MyPositionBox } from './MyPositionBox';
import { RsiSynergyBox } from './RsiSynergyBox';
import { TenIndicatorsBox } from './TenIndicatorsBox';
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

  const priceSnapshot = position?.price_snapshot || getMockPriceForSymbol(symbol.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 md:pb-12">
      {/* A. 현재 결론 & 상단 네비게이션 */}
      <DetailHeader
        symbol={symbol}
        analysis={analysis}
        onBack={onBack}
        rsiValue={priceSnapshot?.rsi}
        position={position}
      />

      {/* 정정 내역(Correction) 존재 시 최우선 표시 */}
      {analysis.corrections && analysis.corrections.length > 0 && (
        <div className="mt-4">
          <CorrectionBox corrections={analysis.corrections} />
        </div>
      )}

      {/* 데스크톱: 좌우 2열 분할 그리드 (모바일: 단일 1열 스택) */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측 컬럼: 핵심 스토리, 내 상황, RSI 시너지, 10대 지표 점검 (7열) */}
        <div className="lg:col-span-7 space-y-4">
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

          {/* C-1. 실시간 RSI 수급 타이밍 및 펀더멘털 결합 분석 */}
          <RsiSynergyBox
            priceSnapshot={priceSnapshot}
            totalScore={analysis.total_score}
            scoreLabel={analysis.score_label}
            symbolName={symbol.name_ko}
          />

          {/* C-2. 10대 핵심 투자 지표 종합 점검표 */}
          <TenIndicatorsBox
            symbolId={symbol.id}
            symbolName={symbol.name_ko}
            rsiValue={priceSnapshot?.rsi}
          />
        </div>

        {/* 우측 컬럼: 팩터 막대, 변화점, 리스크, 체크포인트, 딥다이브, 출처, 타임라인 (5열) */}
        <div className="lg:col-span-5 space-y-4">
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
      </div>
    </div>
  );
};
