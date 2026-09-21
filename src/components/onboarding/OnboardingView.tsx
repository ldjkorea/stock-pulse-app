import React, { useState } from 'react';
import { Search, Plus, Trash2, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Position } from '../../core/types/models';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';
import { INITIAL_DEMO_POSITIONS } from '../../stores/portfolioStore';
import { SmartImportModal } from '../portfolio/SmartImportModal';

interface OnboardingViewProps {
  onComplete: (positions: Position[]) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  // 포지션 입력 목록
  const [positions, setPositions] = useState<Omit<Position, 'id' | 'created_at' | 'updated_at'>[]>([
    {
      user_id: 'USER_1',
      portfolio_id: 'PF_1',
      symbol_id: 'NVDA',
      quantity: 15,
      average_cost: 140,
      currency: 'USD',
      target_max_weight_percent: 25,
      investment_horizon: 'MEDIUM',
    },
  ]);

  const [showSmartModal, setShowSmartModal] = useState(false);

  // 종목 검색 입력 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [quantity, setQuantity] = useState<number>(10);
  const [averageCost, setAverageCost] = useState<number>(150);
  const [targetWeight, setTargetWeight] = useState<number>(20);
  const [horizon, setHorizon] = useState<'SHORT' | 'MEDIUM' | 'LONG'>('MEDIUM');

  const handleSmartBatchImport = (newPositions: Omit<Position, 'id' | 'created_at' | 'updated_at'>[]) => {
    setPositions((prev) => {
      const merged = [...prev];
      newPositions.forEach((np) => {
        const idx = merged.findIndex((p) => p.symbol_id === np.symbol_id);
        if (idx >= 0) {
          merged[idx] = np;
        } else {
          merged.push(np);
        }
      });
      return merged;
    });
  };

  // 종목 검색 핸들러
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setSearchError(null);
    if (!q.trim()) return;

    const matched = SUPPORTED_SYMBOLS.find(
      (s) =>
        s.ticker.toUpperCase() === q.trim().toUpperCase() ||
        s.name_ko.includes(q.trim())
    );

    if (matched) {
      setSelectedSymbol(matched.id);
      setSearchError(null);
    } else {
      setSearchError('현재 분석을 지원하지 않는 종목입니다. (미국 대형 비금융 흑자 20개 기업 지원)');
    }
  };

  // 종목 추가
  const handleAddPosition = () => {
    if (!selectedSymbol) return;
    if (quantity <= 0 || averageCost <= 0) {
      setSearchError('수량과 평균매수가는 0보다 커야 합니다.');
      return;
    }

    // 이미 존재하는지 확인
    const exists = positions.some((p) => p.symbol_id === selectedSymbol);
    if (exists) {
      setPositions((prev) =>
        prev.map((p) =>
          p.symbol_id === selectedSymbol
            ? { ...p, quantity, average_cost: averageCost, target_max_weight_percent: targetWeight, investment_horizon: horizon }
            : p
        )
      );
    } else {
      setPositions((prev) => [
        ...prev,
        {
          user_id: 'USER_1',
          portfolio_id: 'PF_1',
          symbol_id: selectedSymbol,
          quantity,
          average_cost: averageCost,
          currency: 'USD',
          target_max_weight_percent: targetWeight,
          investment_horizon: horizon,
        },
      ]);
    }

    setSearchQuery('');
    setSearchError(null);
  };

  const handleRemove = (symbolId: string) => {
    setPositions((prev) => prev.filter((p) => p.symbol_id !== symbolId));
  };

  const handleFinishCustom = () => {
    if (positions.length === 0) {
      setSearchError('최소 1개 이상의 종목을 등록해주세요.');
      return;
    }
    const fullPositions: Position[] = positions.map((p, idx) => ({
      ...p,
      id: `POS_${Date.now()}_${idx}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    onComplete(fullPositions);
  };

  const handleUseDemo = () => {
    onComplete(INITIAL_DEMO_POSITIONS);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 max-w-xl mx-auto flex flex-col justify-between">
      <div>
        {/* 온보딩 환영 헤더 */}
        <div className="mb-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            내 주식의 중요한 변화를<br />카드 한 장으로 확인하세요
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            복잡한 뉴스나 호가창 대신, 내가 보유한 종목의
            <br />
            <strong className="text-slate-900 dark:text-white font-semibold">
              투자 매력도 변화와 그 이유
            </strong>
            를 핵심만 짚어드립니다.
          </p>
        </div>

        {/* 빠른 시작 데모 추천 박스 */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                빠른 체험
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                대표 4개 종목 샘플로 즉시 시작하기
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                엔비디아, 브로드컴, MSFT, 알파벳 실전 시나리오
              </p>
            </div>
            <button
              onClick={handleUseDemo}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              시작하기
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 종목 직접 등록 폼 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              직접 포트폴리오 구성하기
            </h2>
            <button
              onClick={() => setShowSmartModal(true)}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              텍스트 일괄 붙여넣기
            </button>
          </div>

          {/* 종목 검색 */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="종목명 또는 티커 검색 (예: NVDA, 엔비디아, MSFT)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 지원 종목 칩 리스트 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {SUPPORTED_SYMBOLS.slice(0, 7).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSymbol(s.id);
                  setSearchQuery(s.name_ko);
                  setSearchError(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  selectedSymbol === s.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.name_ko} ({s.ticker})
              </button>
            ))}
          </div>

          {/* 에러 메시지 (미지원 종목 안내) */}
          {searchError && (
            <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs mb-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {/* 수량 및 평균매수가 입력 그리드 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                보유수량 (주)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                평균매수가 ($ USD)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={averageCost}
                onChange={(e) => setAverageCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 선택사항: 투자기간 및 최대 허용 비중 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                투자기간 (선택)
              </label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value as any)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SHORT">단기 (6개월)</option>
                <option value="MEDIUM">중기 (1년)</option>
                <option value="LONG">장기 (3년 이상)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                최대 허용 비중 (%)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddPosition}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            목록에 종목 추가
          </button>
        </div>

        {/* 현재 등록된 종목 목록 */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            등록된 종목 ({positions.length}개)
          </div>
          {positions.map((p) => {
            const sym = SUPPORTED_SYMBOLS.find((s) => s.id === p.symbol_id);
            return (
              <div
                key={p.symbol_id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {sym?.name_ko || p.symbol_id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {sym?.ticker || p.symbol_id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {p.quantity}주 • 평단가 ${p.average_cost.toFixed(2)} • 한도 {p.target_max_weight_percent}%
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(p.symbol_id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 완료 버튼 */}
      <button
        onClick={handleFinishCustom}
        className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-5 h-5" />
        내 포트폴리오 분석 시작하기
      </button>

      {/* 스마트 텍스트 일괄 등록 모달 */}
      <SmartImportModal
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        onImportPositions={handleSmartBatchImport}
      />
    </div>
  );
};
