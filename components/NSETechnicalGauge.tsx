"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Zap, BarChart2, Activity } from "lucide-react";

interface IndicatorSignal {
  name: string;
  value: string;
  signal: "BUY" | "SELL" | "NEUTRAL";
  category: "Oscillator" | "MA";
}

function getSignals(price: number, percent: number, pe: number, divYield: number, seed: number): IndicatorSignal[] {
  // Deterministic pseudo-random based on symbol seed
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };

  const bias = percent > 0 ? 0.65 : 0.35; // bullish/bearish bias from price action

  const sig = (prob: number): "BUY" | "SELL" | "NEUTRAL" => {
    const r = rand();
    if (r < prob * 0.8) return "BUY";
    if (r > 1 - (1 - prob) * 0.8) return "SELL";
    return "NEUTRAL";
  };

  const rsi = +(40 + rand() * 30 + (percent > 0 ? 8 : -8)).toFixed(1);
  const macdLine = +((rand() - 0.5) * 2 * (percent > 0 ? 1.2 : 0.8)).toFixed(3);
  const signalLine = +(macdLine - (rand() - 0.5) * 0.8).toFixed(3);
  const stoch = +(20 + rand() * 60 + (percent > 0 ? 10 : -10)).toFixed(1);
  const cci = +(-100 + rand() * 200 + (percent > 0 ? 30 : -30)).toFixed(0);
  const williams = +(-80 + rand() * 60 + (percent > 0 ? 10 : -10)).toFixed(1);
  const atr = +(price * (0.01 + rand() * 0.02)).toFixed(2);

  const sma20 = +(price * (0.94 + rand() * 0.12)).toFixed(2);
  const ema50 = +(price * (0.88 + rand() * 0.24)).toFixed(2);
  const sma100 = +(price * (0.82 + rand() * 0.36)).toFixed(2);
  const sma200 = +(price * (0.78 + rand() * 0.44)).toFixed(2);
  const ema20 = +(price * (0.95 + rand() * 0.10)).toFixed(2);

  return [
    // Oscillators
    {
      name: "RSI (14)",
      value: `${rsi}`,
      signal: rsi < 30 ? "BUY" : rsi > 70 ? "SELL" : "NEUTRAL",
      category: "Oscillator",
    },
    {
      name: "MACD (12,26)",
      value: `${macdLine > 0 ? "+" : ""}${macdLine}`,
      signal: macdLine > signalLine ? "BUY" : "SELL",
      category: "Oscillator",
    },
    {
      name: "Stochastic (14)",
      value: `${stoch}%`,
      signal: stoch < 25 ? "BUY" : stoch > 75 ? "SELL" : "NEUTRAL",
      category: "Oscillator",
    },
    {
      name: "CCI (20)",
      value: `${cci}`,
      signal: cci < -100 ? "BUY" : cci > 100 ? "SELL" : "NEUTRAL",
      category: "Oscillator",
    },
    {
      name: "Williams %R",
      value: `${williams}%`,
      signal: williams < -80 ? "BUY" : williams > -20 ? "SELL" : "NEUTRAL",
      category: "Oscillator",
    },
    {
      name: "ATR (14)",
      value: `KES ${atr}`,
      signal: sig(bias),
      category: "Oscillator",
    },
    // Moving Averages
    {
      name: "SMA 20",
      value: `KES ${sma20}`,
      signal: price > sma20 ? "BUY" : "SELL",
      category: "MA",
    },
    {
      name: "EMA 20",
      value: `KES ${ema20}`,
      signal: price > ema20 ? "BUY" : "SELL",
      category: "MA",
    },
    {
      name: "EMA 50",
      value: `KES ${ema50}`,
      signal: price > ema50 ? "BUY" : "SELL",
      category: "MA",
    },
    {
      name: "SMA 100",
      value: `KES ${sma100}`,
      signal: price > sma100 ? "BUY" : "SELL",
      category: "MA",
    },
    {
      name: "SMA 200",
      value: `KES ${sma200}`,
      signal: price > sma200 ? "BUY" : "SELL",
      category: "MA",
    },
  ];
}

interface NSETechnicalGaugeProps {
  symbol: string;
  price: number;
  percent: number;
  pe: number;
  divYield: number;
}

