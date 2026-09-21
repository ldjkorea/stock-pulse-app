import React, { useState, useRef } from 'react';
import { PieChart, Plus, Trash2, Edit2, Check, X, Search, AlertCircle, Download, Upload, ShieldCheck, Sparkles, Key } from 'lucide-react';
import { EnrichedPosition } from '../../stores/portfolioStore';
import { Position } from '../../core/types/models';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';
import { SmartImportModal } from './SmartImportModal';
import { RsiBadge } from '../common/RsiBadge';

interface PortfolioManageViewProps {
  positions: EnrichedPosition[];
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  totalProfitPercent: number;
  onAddPosition: (pos: Omit<Position, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdatePosition: (id: string, updates: Partial<Position>) => void;
  onRemovePosition: (id: string) => void;
  onSelectStock: (symbolId: string) => void;
  onExportPortfolio?: () => void;
  onImportPortfolio?: (json: string) => { success: boolean; message: string };
  onOpenTossModal?: () => void;
}

export const PortfolioManageView: React.FC<PortfolioManageViewProps> = ({
  positions,
  totalValue,
  totalInvested,
  totalProfit,
  totalProfitPercent,
  onAddPosition,
  onUpdatePosition,
  onRemovePosition,
  onSelectStock,
  onExportPortfolio,
  onImportPortfolio,
  onOpenTossModal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSmartBatchImport = (newPositions: Omit<Position, 'id' | 'created_at' | 'updated_at'>[]) => {
    newPositions.forEach((pos) => {
      onAddPosition(pos);
    });
    setStatusMessage({
      type: 'success',
      text: `${newPositions.length}개 종목이 스마트 등록되었습니다!`,
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 추가 폼 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');
  const [quantity, setQuantity] = useState(10);
  const [averageCost, setAverageCost] = useState(150);
  const [targetWeight, setTargetWeight] = useState(20);
  const [horizon, setHorizon] = useState<'SHORT' | 'MEDIUM' | 'LONG'>('MEDIUM');
  const [searchError, setSearchError] = useState<string | null>(null);

  // 수정 상태
  const [editQty, setEditQty] = useState(0);
  const [editCost, setEditCost] = useState(0);
  const [editLimit, setEditLimit] = useState(20);

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
      setSearchError('현재 분석을 지원하지 않는 종목입니다. (대형 비금융 흑자 20개 기업 지원)');
    }
  };

  const handleAddSubmit = () => {
    if (quantity <= 0 || averageCost <= 0) {
      setSearchError('수량과 평균매수가는 0보다 커야 합니다.');
      return;
    }

    onAddPosition({
      user_id: 'USER_1',
      portfolio_id: 'PF_1',
      symbol_id: selectedSymbol,
      quantity,
      average_cost: averageCost,
      currency: 'USD',
      target_max_weight_percent: targetWeight,
      investment_horizon: horizon,
    });

    setShowAddForm(false);
    setSearchQuery('');
    setSearchError(null);
  };

  const startEdit = (pos: EnrichedPosition) => {
    setEditingId(pos.id);
    setEditQty(pos.quantity);
    setEditCost(pos.average_cost);
    setEditLimit(pos.target_max_weight_percent || 20);
  };

  const saveEdit = (id: string) => {
    onUpdatePosition(id, {
      quantity: editQty,
      average_cost: editCost,
      target_max_weight_percent: editLimit,
    });
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportPortfolio) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onImportPortfolio(content);
      setStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isProfit = totalProfit >= 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            내 포트폴리오 관리
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenTossModal && (
            <button
              onClick={onOpenTossModal}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold text-xs flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-all shadow-sm"
              title="토스증권 Open API 실시간 계좌 연동"
            >
              <Key className="w-3.5 h-3.5" />
              <span>토스증권</span>
            </button>
          )}
          <button
            onClick={() => setShowSmartModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            스마트 등록
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1 transition-all border border-slate-200 dark:border-slate-700"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showAddForm ? '닫기' : '직접 추가'}
          </button>
        </div>
      </div>

      {/* 보안 & 개인화 안내 배너 */}
      <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>내 기기 전용 로컬 저장소 (타인에게 노출 0%)</span>
        </div>
        <div className="flex items-center gap-1">
          {onExportPortfolio && (
            <button
              onClick={onExportPortfolio}
              title="백업 파일 다운로드"
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30"
            >
              <Download className="w-3 h-3" />
              백업
            </button>
          )}
          {onImportPortfolio && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="백업 파일 불러오기"
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30"
              >
                <Upload className="w-3 h-3" />
                불러오기
              </button>
            </>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mb-4 p-2.5 rounded-xl text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* 포트폴리오 종합 요약 카드 */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm mb-4">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          총 자산 평가
        </span>
        <div className="flex items-baseline justify-between mt-1 mb-3">
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span
            className={`text-sm font-mono font-bold ${
              isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isProfit ? '+' : ''}
            {totalProfitPercent.toFixed(1)}% (${isProfit ? '+' : ''}
            {totalProfit.toFixed(0)})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
          <div>
            <span>총 투자원금: </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span>보유 종목 수: </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {positions.length}개
            </span>
          </div>
        </div>
      </div>

      {/* 종목 추가 폼 (토글) */}
      {showAddForm && (
        <div className="p-4 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 mb-4 animate-in fade-in duration-200">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            새 종목 추가
          </h2>

          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="종목 검색 (예: NVDA, 엔비디아, LLY)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          {searchError && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-500/10 text-rose-600 text-xs mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{searchError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">수량</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">평균매수가 ($)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={averageCost}
                onChange={(e) => setAverageCost(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">한도 비중 (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">투자기간</label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value as any)}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="SHORT">단기 (6개월)</option>
                <option value="MEDIUM">중기 (1년)</option>
                <option value="LONG">장기 (3년 이상)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddSubmit}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            포트폴리오에 저장
          </button>
        </div>
      )}

      {/* 보유 종목 리스트 */}
      <div className="space-y-3">
        {positions.map((pos) => {
          const sym = SUPPORTED_SYMBOLS.find((s) => s.id === pos.symbol_id);
          const isEditing = editingId === pos.id;

          return (
            <div
              key={pos.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => onSelectStock(pos.symbol_id)}
                  className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors"
                >
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {sym?.name_ko || pos.symbol_id}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {sym?.ticker || pos.symbol_id}
                  </span>
                  {pos.price_snapshot?.rsi !== undefined && (
                    <div className="ml-1">
                      <RsiBadge
                        rsi={pos.price_snapshot.rsi}
                        status={pos.price_snapshot.rsi_status}
                        size="sm"
                        showHint={false}
                      />
                    </div>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => startEdit(pos)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemovePosition(pos.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => saveEdit(pos.id)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 transition-colors"
                        title="저장"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        title="취소"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 편집 모드 or 조회 모드 */}
              {isEditing ? (
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">수량</label>
                    <input
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">평균매수가 ($)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editCost}
                      onChange={(e) => setEditCost(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">한도 (%)</label>
                    <input
                      type="number"
                      value={editLimit}
                      onChange={(e) => setEditLimit(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400">보유수량</span>
                    <p className="font-mono font-bold mt-0.5">{pos.quantity}주</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">평균매수가</span>
                    <p className="font-mono font-bold mt-0.5">
                      {pos.currency === 'KRW'
                        ? `₩${Math.round(pos.average_cost).toLocaleString()}`
                        : `$${pos.average_cost.toFixed(2)}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">평가금액</span>
                    <p className="font-mono font-bold mt-0.5">
                      {pos.currency === 'KRW'
                        ? `₩${Math.round(pos.total_value).toLocaleString()}`
                        : `$${pos.total_value.toFixed(0)}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">비중 (한도)</span>
                    <p className="font-mono font-bold mt-0.5">
                      {pos.portfolio_weight_percent}% ({pos.target_max_weight_percent}%)
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 스마트 일괄 등록 모달 */}
      <SmartImportModal
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        onImportPositions={handleSmartBatchImport}
      />
    </div>
  );
};
