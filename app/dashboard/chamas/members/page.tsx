"use client";

import { Users, ShieldCheck, CheckCircle2 } from "lucide-react";

const MEMBERS = [
  { name: "John N.", role: "Treasurer", contribution: "KES 4,500,000", share: "31.7%" },
  { name: "David K.", role: "Chairperson", contribution: "KES 3,200,000", share: "22.5%" },
  { name: "Sarah O.", role: "Member", contribution: "KES 3,000,000", share: "21.1%" },
  { name: "Grace M.", role: "Member", contribution: "KES 2,000,000", share: "14.1%" },
  { name: "Peter W.", role: "Member", contribution: "KES 1,500,000", share: "10.6%" },
];

export default function ChamaMembersPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-emerald-100">
              <Users className="w-3 h-3" /> Prestige Wealth Group
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Member Directory</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
             Manage member equity, roles, and KYC compliance
           </p>
        </div>
        <button className="px-5 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2">
           <Users className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Governance Role</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Contribution</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity Share</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {MEMBERS.map((member, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-black text-xs border border-slate-200 flex items-center justify-center">
                                 {member.name[0]}
                              </div>
                              <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                           </div>
                        </td>
                        <td className="py-4 px-4">
                           <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                             member.role === 'Treasurer' || member.role === 'Chairperson' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-200'
                           }`}>
                              {member.role}
                           </span>
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900 text-sm">
                           {member.contribution}
                        </td>
                        <td className="py-4 px-4">
                           <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-widest">
                              {member.share}
                           </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                           <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1 uppercase tracking-widest">
                              <CheckCircle2 className="w-3 h-3" /> Fully Vested
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