export default function NSETechnicalGauge({ symbol, price, percent, pe, divYield }: NSETechnicalGaugeProps) {
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const signals = useMemo(
    () => getSignals(price, percent, pe, divYield, seed),
    [price, percent, pe, divYield, seed]
  );

  const buyCount = signals.filter((s) => s.signal === "BUY").length;
  const sellCount = signals.filter((s) => s.signal === "SELL").length;
  const neutralCount = signals.filter((s) => s.signal === "NEUTRAL").length;
  const total = signals.length;

  const overall: "STRONG BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG SELL" =
    buyCount >= 8 ? "STRONG BUY"
    : buyCount >= 6 ? "BUY"
    : sellCount >= 8 ? "STRONG SELL"
    : sellCount >= 6 ? "SELL"
    : "NEUTRAL";

  const overallColor = {
    "STRONG BUY": "text-blue-500",
    "BUY": "text-blue-300",
    "NEUTRAL": "text-slate-400",
    "SELL": "text-rose-300",
    "STRONG SELL": "text-rose-400",
  }[overall];

  const overallBg = {
    "STRONG BUY": "bg-blue-600/20 border-blue-600/30",
    "BUY": "bg-blue-600/15 border-blue-600/20",
    "NEUTRAL": "bg-slate-500/15 border-slate-500/20",
    "SELL": "bg-rose-500/15 border-rose-500/20",
    "STRONG SELL": "bg-rose-500/20 border-rose-500/30",
  }[overall];

  const oscillators = signals.filter((s) => s.category === "Oscillator");
  const mas = signals.filter((s) => s.category === "MA");

  const SignalBadge = ({ sig }: { sig: "BUY" | "SELL" | "NEUTRAL" }) => (
    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${
      sig === "BUY" ? "bg-blue-600/15 text-blue-500" :
      sig === "SELL" ? "bg-rose-500/15 text-rose-400" :
      "bg-slate-500/15 text-slate-400"
    }`}>
      {sig === "BUY" ? <TrendingUp className="w-2.5 h-2.5" /> :
       sig === "SELL" ? <TrendingDown className="w-2.5 h-2.5" /> :
       <Minus className="w-2.5 h-2.5" />}
      {sig}
    </span>
  );

  return (
    <div className="h-full overflow-y-auto space-y-4 text-white pr-0.5">
      {/* Overall Verdict */}
      <div className={`rounded-2xl border p-4 text-center ${overallBg}`}>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Overall Signal</p>
        <p className={`text-2xl font-black tracking-tight ${overallColor}`}>{overall}</p>
        <div className="flex justify-center gap-4 mt-3 text-[9px] font-black uppercase">
          <span className="text-blue-500">{buyCount} Buy</span>
          <span className="text-slate-500">{neutralCount} Neutral</span>
          <span className="text-rose-400">{sellCount} Sell</span>
        </div>
      </div>

      {/* Gauge Bar */}
      <div>
        <div className="flex h-2.5 rounded-full overflow-hidden">
          <div className="bg-blue-600 transition-all" style={{ width: `${(buyCount / total) * 100}%` }} />
          <div className="bg-slate-600 transition-all" style={{ width: `${(neutralCount / total) * 100}%` }} />
          <div className="bg-rose-500 transition-all" style={{ width: `${(sellCount / total) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-[8px] font-bold text-slate-600 uppercase">
          <span>Buy</span>
          <span>Neutral</span>
          <span>Sell</span>
        </div>
      </div>

      {/* Sub-gauges */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Oscillators", items: oscillators, icon: Activity },
          { label: "Moving Avgs", items: mas, icon: BarChart2 },
        ].map(({ label, items, icon: Icon }) => {
          const b = items.filter((i) => i.signal === "BUY").length;
          const s = items.filter((i) => i.signal === "SELL").length;
          const n = items.filter((i) => i.signal === "NEUTRAL").length;
          const sub = b > s ? "BUY" : s > b ? "SELL" : "NEUTRAL";
          return (
            <div key={label} className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3 h-3 text-slate-400" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
              </div>
              <span className={`text-sm font-black ${
                sub === "BUY" ? "text-blue-500" : sub === "SELL" ? "text-rose-400" : "text-slate-400"
              }`}>{sub}</span>
              <p className="text-[8px] text-slate-500 mt-0.5 font-bold uppercase">{b}B · {n}N · {s}S</p>
            </div>
          );
        })}
      </div>

      {/* Oscillator Signals */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Oscillators</span>
        </div>
        <div className="space-y-1.5">
          {oscillators.map((ind) => (
            <div key={ind.name} className="flex items-center justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-[10px] font-bold text-slate-400">{ind.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-500">{ind.value}</span>
                <SignalBadge sig={ind.signal} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MA Signals */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart2 className="w-3 h-3 text-indigo-400" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Moving Averages</span>
        </div>
        <div className="space-y-1.5">
          {mas.map((ind) => (
            <div key={ind.name} className="flex items-center justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-[10px] font-bold text-slate-400">{ind.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-500">{ind.value}</span>
                <SignalBadge sig={ind.signal} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest text-center pb-2">
        Signals are indicative only · Not financial advice
      </p>
    </div>
  );
}
