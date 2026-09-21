import React from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                스마트폰 앱으로 설치하기
              </h3>
              <p className="text-[11px] text-slate-400">
                홈 화면에서 주소창 없이 앱처럼 사용
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isInstalled ? (
          <div className="text-center py-4 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8" />
            <span>이미 앱으로 설치되어 실행 중입니다!</span>
          </div>
        ) : isIOS ? (
          // iOS Safari 설치 가이드
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              아이폰 Safari 브라우저에서 아래 2단계를 진행하면 홈 화면에 즉시 설치됩니다.
            </p>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                  1
                </div>
                <span>하단 메뉴의 [공유 버튼]</span>
                <Share2 className="w-4 h-4 text-blue-500 inline" />
                <span>터치</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                  2
                </div>
                <span>메뉴에서 [홈 화면에 추가]</span>
                <PlusSquare className="w-4 h-4 text-blue-500 inline" />
                <span>선택</span>
              </div>
            </div>
          </div>
        ) : isInstallable ? (
          // 안드로이드 / 크롬 원클릭 설치 버튼
          <div className="space-y-3 py-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              버튼을 누르면 브라우저 주소창 없이 네이티브 앱처럼 바탕화면에 추가됩니다.
            </p>
            <button
              onClick={async () => {
                const installed = await installApp();
                if (installed) onClose();
              }}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              지금 앱으로 설치하기
            </button>
          </div>
        ) : (
          // 브라우저 직접 추가 안내
          <div className="space-y-2 py-2 text-xs text-slate-600 dark:text-slate-400">
            <p>
              브라우저 우측 상단 메뉴(⋮)에서 <strong>[홈 화면에 추가]</strong> 또는 <strong>[앱 설치]</strong>를 선택하시면 스마트폰 홈 화면에서 앱처럼 편리하게 사용하실 수 있습니다.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
        >
          나중에 하기
        </button>
      </div>
    </div>
  );
};
