import React from 'react';
import { Zap, Flame, Scale, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { PriceSnapshot } from '../../core/types/models';
import { ScoreLabel } from '../../core/types/analysis';

interface RsiSynergyBoxProps {
  priceSnapshot?: PriceSnapshot | null;
  totalScore: number;
  scoreLabel: ScoreLabel;
  symbolName: string;
}

export const RsiSynergyBox: React.FC<RsiSynergyBoxProps> = ({
  priceSnapshot,
  totalScore,
  scoreLabel: _scoreLabel,
  symbolName,
}) => {
  if (!priceSnapshot || priceSnapshot.rsi === undefined) {
    return null;
  }

  const rsi = priceSnapshot.rsi;
  const status = priceSnapshot.rsi_status || (rsi <= 30 ? 'OVERSOLD' : rsi >= 70 ? 'OVERBOUGHT' : 'NEUTRAL');
  const isHighFundamental = totalScore >= 7.0;
  const isLowFundamental = totalScore < 5.0;

  // 펀더멘털 + RSI 결합 분석 가이드 도출
  let synergyTitle = '';
  let synergyAdvice = '';
  let synergyBadgeColor = '';
  let SynergyIcon = Lightbulb;

  if (isHighFundamental && status === 'OVERSOLD') {
    synergyTitle = '🌟 절호의 분할 매수 타이밍 탐색 구간';
    synergyAdvice = `${symbolName}의 기업 펀더멘털 점수는 ${totalScore.toFixed(1)}점으로 매우 우수하지만, 시장 단기 수급 악화로 RSI ${rsi}(과매도)까지 밀렸습니다. 본질 가치 훼손이 아닌 단기 가격 조정이므로 우량주 바겐세일 분할 매수를 적극 고려할 만합니다.`;
    synergyBadgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    SynergyIcon = TrendingUp;
  } else if (isLowFundamental && status === 'OVERSOLD') {
    synergyTitle = '⚠️ 떨어지는 칼날 잡기 주의 (물타기 금지)';
    synergyAdvice = `RSI가 ${rsi}로 과매도 구간이지만, 기업 펀더멘털 점수가 ${totalScore.toFixed(1)}점으로 취약합니다. 실적이나 부채 등 본질 가치가 훼손된 상태에서의 단순 RSI 과매도 매수는 '지하실 밑에 암반'을 만날 수 있으므로 각별히 유의해야 합니다.`;
    synergyBadgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    SynergyIcon = AlertTriangle;
  } else if (isHighFundamental && status === 'OVERBOUGHT') {
    synergyTitle = '⏳ 눌림목 대기 권장 (신규 추격 매수 자제)';
    synergyAdvice = `기업 가치는 매우 탄탄하나 단기 급등으로 RSI ${rsi}(과열)에 도달했습니다. 추가 상승 탄력이 지속될 수 있으나 단기 차익 실현 매물이 쏟아질 수 있으므로, 신규 진입은 20일선 눌림목 조정을 기다리는 것이 유리합니다.`;
    synergyBadgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    SynergyIcon = Flame;
  } else if (status === 'OVERSOLD') {
    synergyTitle = '⚡ 기술적 반등 탐색 구간';
    synergyAdvice = `단기 매도세가 극에 달해 RSI ${rsi} 과매도 권역에 진입했습니다. 기술적 단기 반등이 기대될 수 있으나 펀더멘털 변화를 함께 주시하세요.`;
    synergyBadgeColor = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
    SynergyIcon = Zap;
  } else if (status === 'OVERBOUGHT') {
    synergyTitle = '🔥 단기 과열 경계 권역';
    synergyAdvice = `RSI ${rsi}로 매수세가 과열된 상태입니다. 보유자는 분할 익절 타이밍을 조율할 수 있고, 미보유자는 무리한 추격 매수를 피하는 것이 현명합니다.`;
    synergyBadgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    SynergyIcon = Flame;
  } else {
    synergyTitle = '⚖️ 수급 균형 (추세 순응 구간)';
    synergyAdvice = `RSI ${rsi}로 매수와 매도 균형이 유지되고 있습니다. 기술적 과열/과매도 왜곡 없이 기업 고유의 펀더멘털 실적 모멘텀에 따라 주가가 움직이는 구간입니다.`;
    synergyBadgeColor = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    SynergyIcon = Scale;
  }

  return (
    <section className="mb-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            실시간 RSI 수급 타이밍
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          기준 {priceSnapshot.as_of}
        </span>
      </div>

      {/* RSI 게이지 바 */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mb-3.5">
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono font-bold">
          <span className="text-indigo-600 dark:text-indigo-400">과매도 (30 이하)</span>
          <span className="text-slate-900 dark:text-white text-sm">현재 RSI {rsi}</span>
          <span className="text-rose-600 dark:text-rose-400">과열 (70 이상)</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
          {/* 과매도/중립/과열 구역 표시 */}
          <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-indigo-500/20" />
          <div className="absolute left-[30%] top-0 bottom-0 w-[40%] bg-slate-500/10" />
          <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-rose-500/20" />
          {/* 현재 RSI 위치 바 */}
          <div
            className={`h-full rounded-full transition-all ${
              status === 'OVERSOLD'
                ? 'bg-indigo-600'
                : status === 'OVERBOUGHT'
                ? 'bg-rose-500'
                : 'bg-slate-600'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, rsi))}%` }}
          />
        </div>
      </div>

      {/* 펀더멘털 점수와 결합한 전략 조언 */}
      <div className={`p-3.5 rounded-2xl border ${synergyBadgeColor} transition-all`}>
        <div className="flex items-center gap-2 mb-1 font-bold text-xs">
          <SynergyIcon className="w-4 h-4 shrink-0" />
          <span>{synergyTitle}</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {synergyAdvice}
        </p>
      </div>
    </section>
  );
};
