import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Key, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';
import { tossApiService, TossCredentials } from '../../core/services/tossApiService';
import { Position } from '../../core/types/models';

interface TossApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: (positions: Position[]) => void;
}

export const TossApiModal: React.FC<TossApiModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [existingCreds, setExistingCreds] = useState<TossCredentials | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
  } | null>(null);

  const [previewPositions, setPreviewPositions] = useState<Position[] | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = tossApiService.getCredentials();
      if (saved) {
        setExistingCreds(saved);
        setClientId(saved.clientId);
        setClientSecret(saved.clientSecret);
      } else {
        setExistingCreds(null);
        setClientId('');
        setClientSecret('');
      }
      setStatusMessage(null);
      setPreviewPositions(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 연결 테스트 및 잔고 조회 실행
  const handleTestAndSync = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setStatusMessage({
        type: 'error',
        title: '입력 정보 누락',
        description: '토스증권 Client ID와 Client Secret을 모두 입력해주세요.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({
      type: 'info',
      title: '토스증권 서버와 통신 중...',
      description: 'OAuth2 인증 토큰을 발급받고 계좌 잔고를 확인하고 있습니다.',
    });

    try {
      // 1. 임시 저장
      tossApiService.saveCredentials({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
      });

      // 2. 토큰 및 잔고 동기화 시도
      const result = await tossApiService.syncPositionsFromToss();

      setPreviewPositions(result.positions);
      setExistingCreds(tossApiService.getCredentials());

      setStatusMessage({
        type: 'success',
        title: '토스증권 연동 성공!',
        description: `총 ${result.syncedCount}개 종목 잔고를 성공적으로 가져왔습니다. 아래 [포트폴리오에 적용]을 누르면 내 주식으로 등록됩니다.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        title: '연동 실패',
        description: err.message || '토스증권 API 연결 중 오류가 발생했습니다. IP 등록 여부와 키 값을 확인해주세요.',
      });
      setPreviewPositions(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 포트폴리오에 적용
  const handleApplyToPortfolio = () => {
    if (previewPositions && onSyncComplete) {
      onSyncComplete(previewPositions);
      onClose();
    }
  };

  // 연동 해제
  const handleDisconnect = () => {
    if (window.confirm('토스증권 API 연동을 해제하시겠습니까? 저장된 API 키가 즉시 영구 삭제됩니다.')) {
      tossApiService.clearCredentials();
      setExistingCreds(null);
      setClientId('');
      setClientSecret('');
      setPreviewPositions(null);
      setStatusMessage({
        type: 'info',
        title: '연동 해제 완료',
        description: '브라우저에 보관된 토스증권 API 키가 안전하게 파기되었습니다.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* 모달 헤더 */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                토스증권 Open API 실시간 연동
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                내 실제 보유 계좌와 실시간 체결 시세를 직접 연결
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 보안 안심 알림 배너 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-blue-950 dark:text-blue-200">
                100% 로컬 보안 보증
              </span>
              <p className="text-[11px] text-blue-800/90 dark:text-blue-300/80 leading-relaxed">
                입력하신 Client ID와 Client Secret은 외부 서버나 인터넷으로 전송되지 않으며, <strong>오직 현재 사용 중인 기기의 브라우저에만 암호화 보관</strong>됩니다. 언제든 원클릭으로 영구 삭제하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* 기존 연동 상태 */}
          {existingCreds && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    토스증권 API 연결 활성화됨
                  </span>
                  {existingCreds.lastConnectedAt && (
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                      최근 동기화: {existingCreds.lastConnectedAt}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-semibold text-[11px] hover:bg-rose-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                연동 해제
              </button>
            </div>
          )}

          {/* 입력 폼 */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                토스증권 Client ID
              </label>
              <input
                type="text"
                placeholder="예: toss_client_..."
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  토스증권 Client Secret
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecret((prev) => !prev)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
                >
                  {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showSecret ? '숨기기' : '보기'}
                </button>
              </div>
              <input
                type={showSecret ? 'text' : 'password'}
                placeholder="토스증권 개발자 센터에서 발급받은 Secret Key"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 필수 사전 가이드 */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-[11px] space-y-1.5 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              📌 연결 전 필수 체크 사항
            </span>
            <p>
              1. <a href="https://developers.tossinvest.com/docs" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-0.5">토스증권 개발자 포털 <ExternalLink className="w-2.5 h-2.5" /></a>의 <strong>IP 허용 목록</strong>에 현재 접속 중인 공인 IP가 등록되어 있어야 정상 통신됩니다.
            </p>
            <p>
              2. 로컬 개발 환경(<code>http://localhost:5173</code>)에서 실행 시 브라우저 CORS 차단 없이 가장 안정적으로 통신됩니다.
            </p>
          </div>

          {/* 상태 알림 메시지 */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
              )}
              <div>
                <span className="font-bold block text-xs">{statusMessage.title}</span>
                <p className="text-[11px] mt-0.5 leading-relaxed">{statusMessage.description}</p>
              </div>
            </div>
          )}

          {/* 불러온 종목 미리보기 */}
          {previewPositions && previewPositions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                불러온 내 주식 목록 ({previewPositions.length}개)
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {previewPositions.map((pos) => (
                  <div
                    key={pos.id}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        {pos.symbol_id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {pos.quantity}주
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {pos.currency === 'KRW'
                        ? `₩${Math.round(pos.average_cost).toLocaleString()}`
                        : `$${pos.average_cost.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 버튼 */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            닫기
          </button>

          {previewPositions && previewPositions.length > 0 ? (
            <button
              onClick={handleApplyToPortfolio}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              내 포트폴리오에 적용하기
            </button>
          ) : (
            <button
              onClick={handleTestAndSync}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  연결 확인 중...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  연결 테스트 & 잔고 불러오기
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
