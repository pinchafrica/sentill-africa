"use client";

import { 
  Users, Search, Filter, ShieldCheck, AlertTriangle, TrendingUp, Download, CheckCircle, XCircle, Trash2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { toggleUserPremium, deleteUser } from "@/app/admin/actions";

export default function AdminUsersTable({ users }: { users: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    setLoadingId(userId);
    const res = await toggleUserPremium(userId, currentStatus);
    if (res?.error) {
      toast.error("Failure", { description: res.error });
    } else {
      toast.success("Tier Updated", { description: `User premium status set to ${!currentStatus}` });
    }
    setLoadingId(null);
  };

  const handleDelete = async (userId: string) => {
    if(!confirm("Are you sure you want to permanently delete this user?")) return;
    setLoadingId(userId);
    const res = await deleteUser(userId);
    if (res?.error) {
      toast.error("Failure", { description: res.error });
    } else {
      toast.success("User Deleted", { description: "The account has been removed." });
    }
    setLoadingId(null);
  };

  const filtered = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Investor Directory</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Global User Management & KYC Compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
             <Download className="w-4 h-4" /> Export CSV
           </button>
        </div>
      </div>

      {/* User Data Grid */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-950 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter className="w-3.5 h-3.5" /> Tier
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Investor</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tier</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined / Source</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Active</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs border border-slate-200">
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{user.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                      <span className={`inline-flex w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        user.isPremium ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.isPremium ? "Premium Builder" : "Standard"}
                      </span>
                  </td>
                  <td className="py-4 px-6">
                      <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                        {user.role}
                      </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{new Date(user.createdAt).toLocaleDateString()}</span>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Direct Traffic</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                    {"Today, 10:42 AM"}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-15 group-hover:opacity-100 transition-opacity">
                      <button 
                        disabled={loadingId === user.id}
                        onClick={() => handleTogglePremium(user.id, user.isPremium)}
                        className={`p-2 rounded-lg transition-colors text-[10px] font-black uppercase tracking-widest ${user.isPremium ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`} 
                        title="Toggle Tier"
                      >
                        {loadingId === user.id ? "..." : user.isPremium ? "Downgrade" : "Upgrade"}
                      </button>
                      <button 
                        disabled={loadingId === user.id || user.role === "ADMIN"}
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
