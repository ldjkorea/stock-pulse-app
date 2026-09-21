import React from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, ExternalLink, MoreVertical, Compass } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, isKakaoOrInApp, installApp } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                스마트폰 홈 화면에 앱 추가
              </h3>
              <p className="text-[11px] text-slate-400">
                주소창 없이 네이티브 앱처럼 실행
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. 카카오톡/인앱 브라우저 감지 시 안내 */}
        {isKakaoOrInApp && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>외부 기본 브라우저로 열기 권장</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              카카오톡 내부에서는 홈 화면 추가가 제한됩니다. 우측 상단 또는 하단 메뉴(<strong>⋮</strong>)에서 <strong>[다른 브라우저로 열기]</strong>를 누르시면 3초 만에 앱으로 설치할 수 있습니다!
            </p>
          </div>
        )}

        {/* 2. 원클릭 설치 버튼 (안드로이드 Chrome 지원 시) */}
        {isInstallable && (
          <div className="mb-4">
            <button
              onClick={async () => {
                const installed = await installApp();
                if (installed) onClose();
              }}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              원클릭 앱 설치하기
            </button>
          </div>
        )}

        {/* 3. 기기별 3초 수동 추가 가이드 (언제나 확실하게 동작) */}
        <div className="space-y-3 py-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isIOS ? '아이폰 (사파리) 추가 방법' : '스마트폰 브라우저 추가 방법'}
          </span>

          {isIOS ? (
            // iOS Safari 가이드
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  1
                </div>
                <span>Safari 화면 하단 중앙의 <strong>[공유 버튼 ⎋]</strong> 터치</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  2
                </div>
                <span>메뉴 목록에서 <strong>[홈 화면에 추가 ⊞]</strong> 선택 후 [추가]</span>
              </div>
            </div>
          ) : (
            // 안드로이드 (크롬 / 삼성 인터넷) 가이드
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  1
                </div>
                <span>브라우저 우측 상단/하단의 <strong>메뉴 버튼(⋮ 또는 ≡)</strong> 터치</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  2
                </div>
                <span>메뉴에서 <strong>[홈 화면에 추가]</strong> 또는 <strong>[앱 설치]</strong> 터치</span>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
            홈 화면에 추가하면 브라우저 주소창 없이 바탕화면 아이콘 하나로 쾌적하게 실행됩니다.
          </p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
};
