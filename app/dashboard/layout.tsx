"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  PieChart, BrainCircuit, Briefcase, LineChart, LayoutGrid, AlertTriangle, 
  Map, History, Users, Bell, Shield, MessageSquare, Activity, Menu, X, Compass, Landmark,
  LogOut, ChevronRight, GraduationCap, Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Investor");
  const [userInitials, setUserInitials] = useState("SI");
  const [isPremium, setIsPremium] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(d => {
      if (d?.user?.name) {
        setUserName(d.user.name);
        const parts = d.user.name.split(" ");
        setUserInitials((parts[0]?.[0] || "") + (parts[1]?.[0] || ""));
      }
      setIsPremium(d?.user?.isPremium ?? false);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/");
  };

  const navGroups: {
    title: string;
    items: {
      name: string;
      href: string;
      icon: any;
      badge?: string;
      external?: boolean;
    }[];
  }[] = [
    {
      title: "Wealth Terminal",
      items: [
        { name: "Overview", href: "/dashboard", icon: PieChart },
        { name: "Explore Portfolios", href: "/dashboard/explore", icon: Compass },
        { name: "Advisor Engine", href: "/dashboard/advisor", icon: BrainCircuit, badge: "ULTRA" },
        { name: "My Assets", href: "/dashboard/assets", icon: Briefcase }
      ]
    },
    {
      title: "Market Intelligence",
      items: [
        { name: "Yield Curves", href: "/dashboard/yields", icon: Activity },
        { name: "Allocation Maps", href: "/dashboard/allocation", icon: LayoutGrid },
        { name: "Risk Spectrums", href: "/dashboard/risk", icon: LineChart },
        { name: "SACCO Audit", href: "/dashboard/sacco", icon: AlertTriangle },
        { name: "Land Analysis", href: "/dashboard/land", icon: Map }
      ]
    },
    {
      title: "Chama Terminal",
      items: [
        { name: "Group Overview", href: "/dashboard/chamas", icon: Users },
        { name: "Global Assets", href: "/dashboard/chamas/assets", icon: Briefcase },
        { name: "Member Directory", href: "/dashboard/chamas/members", icon: Shield },
        { name: "Dividend Tracking", href: "/dashboard/chamas/dividends", icon: Landmark }
      ]
    },
    {
      title: "Administration",
      items: [
        { name: "Log History", href: "/dashboard/history", icon: History },
        { name: "Alert Hub", href: "/dashboard/alerts", icon: Bell },
        { name: "WhatsApp Hub", href: "/dashboard/whatsapp", icon: Smartphone, badge: "NEW" },
        { name: "Chama Hub", href: "/resources/chamas", icon: Users, external: true },
        { name: "Sentill Academy", href: "/academy", icon: GraduationCap, badge: "FREE" },
      ]
    },
    {
      title: "Personal",
      items: [
        { name: "Profile & Security", href: "/dashboard/settings", icon: Shield },
        { name: "Alpha Feedback", href: "/dashboard/feedback", icon: MessageSquare }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-inter flex-col lg:flex-row">
      
      {/* ─── MOBILE HEADER ────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm pt-[50px]">
        <Link href="/" className="flex items-center">
           <img src="/images/logo.jpg" alt="Sentill Logo" className="h-8 w-auto mix-blend-multiply" />
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900 border border-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ─── DESKTOP SIDEBAR ──────────────────────────────────────── */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col fixed inset-y-0 left-0 z-[40] pt-[80px]">
        
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 hide-scrollbar">
          
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-4">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={itemIdx} 
                      href={item.href} 
                      target={(item as any).external ? "_blank" : undefined}
                      rel={(item as any).external ? "noopener noreferrer" : undefined}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
                        isActive 
                          ? "bg-slate-950 text-white shadow-md shadow-slate-900/10" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"}`} />
                        <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
                      </div>
                      
                      {item.badge && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          isActive 
                            ? "bg-white/10 text-emerald-300 border border-white/20" 
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

        </div>

        {/* Bottom User/Logout Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
           <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-200 flex items-center justify-center text-white text-[10px] font-black">
                   {userInitials.toUpperCase() || "SI"}
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{userName}</p>
                   <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: isPremium ? '#10b981' : '#94a3b8' }}>{isPremium ? '⚡ Pro Active' : 'Free Plan'}</p>
                 </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
           </div>
           <button
             onClick={handleLogout}
             disabled={loggingOut}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all disabled:opacity-50"
           >
             <LogOut className="w-4 h-4" />
             {loggingOut ? "Signing Out..." : "Sign Out"}
           </button>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER (AnimatePresence) ─────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[70] lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[80] lg:hidden flex flex-col pt-10"
            >
              <div className="px-6 mb-8 flex items-center justify-between">
                 <img src="/images/logo.jpg" alt="Sentill Logo" className="h-10 w-auto mix-blend-multiply" />
                 <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-8 hide-scrollbar">
                {navGroups.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-4">
                      {group.title}
                    </h4>
                    <div className="space-y-1">
                      {group.items.map((item, itemIdx) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link 
                            key={itemIdx} 
                            href={item.href} 
                            target={(item as any).external ? "_blank" : undefined}
                            rel={(item as any).external ? "noopener noreferrer" : undefined}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
                              isActive 
                                ? "bg-slate-950 text-white shadow-md shadow-slate-900/10" 
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-500"}`} />
                              <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile bottom: user + logout */}
              <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
                <div className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                    {userInitials.toUpperCase() || "SI"}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{userName}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: isPremium ? '#10b981' : '#94a3b8' }}>{isPremium ? '⚡ Pro Active' : 'Free Plan'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────── */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-8 min-w-0 pt-[120px] lg:pt-[100px]">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
      
      {/* Global CSS to hide scrollbar for sidebar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}