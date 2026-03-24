"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Activity, ArrowUpRight, Download, Filter, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 12000 },
  { month: "Feb", revenue: 52000, expenses: 15000 },
  { month: "Mar", revenue: 48000, expenses: 14000 },
  { month: "Apr", revenue: 61000, expenses: 18000 },
  { month: "May", revenue: 59000, expenses: 16000 },
  { month: "Jun", revenue: 75000, expenses: 22000 },
];

const recentTransactions = [
  { id: "TX-9921", user: "Acme Corp", type: "Deposit", amount: "KES 5,000,000", status: "Completed", time: "10 mins ago", gateway: "M-Pesa Paybill" },
  { id: "TX-9920", user: "Retail Group A", type: "Withdrawal", amount: "KES 150,000", status: "Pending", time: "1 hour ago", gateway: "Bank Transfer" },
  { id: "TX-9919", user: "John Doe", type: "Deposit", amount: "KES 25,000", status: "Completed", time: "2 hours ago", gateway: "Card (Paystack)" },
  { id: "TX-9918", user: "Alpha Fund", type: "Fee Deduction", amount: "KES 450,000", status: "Completed", time: "5 hours ago", gateway: "Internal" },
  { id: "TX-9917", user: "Jane Smith", type: "Deposit", amount: "KES 10,000", status: "Failed", time: "1 day ago", gateway: "M-Pesa Till" },
];

import { useEffect } from "react";

export default function AdminFinancePage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pricing, setPricing] = useState(499);

  const handleUpdatePricing = () => {
    // Mock save logic
    alert(`Global pricing updated to KES ${pricing}`);
  };

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/payment/list");
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayments();
  }, []);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Treasury</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Global Cashflow & Revenue Aggregation
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> Non-Custodial Terminal: We don't hold client funds
           </div>
           <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
             <Download className="w-4 h-4" /> Export Ledger
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Platform AUM", value: "KES 8.2B", trend: "+12.5%", isUp: true, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Monthly Revenue", value: "KES 14.5M", trend: "+8.2%", isUp: true, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Payouts", value: "KES 2.1M", trend: "-3.1%", isUp: false, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Gateway Fees Paid", value: "KES 450K", trend: "+1.2%", isUp: true, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center border border-current/10`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${kpi.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {kpi.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.trend}
              </span>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900">Revenue vs Gateway Expenses</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Trailing 6 Months Analysis</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 900 }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pricing Configuration */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Platform Pricing</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Global Premium Subscription Amount</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Monthly Premium (KES)</label>
                    <div className="relative">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">KES</span>
                       <input 
                         type="number" 
                         value={pricing} 
                         onChange={(e) => setPricing(Number(e.target.value))}
                         className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950" 
                       />
                    </div>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                    Updating this value will globally change the subscription cost for all S-Tier Pro users immediately.
                 </p>
              </div>
           </div>
           <button 
             onClick={handleUpdatePricing}
             className="w-full mt-10 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl"
           >
              Apply New Pricing
           </button>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">Live Transaction Ledger</h3>
          <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">
             <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Gateway</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {payments.length > 0 ? payments.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6 font-medium text-slate-600">
                     <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-mono">{tx.reference || tx.id}</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">{tx.user?.name || "Unknown"}</td>
                  <td className="py-4 px-6">
                     <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{tx.plan}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.method}</span>
                     </div>
                  </td>
                  <td className="py-4 px-6 font-black text-slate-900">KES {tx.amount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      tx.status === 'SUCCESS' || tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    {isLoading ? "Synchronizing Treasury Ledger..." : "No Recent Transactions Detected"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
