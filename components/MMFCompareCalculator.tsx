"use client";

import { useState, useMemo } from "react";
import { ArrowRight, TrendingUp, ShieldCheck } from "lucide-react";

const MMF_FUNDS = [
  { name: "IFB1/2024 (Tax-Free)", gross: 18.50, wht: false },
  { name: "CIC Money Market", gross: 15.90, wht: true },
  { name: "Zidi High Yield MMF", gross: 18.20, wht: true },
  { name: "Lofty Corban MMF", gross: 16.80, wht: true },
  { name: "Kuza MMF", gross: 16.50, wht: true },
  { name: "Sanlam Pesa MMF", gross: 14.78, wht: true },
  { name: "Etica Wealth MMF", gross: 17.55, wht: true },
  { name: "GenCap Hela MMF", gross: 16.20, wht: true },
  { name: "Britam MMF", gross: 14.20, wht: true },
  { name: "Old Mutual MMF", gross: 14.00, wht: true },
  { name: "NCBA Loop MMF", gross: 12.10, wht: true },
  { name: "KCB Wealth MMF", gross: 11.40, wht: true },
  { name: "FXD1/2024/10 Bond", gross: 16.40, wht: true },
];

export default function MMFCompareCalculator() {
  const [amount, setAmount] = useState(500000);
  const [months, setMonths] = useState(12);
  const [fundA, setFundA] = useState(0);
  const [fundB, setFundB] = useState(1);

  const calculate = (fund: typeof MMF_FUNDS[0]) => {
    const taxRate = fund.wht ? 0.15 : 0;
    const netRate = fund.gross * (1 - taxRate);
    const monthlyRate = netRate / 100 / 12;
    let balance = amount;
    for (let i = 0; i < months; i++) {
      balance *= 1 + monthlyRate;
    }
    return {
      netRate: netRate.toFixed(2),
      grossRate: fund.gross.toFixed(2),
      taxDeducted: fund.wht ? `${(fund.gross * taxRate).toFixed(2)}%` : "Exempt",
      finalBalance: Math.round(balance),
      returns: Math.round(balance - amount),
      monthlyIncome: Math.round((balance - amount) / months),
    };
  };

  const resultA = useMemo(() => calculate(MMF_FUNDS[fundA]), [fundA, amount, months]);
  const resultB = useMemo(() => calculate(MMF_FUNDS[fundB]), [fundB, amount, months]);

  const winner = resultA.finalBalance >= resultB.finalBalance ? "A" : "B";
  const diff = Math.abs(resultA.returns - resultB.returns);

  return (
    <div className="space-y-8">
      {/* Top Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Investment Amount (KES)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Duration (Months)</label>
          <input
            type="number"
            min={1}
            max={120}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="flex items-end">
          <div className="w-full p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Advantage</p>
            <p className="text-sm font-black text-emerald-700">KES {diff.toLocaleString()} more</p>
          </div>
        </div>
      </div>

      {/* Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fund A */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${winner === "A" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fund A</span>
            {winner === "A" && (
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Winner
              </span>
            )}
          </div>
          <select
            value={fundA}
            onChange={(e) => setFundA(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none mb-5"
          >
            {MMF_FUNDS.map((f, i) => (
              <option key={i} value={i}>{f.name} — {f.gross}%</option>
            ))}
          </select>
          <div className="space-y-3">
            {[
              { label: "Gross Rate", value: `${resultA.grossRate}%` },
              { label: "WHT (15%)", value: resultA.taxDeducted },
              { label: "Net Rate", value: `${resultA.netRate}%`, highlight: true },
              { label: "Final Balance", value: `KES ${resultA.finalBalance.toLocaleString()}` },
              { label: "Pure Returns", value: `KES ${resultA.returns.toLocaleString()}` },
              { label: "Avg Monthly Income", value: `KES ${resultA.monthlyIncome.toLocaleString()}` },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest ${row.highlight ? "text-emerald-600" : "text-slate-500"}`}>
                <span className="text-slate-400">{row.label}</span>
                <span className={row.highlight ? "text-emerald-700 text-sm" : "text-slate-900"}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fund B */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${winner === "B" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fund B</span>
            {winner === "B" && (
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Winner
              </span>
            )}
          </div>
          <select
            value={fundB}
            onChange={(e) => setFundB(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none mb-5"
          >
            {MMF_FUNDS.map((f, i) => (
              <option key={i} value={i}>{f.name} — {f.gross}%</option>
            ))}
          </select>
          <div className="space-y-3">
            {[
              { label: "Gross Rate", value: `${resultB.grossRate}%` },
              { label: "WHT (15%)", value: resultB.taxDeducted },
              { label: "Net Rate", value: `${resultB.netRate}%`, highlight: true },
              { label: "Final Balance", value: `KES ${resultB.finalBalance.toLocaleString()}` },
              { label: "Pure Returns", value: `KES ${resultB.returns.toLocaleString()}` },
              { label: "Avg Monthly Income", value: `KES ${resultB.monthlyIncome.toLocaleString()}` },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest ${row.highlight ? "text-emerald-600" : "text-slate-500"}`}>
                <span className="text-slate-400">{row.label}</span>
                <span className={row.highlight ? "text-emerald-700 text-sm" : "text-slate-900"}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        WHT = 15% Withholding Tax on interest (KRA). IFBs are tax-exempt.
      </div>
    </div>
  );
}
