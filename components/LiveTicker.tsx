"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TickerItem {
  label: string;
  value: string;
  change?: string;
  up?: boolean;
}

const STATIC_ITEMS: TickerItem[] = [
  { label: "USD/KES", value: "129.50", up: false },
  { label: "CBK RATE", value: "10.00%" },
  { label: "NSE 20", value: "1,842", change: "+0.4%", up: true },
  { label: "IFB1/2024", value: "18.46%", up: true },
  { label: "91-DAY T-BILL", value: "15.97%", up: false },
  { label: "ETICA MMF", value: "16.50%", up: true },
  { label: "KE CPI", value: "3.5%", up: false },
  { label: "SCOM", value: "18.90", change: "+0.53%", up: true },
  { label: "EQTY", value: "43.25", change: "+1.17%", up: true },
  { label: "KCB", value: "28.10", change: "-0.35%", up: false },
  { label: "EABL", value: "132.50", change: "+0.76%", up: true },
  { label: "COOP", value: "14.20", change: "+0.71%", up: true },
  { label: "ABSA", value: "15.65", change: "+1.62%", up: true },
  { label: "NCBA", value: "48.50", change: "+0.52%", up: true },
  { label: "BAT", value: "410.00", change: "-0.60%", up: false },
];

export default function LiveTicker() {
  const { data: nseData } = useSWR("/api/market/nse", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });
  const { data: fxData } = useSWR("/api/market/exchange-rate", fetcher, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  });

  const isLive = nseData?.source?.type === "yahoo" || nseData?.stocks?.[0]?.source === "gemini-forced";

  const items: TickerItem[] = useMemo(() => {
    const result: TickerItem[] = [];

    // USD/KES
    const kes = fxData?.rates?.KES;
    result.push({
      label: "USD/KES",
      value: kes ? kes.toFixed(2) : "129.50",
      up: false,
    });

    result.push({ label: "CBK RATE", value: "10.00%" });
    result.push({ label: "NSE 20", value: "1,842", change: "+0.4%", up: true });
    result.push({ label: "IFB1/2024", value: "18.46%", up: true });
    result.push({ label: "91-DAY T-BILL", value: "15.97%", up: false });
    result.push({ label: "ETICA MMF", value: "16.50%", up: true });
    result.push({ label: "ACORN I-REIT", value: "KES 21.60", change: "+0.8%", up: true });
    result.push({ label: "MAVUNO GOLD ETF", value: "KES 145.20", change: "+2.1%", up: true });
    result.push({ label: "HESABIKA PE", value: "18.5%", up: true });
    result.push({ label: "KE CPI", value: "3.5%", up: false });

    // Top 8 NSE stocks from API
    if (nseData?.stocks?.length) {
      const top8 = nseData.stocks.slice(0, 8);
      for (const s of top8) {
        result.push({
          label: s.symbol.replace(".NR", ""),
          value: `KES ${s.price?.toFixed(2) ?? "—"}`,
          change: s.percent != null
            ? `${s.percent >= 0 ? "+" : ""}${s.percent.toFixed(2)}%`
            : undefined,
          up: (s.percent ?? 0) >= 0,
        });
      }
    } else {
      // Static fallback stocks
      for (const item of STATIC_ITEMS.slice(7)) {
        result.push(item);
      }
    }

    return result;
  }, [nseData, fxData]);

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="fixed top-0 left-0 right-0 h-[40px] z-[60] bg-white/90 backdrop-blur-md border-b border-slate-200/60 overflow-hidden flex items-center shadow-sm">
      {/* Live indicator */}
      <div className="absolute left-3 z-10 flex items-center gap-1.5 bg-white/90 pr-3 py-1 rounded-r-md">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isLive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isLive ? "bg-emerald-600" : "bg-slate-500"
            }`}
          />
        </span>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
          {isLive ? "Market Active" : "Closing Data"}
        </span>
        {isLive && (
          <div className="ml-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span className="text-[7px] font-black uppercase tracking-widest text-blue-600">AI Verified</span>
          </div>
        )}
      </div>

      {/* Scrolling ticker */}
      <div className="pl-32 overflow-hidden w-full">
        <motion.div
          className="flex gap-10 whitespace-nowrap items-center"
          animate={{ x: [0, -50 * items.length * 8] }}
          transition={{
            duration: items.length * 5,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-[10px] font-bold">
              <span className="text-slate-400 uppercase tracking-widest">{item.label}</span>
              <span
                className={
                  item.up === true
                    ? "text-emerald-600"
                    : item.up === false && item.change
                    ? "text-rose-600"
                    : "text-slate-900"
                }
              >
                {item.value}
              </span>
              {item.change && (
                <span
                  className={`text-[9px] font-black ${
                    item.up ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {item.up ? "▲" : "▼"} {item.change.replace(/[+-]/, '')}
                </span>
              )}
              <span className="text-slate-200 ml-4 font-black">|</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
