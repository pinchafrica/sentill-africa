"use client";

import { useState, useMemo } from "react";
import { Calculator, TrendingUp, ArrowRight } from "lucide-react";

const PRESETS = [
  { label: "IFB Tax-Free", rate: 18.5 },
  { label: "91-Day T-Bill", rate: 15.8 },
  { label: "CIC MMF", rate: 15.9 },
  { label: "Conservative MMF", rate: 14.0 },
];

export default function InvestmentGrowthCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(18.5);
  const [years, setYears] = useState(5);

  const results = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    let balance = principal;
    const yearlyData: { year: number; invested: number; balance: number }[] = [];

    for (let m = 1; m <= n; m++) {
      balance = balance * (1 + r) + monthly;
      if (m % 12 === 0) {
        yearlyData.push({
          year: m / 12,
          invested: principal + monthly * m,
          balance: Math.round(balance),
        });
      }
    }

    const totalInvested = principal + monthly * n;
    const totalReturns = Math.round(balance) - totalInvested;

    return { yearlyData, totalInvested, totalReturns, finalBalance: Math.round(balance) };
  }, [principal, monthly, rate, years]);

  const maxBalance = Math.max(...results.yearlyData.map((d) => d.balance), 1);

  return (
    <div className="space-y-8">
      {/* Preset Rates */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setRate(p.rate)}
            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
              rate === p.rate
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300"
            }`}
          >
            {p.label} ({p.rate}%)
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Initial Investment (KES)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Monthly Top-Up (KES)
          </label>
          <input
            type="number"
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Annual Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Period (Years)
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Final Balance</p>
          <p className="text-xl font-black text-emerald-700">KES {results.finalBalance.toLocaleString()}</p>
        </div>
        <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Invested</p>
          <p className="text-xl font-black text-slate-900">KES {results.totalInvested.toLocaleString()}</p>
        </div>
        <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Pure Returns</p>
          <p className="text-xl font-black text-blue-700">KES {results.totalReturns.toLocaleString()}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">
          Projected Growth Over {years} Years
        </p>
        <div className="flex items-end gap-2 h-40">
          {results.yearlyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[7px] font-black text-slate-400">
                {(d.balance / 1000).toFixed(0)}K
              </span>
              <div className="w-full flex flex-col gap-0.5">
                <div
                  className="w-full bg-emerald-500 rounded-t transition-all duration-500"
                  style={{ height: `${((d.balance - d.invested) / maxBalance) * 140}px` }}
                />
                <div
                  className="w-full bg-slate-300 rounded-b transition-all duration-500"
                  style={{ height: `${(d.invested / maxBalance) * 140}px` }}
                />
              </div>
              <span className="text-[8px] font-black text-slate-500">Y{d.year}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-300" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Capital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
