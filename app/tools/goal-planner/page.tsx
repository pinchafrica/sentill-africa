"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, Crown, Lock, ArrowRight, Sparkles, Calculator, PieChart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const FUND_TYPES = [
  { id: "mmf",   label: "💰 Money Market Fund", yield: 14.2, tax: 15,  risk: "Low",    min: 1000  },
  { id: "tbill", label: "📈 Treasury Bill",      yield: 15.8, tax: 15,  risk: "Low",    min: 50000 },
  { id: "ifb",   label: "🏛 IFB Bond",           yield: 17.5, tax: 0,   risk: "Low",    min: 3000  },
  { id: "sacco", label: "🤝 SACCO Dividend",      yield: 15.0, tax: 5,   risk: "Medium", min: 5000  },
];

const formatKES = (n: number) =>
  n >= 1_000_000
    ? `KES ${(n / 1_000_000).toFixed(2)}M`
    : `KES ${Math.round(n).toLocaleString()}`;

export default function GoalPlannerPage() {
  const [goalAmount, setGoalAmount] = useState(1_000_000);
  const [years, setYears] = useState(3);
  const [allocation, setAllocation] = useState({ mmf: 40, tbill: 20, ifb: 25, sacco: 15 });
  const [isPro] = useState(false); // Replace with real session check
  const [showProGate, setShowProGate] = useState(false);

  // Blended net yield from allocation
  const blendedYield = useMemo(() => {
    return FUND_TYPES.reduce((sum, f) => {
      const share = (allocation[f.id as keyof typeof allocation] || 0) / 100;
      const netYield = f.yield * (1 - f.tax / 100);
      return sum + share * netYield;
    }, 0);
  }, [allocation]);

  // Monthly savings required
  const monthlyRequired = useMemo(() => {
    const r = blendedYield / 100 / 12;
    const n = years * 12;
    if (r === 0) return goalAmount / n;
    return (goalAmount * r) / (Math.pow(1 + r, n) - 1);
  }, [goalAmount, years, blendedYield]);

  // Chart data — trajectory
  const chartData = useMemo(() => {
    const r = blendedYield / 100 / 12;
    const monthly = monthlyRequired;
    const data = [];
    let balance = 0;
    for (let m = 0; m <= years * 12; m += Math.max(1, Math.round(years))) {
      data.push({
        label: m === 0 ? "Now" : `Yr ${Math.round(m / 12)}`,
        balance: Math.round(balance),
        target: Math.round(goalAmount * (m / (years * 12))),
      });
      for (let i = 0; i < Math.max(1, Math.round(years)); i++) {
        balance = (balance + monthly) * (1 + r);
      }
    }
    if (data[data.length - 1]?.label !== `Yr ${years}`) {
      data.push({ label: `Yr ${years}`, balance: Math.round(balance), target: goalAmount });
    }
    return data;
  }, [goalAmount, years, blendedYield, monthlyRequired]);

  const totalContributed = monthlyRequired * years * 12;
  const investmentGrowth = goalAmount - totalContributed;

  const handleProFeature = () => setShowProGate(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 pt-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Goal Planner</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Work backwards from your target — find exactly how much to save monthly
          </p>
        </div>
        <Link href="/tools/tax-calculator" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-colors w-fit">
          Tax Calculator →
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* LEFT: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" /> Your Goal
            </h3>

            <div className="space-y-5">
              {/* Goal Amount */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Target Amount (KES)
                </label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={e => setGoalAmount(Number(e.target.value))}
                  step={50000}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[500_000, 1_000_000, 3_000_000, 5_000_000].map(v => (
                    <button key={v} onClick={() => setGoalAmount(v)}
                      className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${goalAmount === v ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {v >= 1_000_000 ? `${v / 1_000_000}M` : `${v / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Horizon</label>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{years} Years</span>
                </div>
                <input type="range" min={1} max={15} value={years}
                  onChange={e => setYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                  <span>1 yr</span><span>5</span><span>10</span><span>15 yrs</span>
                </div>
              </div>

              {/* Allocation */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Allocation Mix
                </h4>
                {FUND_TYPES.map(f => (
                  <div key={f.id} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-700">{f.label}</span>
                      <span className="text-[10px] font-black text-emerald-600">{allocation[f.id as keyof typeof allocation]}%</span>
                    </div>
                    <input type="range" min={0} max={100}
                      value={allocation[f.id as keyof typeof allocation]}
                      onChange={e => setAllocation(a => ({ ...a, [f.id]: Number(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-100 rounded appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="text-[8px] text-slate-400 mt-0.5">Net yield: {(f.yield * (1 - f.tax / 100)).toFixed(1)}% · Min: KES {f.min.toLocaleString()}</div>
                  </div>
                ))}
                <div className={`text-[9px] font-black uppercase tracking-widest mt-2 ${Object.values(allocation).reduce((a, b) => a + b, 0) !== 100 ? "text-rose-500" : "text-emerald-600"}`}>
                  Total: {Object.values(allocation).reduce((a, b) => a + b, 0)}% {Object.values(allocation).reduce((a, b) => a + b, 0) !== 100 ? "⚠ Must equal 100%" : "✓ Balanced"}
                </div>
              </div>
            </div>
          </div>

          {/* Lead CTA */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 border border-white/10">
            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Get Expert Guidance
            </p>
            <p className="text-[10px] text-slate-400 font-medium mb-3 leading-relaxed">
              Our AI advisor can build a personalised plan based on your income and risk profile.
            </p>
            <a href="https://wa.me/254703469525?text=Hi%20Sentill!%20I%20want%20a%20personalised%20investment%20plan."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Get Free Plan on WhatsApp
            </a>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-8 space-y-6">

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Save Monthly", value: formatKES(monthlyRequired), color: "bg-emerald-900 border-emerald-800", text: "text-emerald-50" },
              { label: "Blended Yield", value: `${blendedYield.toFixed(1)}% net`, color: "bg-slate-900 border-slate-800", text: "text-white" },
              { label: "Goal", value: formatKES(goalAmount), color: "bg-white border-slate-200", text: "text-slate-900" },
              { label: "Interest Earned", value: formatKES(Math.max(0, investmentGrowth)), color: "bg-blue-950 border-blue-800", text: "text-blue-50" },
            ].map((m, i) => (
              <div key={i} className={`${m.color} border rounded-2xl p-4 shadow-sm`}>
                <div className="text-[9px] font-black uppercase tracking-widest text-current opacity-60 mb-1">{m.label}</div>
                <div className={`text-base font-black tracking-tight ${m.text}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Savings Trajectory to {formatKES(goalAmount)}
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                  <YAxis tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                  <Tooltip
                    formatter={(v: any, name: any) => [formatKES(Number(v)), name === "balance" ? "Your Balance" : "Target"]}
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold", paddingTop: "16px" }} />
                  <Area type="monotone" dataKey="balance" name="Your Balance" stroke="#10b981" strokeWidth={3} fill="url(#gBalance)" />
                  <Area type="monotone" dataKey="target" name="Target" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pro Gate: Fund-by-fund breakdown */}
          <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-500" /> Allocation Breakdown & Minimum Capital
              </h3>
              <div className="space-y-3">
                {FUND_TYPES.map(f => {
                  const share = (allocation[f.id as keyof typeof allocation] || 0) / 100;
                  const monthlyToThis = monthlyRequired * share;
                  return (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-xs font-black text-slate-900">{f.label}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">
                          Net {(f.yield * (1 - f.tax / 100)).toFixed(1)}% · {f.risk} risk · Min KES {f.min.toLocaleString()}
                        </p>
                      </div>
                      {isPro ? (
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{formatKES(monthlyToThis)}<span className="text-xs font-bold text-slate-400">/mo</span></p>
                          <p className="text-[9px] text-emerald-600 font-bold">{allocation[f.id as keyof typeof allocation]}% of portfolio</p>
                        </div>
                      ) : (
                        <div className="text-right blur-sm select-none pointer-events-none">
                          <p className="text-sm font-black text-slate-900">KES ????</p>
                          <p className="text-[9px] text-emerald-600 font-bold">??% of portfolio</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pro Gate Overlay */}
            {!isPro && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-3xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/30">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div className="text-center px-6">
                  <p className="text-white font-black text-lg uppercase tracking-tight">Pro Feature</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                    Fund-by-fund breakdown + optimal allocation AI
                  </p>
                </div>
                <Link href="/packages"
                  className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/30">
                  <Crown className="w-4 h-4" /> Unlock Pro — from KES 99/week
                </Link>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                  Also includes: AI Oracle · Tax Optimizer · Portfolio Tracker
                </p>
              </div>
            )}
          </div>

          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/20 border border-emerald-700/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Your Plan Summary</p>
              <p className="text-slate-300 text-sm font-semibold">
                Save <span className="text-emerald-400 font-black">{formatKES(monthlyRequired)}/month</span> for <span className="text-white font-black">{years} years</span> at a blended <span className="text-blue-400 font-black">{blendedYield.toFixed(1)}%</span> net yield to reach <span className="text-emerald-400 font-black">{formatKES(goalAmount)}</span>
              </p>
            </div>
            <a href={`https://wa.me/254703469525?text=Hi%20Sentill!%20I%20have%20a%20goal%20of%20${formatKES(goalAmount)}%20in%20${years}%20years.%20I%20can%20save%20${formatKES(monthlyRequired)}%20monthly.%20Help%20me%20get%20started!`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-lg">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Start This Plan on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
