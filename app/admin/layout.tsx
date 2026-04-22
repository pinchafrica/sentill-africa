"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Users, 
  Activity, 
  ShieldCheck, 
  Search, 
  ChevronDown, 
  Bell, 
  LogOut, 
  LayoutDashboard,
  Settings,
  Database,
  SearchCheck,
  Zap,
  Menu,
  X,
  Wallet,
  Globe,
  Settings2,
  GraduationCap,
  Smartphone,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const adminNav = [
  { group: "Operations", items: [
    { label: "Command Center", href: "/admin", icon: LayoutDashboard },
    { label: "Financial Treasury", href: "/admin/finance", icon: Wallet },
    { label: "Investor Base", href: "/admin/users", icon: Users },
    { label: "WhatsApp CRM", href: "/admin/whatsapp", icon: Smartphone },
    { label: "AI Sub-Agents", href: "/admin/whatsapp-agents", icon: Bot },
  ]},
  { group: "Academy", items: [
    { label: "Academy Overview", href: "/admin/academy", icon: GraduationCap },
  ]},
  { group: "Infrastructure", items: [
    { label: "System Metrics", href: "/admin/system", icon: Database },
    { label: "API & Webhooks", href: "/admin/api-status", icon: Activity },
  ]},
  { group: "Security & Admin", items: [
    { label: "Alpha Analytics", href: "/admin/analytics", icon: Zap },
    { label: "Security Audit", href: "/admin/audit", icon: ShieldCheck },
    { label: "AI Keys & Vault", href: "/admin/settings", icon: Settings2 },
  ]}
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden">
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 300 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-slate-200 flex-shrink-0 z-50 h-screen overflow-y-auto hidden lg:block"
      >
        <div className="p-8 space-y-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-sm font-black uppercase tracking-tighter block text-slate-950">Sentill Admin</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alpha Terminal</span>
            </div>
          </Link>

          <nav className="space-y-10">
            {adminNav.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-4">{group.group}</h4>
                <div className="space-y-1">
                  {group.items.map((item, j) => (
                    <Link 
                      key={j} 
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        pathname === item.href 
                          ? "bg-slate-950 text-white shadow-xl shadow-slate-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors hidden lg:block"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="relative w-96 hidden md:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                placeholder="Search telemetry or user..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-slate-950 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
             <button className="relative p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                <Bell className="w-4 h-4" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             </button>
             <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                   <p className="text-[11px] font-black uppercase text-slate-900">Admin Session</p>
                   <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Secure
                   </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-xs font-black shadow-lg">
                   AD
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10 max-w-7xl mx-auto w-full">
           {children}
        </div>
      </main>

    </div>
  );
}