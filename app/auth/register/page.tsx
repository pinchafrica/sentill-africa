"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, CheckCircle, ArrowRight, Zap, Target, AlertCircle, Eye, EyeOff, Crown, Sparkles, TrendingUp, Users, Landmark, PiggyBank } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan"); // e.g. 'premium', 'pro', 'quarterly'
  const hasPlan = !!planParam;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) setStep(2);
    else {
      if (formData.password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed. Please try again.");
          setIsLoading(false);
          return;
        }

        // Registration succeeded — move to goal selection step
        setIsLoading(false);
        setStep(3);
      } catch (e) {
        setError("Network error. Please try again.");
        setIsLoading(false);
      }
    }
  };

  const handleGoalSelect = (selectedGoal: string) => {
    // Fire-and-forget PATCH to save the goal
    fetch("/api/user/onboarding-goal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: selectedGoal }),
    }).catch(() => {}); // fire and forget

    if (hasPlan) {
      router.push(`/packages?registered=true&plan=${planParam}&goal=${selectedGoal}`);
    } else {
      router.push(`/dashboard?registered=true&goal=${selectedGoal}`);
    }
  };

  const handleSkipGoal = () => {
    if (hasPlan) {
      router.push(`/packages?registered=true&plan=${planParam}`);
    } else {
      router.push("/dashboard?registered=true");
    }
  };

  const stepLabel =
    step === 1 ? "Personal Info" :
    step === 2 ? "Security Details" :
    "Your Investment Goal";

  const goalCards = [
    {
      value: "SAVINGS",
      Icon: PiggyBank,
      title: "Grow My Savings",
      subtitle: "Earn more than my bank with MMFs",
    },
    {
      value: "EQUITIES",
      Icon: TrendingUp,
      title: "Invest in Stocks",
      subtitle: "NSE stocks, dividends, AI signals",
    },
    {
      value: "BONDS",
      Icon: Landmark,
      title: "Buy Government Bonds",
      subtitle: "T-Bills, IFBs, tax-free returns",
    },
    {
      value: "CHAMA",
      Icon: Users,
      title: "Manage My Chama",
      subtitle: "Group investment tracker",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── LEFT: Branding & Value Prop ── */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mt-64 -mr-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -mb-48 -ml-48 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <span className="text-3xl font-black tracking-tighter text-white">Sentil.</span>
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Institutional Intelligence</p>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] mb-6 font-heading">
             Master your <br /><span className="text-emerald-500">Asset Yield.</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10">
            Join thousands of high-net-worth Kenyans optimizing their portfolios with Sentil&apos;s AI-driven tax and yield strategies.
          </p>

          <div className="space-y-4">
            {[
              { icon: Zap, text: "Live MMF & Treasury Bond Yields" },
              { icon: Target, text: "AI Tax Reallocation Agent" },
              { icon: CheckCircle, text: "Regulated Asset Directory" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <feature.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial snippet */}
        <div className="relative z-10 border-t border-white/10 pt-8 mt-12">
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-md">
            "Sentil's AI flagged a 15% WHT inefficiency in my MMF portfolio and suggested an IFB swap. Incredible precision."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-slate-800" />
            <div>
              <span className="text-[9px] font-black text-white uppercase tracking-widest block">Investment Banker</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Nairobi, KE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Registration Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 lg:hidden">
          <span className="text-2xl font-black tracking-tighter text-slate-900">Sentil.</span>
        </Link>
        <div className="absolute top-8 right-8">
           <Link href="/auth/login" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-600 transition-colors">
             Log In  →
           </Link>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-10 text-center lg:text-left">
            {hasPlan && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-4">
                <Crown className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Pro plan selected — complete sign up to unlock</span>
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight font-heading mb-2">Create Account.</h2>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Step {step} of 3 · {stepLabel}</p>
          </div>

          <form onSubmit={handleNext} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm placeholder:text-slate-400"
                      placeholder="e.g. David"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm placeholder:text-slate-400"
                      placeholder="e.g. Kamau"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm placeholder:text-slate-400"
                        placeholder="david.kamau@example.com"
                     />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Phone Number / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm placeholder:text-slate-400"
                    placeholder="e.g. 0700000000"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.98]"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : step === 2 ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors mb-4"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>

                {error && (
                  <div className="mb-4 flex items-start gap-3 bg-rose-950/50 border border-rose-500/30 rounded-2xl p-4">
                    <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-rose-300 font-bold">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Create Password</label>
                     <div className="relative">
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                          placeholder="••••••••"
                       />
                       <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                       >
                         {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Confirm Password</label>
                     <div className="relative">
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                          placeholder="••••••••"
                       />
                       <button
                         type="button"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                         className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                       >
                         {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                     </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-2">Must be at least 8 characters.</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            ) : (
              /* ── Step 3: Goal Selection ── */
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">What matters most to you?</p>

                {goalCards.map(({ value, Icon, title, subtitle }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleGoalSelect(value)}
                    className="w-full flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all active:scale-[0.98] text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-black text-slate-900 uppercase tracking-widest leading-tight">{title}</span>
                      <span className="block text-[10px] font-bold text-slate-500 mt-0.5 normal-case tracking-normal">{subtitle}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 ml-auto flex-shrink-0" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleSkipGoal}
                  className="w-full text-center text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors mt-2 py-2"
                >
                  Skip for now
                </button>
              </div>
            )}
          </form>

          <p className="text-center text-[9px] font-bold text-slate-500 mt-8">
            By registering, you agree to our <a href="#" className="text-slate-900 hover:text-emerald-600 uppercase tracking-normal">Terms of Service</a> and <a href="#" className="text-slate-900 hover:text-emerald-600 uppercase tracking-normal">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
