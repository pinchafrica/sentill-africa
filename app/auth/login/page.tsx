"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, TrendingUp, Zap, Brain, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

const PLATFORM_HIGHLIGHTS = [
  { icon: BarChart3, label: "Live NSE & MMF Yields", desc: "Real-time data from 100+ Kenyan investment providers" },
  { icon: Brain,     label: "AI Tax Optimizer",       desc: "Save up to 15% on WHT via KRA-smart reallocation" },
  { icon: TrendingUp,label: "Portfolio Intelligence",  desc: "Track all your assets in one institutional-grade terminal" },
  { icon: Zap,       label: "Sentil Alpha Engine",     desc: "AI-driven insights usually reserved for fund managers" },
];

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Connection error. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">

      {/* ── LEFT: Platform Value Prop ── */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black tracking-tighter text-white">Sentil.</span>
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mt-1">Kenya&apos;s Wealth Intelligence Platform</p>
        </div>

        {/* Hero */}
        <div className="relative z-10 max-w-md space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] mb-4">
              Your wealth.<br /><span className="text-emerald-400">Optimised.</span>
            </h1>
            <p className="text-sm text-slate-400 font-bold leading-relaxed">
              Sentil gives every Kenyan investor the same institutional-grade data, AI analysis, and tax intelligence that banks charge millions for.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {PLATFORM_HIGHLIGHTS.map((f, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/5 border border-white/8 rounded-2xl p-4 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-white mb-0.5">{f.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {[
              { value: "100+", label: "Providers Tracked" },
              { value: "18.4%", label: "Avg. Portfolio Yield" },
              { value: "Free", label: "To Get Started" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-black text-emerald-400 tracking-tighter">{s.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 border-t border-white/10 pt-8">
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
            &quot;Sentil flagged a 15% withholding tax inefficiency in my MMF portfolio and suggested an IFB swap — saved me KES 45,000 in one move.&quot;
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-emerald-800/60 flex items-center justify-center text-emerald-300 text-xs font-black">D</div>
            <div>
              <span className="text-[9px] font-black text-white uppercase tracking-widest block">Investment Banker</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Nairobi, KE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/"><span className="text-2xl font-black tracking-tighter text-white">Sentil.</span></Link>
          <Link href="/auth/register" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-400 transition-colors px-4 py-2 border border-slate-800 rounded-full">Create Account</Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-emerald-500/5 rounded-full blur-[200px] pointer-events-none mx-auto w-1/2 -mt-32" />

          {/* Desktop top-right link */}
          <div className="absolute top-8 right-8 hidden lg:block">
            <Link href="/auth/register" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-400 transition-colors px-4 py-2 border border-slate-800 rounded-full bg-slate-900/50 backdrop-blur-sm">
              Create Account
            </Link>
          </div>

          <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">

            {/* Mobile platform blurb */}
            <div className="lg:hidden mb-8 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-5 text-center">
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Kenya&apos;s Wealth Intelligence Platform</p>
              <p className="text-slate-300 text-xs font-medium leading-relaxed">Track your MMFs, bonds, SACCOs & stocks. Get AI-powered tax savings. Free to start.</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                   <ShieldCheck className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">Welcome Back.</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sign in to your Sentil account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 flex items-start gap-3 bg-rose-950/50 border border-rose-500/30 rounded-2xl p-4">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-rose-300 font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2 relative">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-5 py-4 bg-slate-950/50 rounded-2xl border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600"
                        placeholder="Enter your email"
                      />
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <div className="flex items-center justify-between pl-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Password</label>
                      <a href="#" className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest">Forgot?</a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-4 bg-slate-950/50 rounded-2xl border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Sign In Securely <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-[10px] font-bold text-slate-500 mt-6">
                New to Sentil?{" "}
                <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Create a free account →
                </Link>
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-6">
              {["🔒 Bank-Grade SSL", "🇰🇪 Kenya Focused", "✅ Free to Join"].map((b, i) => (
                <span key={i} className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
