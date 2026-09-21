import React, { useState, useMemo } from 'react';
import { Sparkles, X, Check, AlertCircle, Plus, Info, ArrowRight } from 'lucide-react';
import { parseSmartStockText, ParsedStockItem } from '../../core/utils/smartStockParser';
import { Position } from '../../core/types/models';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPositions: (positions: Omit<Position, 'id' | 'created_at' | 'updated_at'>[]) => void;
}

export const SmartImportModal: React.FC<SmartImportModalProps> = ({
  isOpen,
  onClose,
  onImportPositions,
}) => {
  const [textInput, setTextInput] = useState('');
  const [editedItems, setEditedItems] = useState<Record<string, ParsedStockItem>>({});

  // 실시간 파싱
  const parseResult = useMemo(() => {
    return parseSmartStockText(textInput);
  }, [textInput]);

  // 파싱 결과가 변경되면 편집 버퍼와 동기화
  const activeItems = useMemo(() => {
    return parseResult.items.map((item) => {
      return editedItems[item.symbol_id] || item;
    });
  }, [parseResult.items, editedItems]);

  if (!isOpen) return null;

  const handleUpdateItem = (symbolId: string, updates: Partial<ParsedStockItem>) => {
    const current = activeItems.find((i) => i.symbol_id === symbolId);
    if (!current) return;
    setEditedItems((prev) => ({
      ...prev,
      [symbolId]: { ...current, ...updates },
    }));
  };

  const handleRemoveItem = (symbolId: string) => {
    // 텍스트에서 해당 항목을 지우거나 제외 목록 처리
    // 텍스트를 재구성하거나 심볼을 제외
    const remaining = activeItems.filter((i) => i.symbol_id !== symbolId);
    const newText = remaining.map((i) => `${i.name_ko} ${i.quantity}주 $${i.average_cost}`).join(', ');
    setTextInput(newText);
  };

  const handleApplyPreset = (preset: string) => {
    setTextInput(preset);
  };

  const handleConfirm = () => {
    if (activeItems.length === 0) return;

    const payload: Omit<Position, 'id' | 'created_at' | 'updated_at'>[] = activeItems.map((item) => {
      const sym = SUPPORTED_SYMBOLS.find((s) => s.id === item.symbol_id);
      return {
        user_id: 'USER_1',
        portfolio_id: 'PF_1',
        symbol_id: item.symbol_id,
        quantity: item.quantity,
        average_cost: item.average_cost,
        currency: sym?.currency || 'USD',
        target_max_weight_percent: item.target_max_weight_percent || 20,
        investment_horizon: 'MEDIUM',
      };
    });

    onImportPositions(payload);
    setTextInput('');
    setEditedItems({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                스마트 주식 일괄 등록
              </h3>
              <p className="text-[11px] text-slate-400">
                대략 적거나 증권사 화면 복사본을 붙여넣으세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 빠른 입력 프리셋 */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 whitespace-nowrap font-medium">예시 클릭:</span>
          <button
            onClick={() => handleApplyPreset('엔비디아 15주 140불, 마이크로소프트 10주 420불, 애플 20주 215$')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 whitespace-nowrap"
          >
            빅테크 3종 (자연어)
          </button>
          <button
            onClick={() => handleApplyPreset('NVDA 15 140 / LLY 5 950 / AVGO 12 165')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 whitespace-nowrap"
          >
            티커 축약형
          </button>
          <button
            onClick={() => handleApplyPreset('구글 10주, 아마존 15주, 메타 8주')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 whitespace-nowrap"
          >
            수량만 (단가 자동적용)
          </button>
        </div>

        {/* 텍스트 입력창 */}
        <div className="my-2">
          <textarea
            rows={4}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`여기에 편하게 적거나 붙여넣으세요!\n예시: 엔비디아 15주 140달러, 마소 10주 420불, 구글 8주`}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        {/* 미지원 종목 경고 배너 */}
        {parseResult.unsupported.length > 0 && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>미지원 종목 감지 ({parseResult.unsupported.length}건)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              <strong className="text-amber-700 dark:text-amber-300">
                {parseResult.unsupported.join(', ')}
              </strong>
              은(는) 현재 MVP 20개 대형 우량 비금융 흑자 종목 지원 범위에 포함되지 않아 등록에서 제외되었습니다.
            </p>
          </div>
        )}

        {/* 실시간 파싱 결과 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>인식된 종목 ({activeItems.length}개)</span>
            {activeItems.length > 0 && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400">
                수량/단가를 직접 수정할 수 있습니다
              </span>
            )}
          </div>

          {activeItems.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Info className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              위 입력창에 종목과 수량을 적으시면 여기에 자동으로 인식됩니다.
            </div>
          ) : (
            activeItems.map((item) => (
              <div
                key={item.symbol_id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.name_ko}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.ticker}
                    </span>
                    {item.cost_is_estimated && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        {SUPPORTED_SYMBOLS.find((s) => s.id === item.symbol_id)?.currency === 'KRW'
                          ? `시장가 추정 (₩${Math.round(item.average_cost).toLocaleString()})`
                          : `시장가 추정 ($${item.average_cost.toFixed(2)})`}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.symbol_id)}
                    className="text-slate-400 hover:text-rose-500 text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">수량 (주)</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(item.symbol_id, {
                          quantity: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="w-full p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      평균단가 ({SUPPORTED_SYMBOLS.find((s) => s.id === item.symbol_id)?.currency === 'KRW' ? '₩' : '$'})
                    </label>
                    <input
                      type="number"
                      step={SUPPORTED_SYMBOLS.find((s) => s.id === item.symbol_id)?.currency === 'KRW' ? '100' : '0.1'}
                      min="0.1"
                      value={item.average_cost}
                      onChange={(e) =>
                        handleUpdateItem(item.symbol_id, {
                          average_cost: Math.max(0.1, Number(e.target.value)),
                          cost_is_estimated: false,
                        })
                      }
                      className="w-full p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">한도비중 (%)</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={item.target_max_weight_percent}
                      onChange={(e) =>
                        handleUpdateItem(item.symbol_id, {
                          target_max_weight_percent: Number(e.target.value),
                        })
                      }
                      className="w-full p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            취소
          </button>
          <button
            disabled={activeItems.length === 0}
            onClick={handleConfirm}
            className="flex-[2] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Check className="w-4 h-4" />
            포트폴리오에 {activeItems.length}개 일괄 등록하기
          </button>
        </div>
      </div>
    </div>
  );
};
