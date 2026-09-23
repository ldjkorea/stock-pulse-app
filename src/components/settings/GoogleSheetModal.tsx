import React, { useState, useEffect } from 'react';
import { X, Table, Upload, Download, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { googleSheetsService } from '../../core/services/googleSheetsService';
import { Position } from '../../core/types/models';
import { EnrichedPosition } from '../../stores/portfolioStore';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPositions: (Position | EnrichedPosition)[];
  onSyncComplete: (importedPositions: Position[]) => void;
}

const APPS_SCRIPT_SNIPPET = `/**
 * Stock Pulse - 구글 스프레드시트 양방향 연동 Apps Script
 * [배포방법] 구글시트 -> 확장프로그램 -> Apps Script -> 붙여넣기 -> 배포 -> 새배포(웹앱, 나, 모든사용자)
 */
const SHEET_NAME = '포트폴리오';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = initSheet(ss);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ success: true, message: '시트 데이터 없음', positions: [] });
    }
    const positions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const symbolId = String(row[0] || '').trim();
      const nameKo = String(row[1] || '').trim();
      const quantity = parseFloat(row[2]) || 0;
      const averageCost = parseFloat(row[3]) || 0;
      const currency = String(row[4] || 'USD').trim();
      const targetWeight = parseFloat(row[5]) || 20;
      const horizon = String(row[6] || 'MEDIUM').trim();
      if (symbolId && quantity > 0 && averageCost > 0) {
        positions.push({
          symbol_id: symbolId,
          name_ko: nameKo,
          quantity: quantity,
          average_cost: averageCost,
          currency: currency,
          target_max_weight_percent: targetWeight,
          investment_horizon: horizon,
        });
      }
    }
    return createJsonResponse({ success: true, positions: positions });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || 'save_portfolio';
    const payload = postData.payload || postData;
    if (action === 'load_portfolio') return doGet(e);
    if (action === 'save_portfolio') {
      const positions = payload.positions || [];
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = initSheet(ss); else sheet.clearContents();
      const headers = ['종목코드', '종목명', '수량', '평균매수가', '통화', '한도비중(%)', '투자기간', '최종저장일시'];
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#2563EB').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center');
      const nowStr = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
      const rows = positions.map(p => [
        p.symbol_id, p.name_ko || p.symbol_id, p.quantity, p.average_cost, p.currency || 'USD',
        p.target_max_weight_percent || 20, p.investment_horizon || 'MEDIUM', nowStr
      ]);
      if (rows.length > 0) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      for (let c = 1; c <= headers.length; c++) sheet.autoResizeColumn(c);
      return createJsonResponse({ success: true, message: '저장 완료', count: positions.length });
    }
    return createJsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function initSheet(ss) {
  let sheet = ss.insertSheet(SHEET_NAME);
  sheet.appendRow(['종목코드', '종목명', '수량', '평균매수가', '통화', '한도비중(%)', '투자기간', '최종저장일시']);
  sheet.getRange(1, 1, 1, 8).setBackground('#2563EB').setFontColor('#FFFFFF').setFontWeight('bold');
  return sheet;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}`;

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  currentPositions,
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'setup'>('sync');
  const [webAppUrl, setWebAppUrl] = useState('');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedUrl = googleSheetsService.getWebAppUrl();
      setWebAppUrl(savedUrl);
      setLastSynced(googleSheetsService.getLastSyncedTime());
      setStatusMessage(null);
      if (!savedUrl) {
        setActiveTab('setup');
      } else {
        setActiveTab('sync');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'URL을 입력해주세요.' });
      return;
    }
    googleSheetsService.saveWebAppUrl(webAppUrl);
    setStatusMessage({ type: 'success', text: '구글 시트 URL이 성공적으로 저장되었습니다!' });
    setActiveTab('sync');
  };

  const handleClearUrl = () => {
    googleSheetsService.clearWebAppUrl();
    setWebAppUrl('');
    setLastSynced(null);
    setStatusMessage({ type: 'success', text: '등록된 연동 URL이 삭제되었습니다.' });
    setActiveTab('setup');
  };

  // 구글 시트로 저장 (내보내기)
  const handleExport = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSheetsService.exportToGoogleSheet(currentPositions);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setLastSynced(res.syncedAt || null);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 시트에서 불러오기 (동기화)
  const handleImport = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSheetsService.importFromGoogleSheet();
      if (res.success && res.positions) {
        onSyncComplete(res.positions);
        setStatusMessage({ type: 'success', text: res.message });
        setLastSynced(res.syncedAt || null);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      setStatusMessage({ type: 'error', text: '클립보드 복사 실패. 코드를 직접 드래그해주세요.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 모달 상단 헤더 */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                구글 스프레드시트 양방향 연동
              </h2>
              <p className="text-[11px] text-slate-400">
                내 주식 데이터를 구글 시트에 저장하고 언제든 불러와 동기화
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            동기화 실행
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'setup'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            연동 설정 & 30초 가이드
          </button>
        </div>

        {/* 바디 컨텐츠 */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/20'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 1. 동기화 실행 탭 */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {webAppUrl ? (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        구글 시트 웹앱 연결됨
                      </span>
                      <button
                        onClick={() => setActiveTab('setup')}
                        className="text-[11px] text-blue-600 dark:text-blue-400 underline hover:font-bold"
                      >
                        설정 변경
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      {webAppUrl}
                    </div>
                    {lastSynced && (
                      <div className="text-[11px] text-slate-400 mt-2">
                        마지막 동기화 일시: <strong className="text-slate-600 dark:text-slate-300">{lastSynced}</strong>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* 내보내기 버튼 */}
                    <button
                      onClick={handleExport}
                      disabled={isLoading}
                      className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      <div className="text-center">
                        <span className="text-sm font-black block">구글 시트에 저장하기</span>
                        <span className="text-[10px] opacity-80 font-normal">
                          현재 {currentPositions.length}개 종목을 시트에 덮어쓰기
                        </span>
                      </div>
                    </button>

                    {/* 불러오기 버튼 */}
                    <button
                      onClick={handleImport}
                      disabled={isLoading}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                      ) : (
                        <Download className="w-5 h-5 text-emerald-500" />
                      )}
                      <div className="text-center">
                        <span className="text-sm font-black block">구글 시트에서 불러오기</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          시트의 최신 수량/평단가를 앱에 반영
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                    💡 <strong>팁:</strong> PC나 모바일의 구글 시트 앱에서 주식 수량과 평단가를 직접 수정해 두신 뒤, 여기서 <strong>[구글 시트에서 불러오기]</strong>를 누르시면 앱 화면에 즉시 동기화됩니다!
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      구글 시트 연동 설정이 필요합니다
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      구글 스프레드시트의 Web App 배포 URL을 먼저 등록해주세요.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('setup')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    30초 설정 가이드 보기 →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. 연동 설정 & 30초 가이드 탭 */}
          {activeTab === 'setup' && (
            <div className="space-y-4 text-xs">
              {/* URL 등록 폼 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  구글 시트 Web App 배포 URL
                </label>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUrl}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    URL 등록 및 저장
                  </button>
                  {webAppUrl && (
                    <button
                      onClick={handleClearUrl}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              {/* 30초 완성 가이드 */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    30초 구글 시트 연동 초간단 방법
                  </h3>
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30 transition-all"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? '코드 복사 완료!' : '스크립트 코드 복사'}</span>
                  </button>
                </div>

                <ol className="space-y-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 list-decimal list-inside leading-relaxed text-[11px]">
                  <li>
                    구글 드라이브에서 <strong>새 구글 스프레드시트</strong>를 엽니다.
                  </li>
                  <li>
                    상단 메뉴 <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다.
                  </li>
                  <li>
                    기존 내용을 지우고 우측 상단의 <strong>[스크립트 코드 복사]</strong> 버튼을 눌러 붙여넣습니다.
                  </li>
                  <li>
                    오른쪽 위 <strong>[배포] → [새 배포]</strong>를 누르고, 톱니바퀴에서 <strong>웹 앱</strong>을 선택합니다.
                  </li>
                  <li>
                    <strong>액세스 권한: [모든 사용자(Anyone)]</strong>로 설정 후 <strong>[배포]</strong> 버튼을 누릅니다.
                  </li>
                  <li>
                    발급된 <strong>웹 앱 URL</strong>을 복사하여 위 입력칸에 넣고 저장하면 끝납니다!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* 모달 하단 닫기 */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
