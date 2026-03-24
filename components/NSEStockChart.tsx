"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";

// ── Generate realistic-looking OHLCV candle data ─────────────────────────────
function generateOHLCV(
  basePrice: number,
  numBars: number,
  volatility: number,
  seed: number
) {
  const data = [];
  let price = basePrice;
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Seeded pseudo-random so it's stable across renders
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };

  for (let i = 0; i < numBars; i++) {
    const open = price;
    const change = (rand() - 0.49) * volatility;
    const close = Math.max(price * 0.3, open + change);
    const high = Math.max(open, close) * (1 + rand() * volatility * 0.3);
    const low = Math.min(open, close) * (1 - rand() * volatility * 0.3);
    const volume = Math.floor((rand() * 30 + 5) * 1_000_000);

    data.push({
      time: labels[i % 12],
      open: +open.toFixed(2),
      close: +close.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      price: +close.toFixed(2),
      volume: Math.floor(volume / 1_000_000), // in M
      up: close >= open,
    });
    price = close;
  }
  return data;
}

// ── Compute SMA ───────────────────────────────────────────────────────────────
function addSMA(data: any[], period: number, key: string) {
  return data.map((d, i) => {
    if (i < period - 1) return { ...d, [key]: null };
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b.price, 0) / period;
    return { ...d, [key]: +avg.toFixed(2) };
  });
}

// ── Timeframe config ──────────────────────────────────────────────────────────
const TIMEFRAMES: Record<string, { bars: number; vol: number; label: string }> = {
  "1D": { bars: 24, vol: 0.008, label: "Intraday (1h)" },
  "1W": { bars: 7, vol: 0.015, label: "7 Days" },
  "1M": { bars: 30, vol: 0.02, label: "30 Days" },
  "3M": { bars: 13, vol: 0.025, label: "13 Weeks" },
  "1Y": { bars: 12, vol: 0.035, label: "12 Months" },
  "5Y": { bars: 20, vol: 0.05, label: "5 Years (Qtr)" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl px-4 py-3 shadow-2xl text-xs min-w-[160px]">
      <p className="text-slate-400 font-black uppercase tracking-widest mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Close</span>
          <span className={`font-black ${p.up ? "text-blue-500" : "text-rose-400"}`}>
            KES {p.price?.toFixed(2)}
          </span>
        </div>
        {p.open && (
          <>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Open</span>
              <span className="text-slate-200 font-semibold">KES {p.open?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">High</span>
              <span className="text-blue-500 font-semibold">KES {p.high?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Low</span>
              <span className="text-rose-400 font-semibold">KES {p.low?.toFixed(2)}</span>
            </div>
          </>
        )}
        {p.volume && (
          <div className="flex justify-between gap-4 border-t border-slate-700/40 pt-1 mt-1">
            <span className="text-slate-500">Volume</span>
            <span className="text-indigo-400 font-semibold">{p.volume}M</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface NSEStockChartProps {
  symbol: string;
  price: number;
  change: number;
  percent: number;
  high52: number;
  low52: number;
}

export default function NSEStockChart({ symbol, price, change, percent, high52, low52 }: NSEStockChartProps) {
  const [tf, setTf] = useState("3M");
  const [showSMA, setShowSMA] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { bars, vol } = TIMEFRAMES[tf];
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  const rawData = useMemo(() => generateOHLCV(price * 0.82, bars, vol, seed + bars), [price, bars, vol, seed]);
  // Ensure last point matches current price
  const chartData = useMemo(() => {
    const d = [...rawData];
    d[d.length - 1] = { ...d[d.length - 1], price, close: price };
    let out = addSMA(d, Math.min(7, bars), "sma7");
    out = addSMA(out, Math.min(20, bars), "sma20");
    return out;
  }, [rawData, price, bars]);

  const priceMin = Math.min(...chartData.map((d) => d.price)) * 0.985;
  const priceMax = Math.max(...chartData.map((d) => d.price)) * 1.015;
  const isUp = percent >= 0;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const rangePercent = ((price - low52) / (high52 - low52)) * 100;

  return (
    <div className="bg-slate-950 rounded-none h-full flex flex-col">
      {/* Chart Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-white text-lg font-black tracking-tight">{symbol}</span>
              <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                isUp ? "bg-blue-600/15 text-blue-500" : "bg-rose-500/15 text-rose-400"
              }`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isUp ? "+" : ""}{percent.toFixed(2)}%
              </span>
            </div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              KES {price.toFixed(2)} · Chg {isUp ? "+" : ""}{change.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* SMA toggle */}
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              showSMA ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-slate-600 hover:text-slate-400"
            }`}
          >
            MA Lines
          </button>
          {/* Timeframe buttons */}
          {Object.keys(TIMEFRAMES).map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                tf === t
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Chart — Price + Volume stacked */}
      <div className="flex-1 flex flex-col min-h-0 px-2 pt-4">
        {/* Price chart 70% */}
        <div style={{ flex: "0 0 65%" }}>
          <ResponsiveContainer minWidth={1} width="100%" height={256}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={`priceGrad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? "#6366f1" : "#f43f5e"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isUp ? "#6366f1" : "#f43f5e"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: "#475569", fontSize: 9, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[priceMin, priceMax]}
                tick={{ fill: "#475569", fontSize: 9, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v) => `${v.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={price}
                stroke={isUp ? "#6366f1" : "#f43f5e"}
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isUp ? "#818cf8" : "#fb7185"}
                strokeWidth={2}
                fill={`url(#priceGrad-${symbol})`}
                dot={false}
                activeDot={{ r: 4, fill: isUp ? "#818cf8" : "#fb7185", stroke: "#0f172a", strokeWidth: 2 }}
              />
              {showSMA && bars >= 7 && (
                <Line
                  type="monotone"
                  dataKey="sma7"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                  name="SMA7"
                />
              )}
              {showSMA && bars >= 20 && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                  name="SMA20"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Volume chart 30% */}
        <div style={{ flex: "0 0 30%" }}>
          <ResponsiveContainer minWidth={1} width="100%" height={256}>
            <ComposedChart data={chartData} margin={{ top: 2, right: 16, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                tick={false}
                axisLine={false}
                tickLine={false}
                height={0}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 8, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v) => `${v}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="volume"
                name="Volume"
                radius={[2, 2, 0, 0]}
                fill="#6366f1"
                opacity={0.6}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer stats bar */}
      <div className="px-6 py-3 border-t border-slate-800/60 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-amber-400 inline-block" style={{ borderTop: "2px dashed" }} />
          <span className="text-[9px] text-slate-500 font-bold uppercase">SMA7</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-600 inline-block" style={{ borderTop: "2px dashed" }} />
          <span className="text-[9px] text-slate-500 font-bold uppercase">SMA20</span>
        </div>
        <div className="ml-auto flex items-center gap-5">
          <div className="text-right">
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">52W Range</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-slate-500">{low52}</span>
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, rangePercent))}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500">{high52}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold uppercase">
            <Activity className="w-3 h-3" />
            NSE Kenya · Simulated OHLCV
          </div>
        </div>
      </div>
    </div>
  );
}
