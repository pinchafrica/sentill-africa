import { getDashboardData } from "@/app/actions";
import { Clock, ArrowUpRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const data = await getDashboardData();
  const portfolio = data?.portfolio || [];

  // Sort by date descending
  const sorted = [...portfolio].sort((a: any, b: any) =>
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );

  return (
    <div className="space-y-10 pt-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
          <Clock className="w-3 h-3" /> Activity Log
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Transaction History</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">All logged asset events</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-100/50">
        {sorted.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Clock className="w-14 h-14 text-slate-200" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No history yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sorted.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-10 py-7 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest block">Asset Logged</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{item.provider.name} · {item.provider.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden md:block">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Principal</span>
                    <span className="text-sm font-black text-slate-900">KES {item.principal.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Date</span>
                    <span className="text-[10px] font-bold text-slate-600">
                      {item.loggedAt ? new Date(item.loggedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Confirmed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
