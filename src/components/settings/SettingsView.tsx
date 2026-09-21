import { Settings, Moon, Sun, RotateCcw, Smartphone, Layers, Cpu, ShieldCheck, Wifi, ExternalLink, Key, CheckCircle2 } from 'lucide-react';
import { ThemeMode } from '../../stores/themeStore';
import { CURRENT_SCORE_MODEL_VERSION } from '../../core/engine/weights';
import { SUPPORTED_SYMBOLS } from '../../mock/symbols';
import { tossApiService } from '../../core/services/tossApiService';

interface SettingsViewProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onResetDemo: () => void;
  onRestartOnboarding: () => void;
  onSelectStock: (symbolId: string) => void;
  onOpenInstallModal: () => void;
  onOpenTossApiModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onToggleTheme,
  onResetDemo,
  onRestartOnboarding,
  onSelectStock,
  onOpenInstallModal,
  onOpenTossApiModal,
}) => {
  const tossCreds = tossApiService.getCredentials();
  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          설정 및 환경
        </h1>
      </div>

      {/* 0. 모바일 앱(PWA) 설치 & 공유 안내 */}
      <div className="p-4 rounded-3xl bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                스마트폰 앱으로 설치하기
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                홈 화면에 추가하여 네이티브 앱처럼 실행
              </p>
            </div>
          </div>
          <button
            onClick={onOpenInstallModal}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            설치 안내
          </button>
        </div>

        {/* 동일 Wi-Fi 모바일 접속 주소 */}
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-blue-100 dark:border-blue-900/40 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
            <Wifi className="w-3.5 h-3.5 text-blue-500" />
            <span>스마트폰에서 바로 테스트하기 (동일 Wi-Fi)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mb-1.5">
            핸드폰 브라우저에서 아래 주소로 접속하면 즉시 실행 및 앱 설치가 가능합니다:
          </p>
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 select-all break-all">
            http://192.168.55.77:5173/
          </div>
        </div>
      </div>

      {/* 0.5 토스증권 Open API 실시간 연동 */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                토스증권 Open API 연동
              </h2>
              {tossCreds ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> 연동 활성화
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  미연동
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {tossCreds
                ? '내 계좌 잔고 및 실시간 체결 시세 동기화 가능'
                : 'Client ID / Secret을 등록하여 계좌와 시세를 1초 동기화'}
            </p>
          </div>
        </div>
        {onOpenTossApiModal && (
          <button
            onClick={onOpenTossApiModal}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
          >
            {tossCreds ? '관리' : '연동하기'}
          </button>
        )}
      </div>

      {/* 1. 화면 테마 설정 */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">화면 테마</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            현재 {theme === 'dark' ? '다크 모드' : '라이트 모드'} 적용 중
          </p>
        </div>
        <button
          onClick={onToggleTheme}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              라이트 모드로 전환
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              다크 모드로 전환
            </>
          )}
        </button>
      </div>

      {/* 2. 데모 데이터 및 온보딩 관리 */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          데이터 및 사용자 안내
        </h2>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              온보딩 화면 다시 보기
            </div>
            <div className="text-[11px] text-slate-400">
              첫 화면 포트폴리오 안내 위저드를 다시 실행합니다.
            </div>
          </div>
          <button
            onClick={onRestartOnboarding}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            온보딩 실행
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              데모 데이터 리셋
            </div>
            <div className="text-[11px] text-slate-400">
              초기 4개 종목 및 시나리오 알림을 기본값으로 복원합니다.
            </div>
          </div>
          <button
            onClick={onResetDemo}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>
      </div>

      {/* 3. 시스템 아키텍처 및 버전 고지 */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-2 text-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          시스템 아키텍처 사양
        </h2>

        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            Score Engine
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {CURRENT_SCORE_MODEL_VERSION} (Deterministic)
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Data Provider
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            MockDataProvider (Ready for Real API)
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            신뢰도 평가 체계
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            2차원 분리 (근거 충실도 × 전망 불확실성)
          </span>
        </div>
      </div>

      {/* 4. MVP 지원 20개 종목 목록 안내 */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          MVP 지원 20개 대형 비금융 흑자 종목
        </h2>
        <p className="text-[11px] text-slate-400 mb-3">
          클릭 시 해당 종목의 투자 매력도 상세 분석을 바로 확인할 수 있습니다.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {SUPPORTED_SYMBOLS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectStock(s.id)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800 text-left transition-colors group"
            >
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {s.name_ko}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {s.ticker} • {s.sector}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
