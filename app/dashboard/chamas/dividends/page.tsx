"use client";

import { Landmark, ArrowDownToLine, CalendarClock, Users } from "lucide-react";

const DIVIDENDS = [
  { id: "DIV-8492", asset: "IFB1/2023/17", type: "Coupon Payment", amount: "KES 412,000", date: "Oct 15, 2026", status: "Upcoming", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "DIV-8491", asset: "Sanlam KES MMF", type: "Monthly Interest", amount: "KES 64,520", date: "Sep 30, 2026", status: "Paid", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "DIV-8490", asset: "Acorn D-REIT", type: "Semi-Annual Yield", amount: "KES 130,640", date: "Aug 15, 2026", status: "Paid", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "DIV-8489", asset: "Safaricom PLC", type: "Final Dividend", amount: "KES 48,000", date: "Jul 28, 2026", status: "Paid", color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function ChamaDividendsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-emerald-100">
              <Users className="w-3 h-3" /> Prestige Wealth Group
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dividend Tracking</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
             Monitor upcoming coupon payments and historical yield distributions
           </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Target</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Type</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Date</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Distributed</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {DIVIDENDS.map((div, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4">
                           <span className="text-[10px] font-bold text-slate-500 tracking-widest">{div.id}</span>
                        </td>
                        <td className="py-4 px-4">
                           <p className="font-bold text-slate-900 text-sm">{div.asset}</p>
                        </td>
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-2">
                              <ArrowDownToLine className={`w-3 h-3 ${div.color}`} />
                              <span className="text-xs font-bold text-slate-600">{div.type}</span>
                           </div>
                        </td>
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-2">
                              <CalendarClock className="w-3 h-3 text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{div.date}</span>
                           </div>
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900 text-sm">
                           {div.amount}
                        </td>
                        <td className="py-4 px-4 text-right">
                           <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${div.bg} ${div.color}`}>
                              {div.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
