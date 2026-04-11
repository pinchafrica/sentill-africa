"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight, ShieldCheck, Zap, Activity, Globe, LineChart, Cpu, Clock,
  TrendingUp, Star, Award, ChevronRight, PlayCircle, BarChart3, Plus,
  Layers, Briefcase, Server, Shield, Check, ChevronDown, Users, Lock,
  Smartphone, PieChart, Target, ArrowUpRight, TrendingDown, Info, Flame,
  MessageCircle, Signal, Wallet, Calculator, Landmark
} from "lucide-react";
import Image from "next/image";
import AssetModal from "@/components/AssetModal";
import PremiumModal from "@/components/PremiumModal";
import LiveTicker from "@/components/LiveTicker";
import SocialSentimentPulse from "@/components/SocialSentimentPulse";
import TaxAlphaOptimizer from "@/components/TaxAlphaOptimizer";
import InvestmentGrowthCalculator from "@/components/InvestmentGrowthCalculator";
import MMFCompareCalculator from "@/components/MMFCompareCalculator";
import LoanVsInvestCalculator from "@/components/LoanVsInvestCalculator";
import { useAIStore } from "@/lib/store";
import useSWR from "swr";
import { CheckCircle } from "lucide-react";
import WhatsAppQR from "@/components/WhatsAppQR";


const fetcher = (url: string) => fetch(url).then((res) => res.json());

/* ─── LOCAL IMAGE PATHS ──────────────────────────────────────────────────── */
const IMG = {
  hero1: "/images/smiling-african-american-businessman-in-formal-wea-2026-03-11-03-21-23-utc.jpg",
  hero2: "/images/beautiful-woman-working-in-the-office-2026-01-08-23-43-55-utc.jpg",
  hero3: "/images/closeup-of-businessman-working-at-office-2026-03-09-08-12-56-utc.jpg",
  hero4: "/images/young-african-woman-working-on-a-laptop-at-a-table-2026-03-09-04-59-25-utc.jpg",
  hero5: "/images/african-american-entrepreneur-businessman-working-2026-03-09-08-14-40-utc.jpg",
  parallax: "/images/happy-woman-working-from-home-2026-03-08-23-03-21-utc.jpg",
  academy1: "/images/closeup-of-beautiful-black-lady-in-african-costume-2026-01-08-23-04-10-utc.jpg",
  academy2: "/images/adult-woman-reading-the-news-2026-03-09-23-02-26-utc.jpg",
  academy3: "/images/man-computer-student-american-office-education-job-2026-03-09-01-53-20-utc.jpg",
  phone: "/images/female-hands-holding-mobile-phone-with-black-displ-2026-03-10-01-10-18-utc.jpg",
  woman: "/images/young-smiling-african-woman-poses-near-stairs-in-t-2026-01-09-06-37-57-utc.jpg",
  calc: "/images/polish-currency-money-calculator-and-pen-on-sprea-2026-03-10-02-04-12-utc.jpg",
  plans: "/images/smiling-face-making-plans-for-the-night-2026-03-09-08-20-09-utc.jpg",
  logo: "/images/logo.jpg",
  creative_man_phone: "/images/african-american-male-customer-choosing-smartphone-2026-03-09-02-58-49-utc.jpg",
  creative_serious: "/images/serious-man-concentrating-on-his-work-2026-03-09-03-22-48-utc.jpg",
  creative_entrepreneur: "/images/african-american-entrepreneur-businessman-working-2026-03-09-09-18-43-utc.jpg",
};

const HERO_SLIDES = [
  {
    id: "ifb",
    title: "Tax-Free Infrastructure Bonds",
    subtitle: "IFB1/2024/6.5",
    badge: "Recommended",
    value: "18.5% Net Yield",
    image: IMG.hero1,
    description: "Sovereign-backed returns with complete tax exemption. The ultimate anchor for wealth preservation.",
    stats: [
      { label: "Duration", value: "6.5 Yrs" },
      { label: "Coupon", value: "16.0%" },
      { label: "Min. Entry", value: "KES 100k" },
    ],
  },
  {
    id: "nse",
    title: "NSE Blue-Chip Equities",
    subtitle: "Real-Time Terminal",
    badge: "Live Data",
    value: "Instant Liquidity",
    image: IMG.hero2,
    description: "Track SCOM, EQTY, KCB, COOP & EABL with institutional-grade 24h price action and deep order books.",
    stats: [
      { label: "Market Cap", value: "KES 1.8T" },
      { label: "Coverage", value: "100%" },
      { label: "Latency", value: "< 50ms" },
    ],
  },
  {
    id: "mmf",
    title: "MMF Yield Leaderboard",
    subtitle: "Money Market Dominance",
    badge: "Top Tier",
    value: "Top MMFs 14-18%",
    image: IMG.hero3,
    description: "Deep data matrix comparing 30+ MMFs: Zidi, CIC, Kuza, Lofty, Sanlam & more. 1-year trendlines mapped to CBK rates.",
    stats: [
      { label: "Funds Tracked", value: "32+" },
      { label: "Updates", value: "Daily" },
      { label: "Avg. Premium", value: "+2.4%" },
    ],
  },
  {
    id: "portfolio",
    title: "All-Weather Portfolio Builder",
    subtitle: "Institutional Allocation",
    badge: "Strategy",
    value: "Balanced Alpha",
    image: IMG.hero4,
    description: "Automatically construct resilient portfolios. Balances MMF liquidity, Bond stability, and Equity growth.",
    stats: [
      { label: "Asset Classes", value: "5 Core" },
      { label: "Rebalancing", value: "Auto" },
      { label: "Sharpe Ratio", value: "1.8" },
    ],
  },
  {
    id: "pro",
    title: "National Economic Intelligence",
    subtitle: "Sentinel Wealth Framework",
    badge: "Sovereign-Grade",
    value: "Vision 2030 Ready",
    image: IMG.hero5,
    description: "Empowering every Kenyan with institutional-grade capital data. Transitioning the national economy from passive savings to active, tax-optimized wealth generation.",
    stats: [
      { label: "Data Uptime", value: "99.99%" },
      { label: "Sentill Africa Oracle", value: "Active" },
      { label: "Encryption", value: "End-to-End" },
    ],
  },
];

const FAQS = [
  { q: "Is Sentill a custodian of my money?", a: "No. Sentill is a non-custodial intelligence layer. We never hold or manage your funds. You invest directly with licensed providers like CIC, Sanlam, Britam, or through the NSE via your own CDSC account." },
  { q: "How accurate are the yield projections?", a: "Yields are updated daily from official fund manager reports. Our projections automatically factor in the 15% KRA Withholding Tax for MMFs to give you the real net yield, not the misleading gross figure." },
  { q: "What is the Sentil Pro subscription?", a: "Pro unlocks the Ultra Advisor AI engine, automated KRA tax form generation, real-time bond auction alerts, and priority customer support. Start with our 7-day trial for just KES 100 — no auto-renewal, no commitment." },
  { q: "Can I track SACCOs and Chamas?", a: "Yes. Our Chama Admin module lets you manage group investments, track contributions, and generate transparent audit reports for all members." },
  { q: "Is my data secure?", a: "Absolutely. All connections are encrypted end-to-end. We use institutional-grade security protocols and never share your data with third parties." },
];

const MARKET_ASSETS = [
  { id: "ifb1_2024", provider: "IFB1/2024/6.5", yield: "18.5%", liquidity: "Secondary", aum: "Bond", trend: "up", type: "Bond", desc: "Tax-free sovereign infrastructure." },
  { id: "cic", provider: "CIC Wealth MMF", yield: "15.9%", liquidity: "24 Hrs", aum: "KES 5.8B", trend: "up", type: "MMF", desc: "Largest non-bank MMF by AUM." },
  { id: "lofty", provider: "Lofty Corban MMF", yield: "16.8%", liquidity: "Instant", aum: "KES 1.8B", trend: "up", type: "MMF", desc: "Aggressive cash management." },
  { id: "SCOM", provider: "Safaricom PLC", yield: "12.4%", liquidity: "T+1", aum: "Equity", trend: "up", type: "Stock", desc: "Dominant telco with high dividends." },
  { id: "etica", provider: "Etica MMF", yield: "17.5%", liquidity: "24-48 Hrs", aum: "KES 4.2B", trend: "up", type: "MMF", desc: "High-yield emerging fund manager." },
  { id: "sanlam", provider: "Sanlam Pesa MMF", yield: "16.2%", liquidity: "24 Hrs", aum: "KES 4.7B", trend: "up", type: "MMF", desc: "Safe, balanced liquidity hub." },
  { id: "EQTY", provider: "Equity Group", yield: "14.1%", liquidity: "T+1", aum: "Equity", trend: "up", type: "Stock", desc: "Regional banking powerhouse." },
  { id: "KCB", provider: "KCB Group", yield: "13.8%", liquidity: "T+1", aum: "Equity", trend: "down", type: "Stock", desc: "Kenya's legacy banking leader." },
  { id: "EABL", provider: "EABL", yield: "11.5%", liquidity: "T+1", aum: "Equity", trend: "up", type: "Stock", desc: "Blue-chip consumer non-cyclical." },
  { id: "fxd1_2024", provider: "FXD1/2024/10", yield: "16.4%", liquidity: "Secondary", aum: "Bond", trend: "up", type: "Bond", desc: "Long-term fixed-income anchor." },
  { id: "genafrica", provider: "GenAfrica MMF", yield: "15.8%", liquidity: "24 Hrs", aum: "KES 3.1B", trend: "up", type: "MMF", desc: "Institutional grade reliability." },
  { id: "oldmutual", provider: "Old Mutual MMF", yield: "14.9%", liquidity: "Sub-48 Hrs", aum: "KES 9.2B", trend: "up", type: "MMF", desc: "Regional wealth pioneer." },
  { id: "ncba", provider: "NCBA MMF", yield: "15.5%", liquidity: "Instant", aum: "KES 6.4B", trend: "up", type: "MMF", desc: "Digital-first liquidity management." },
  { id: "cic", provider: "CIC Wealth MMF", yield: "14.2%", liquidity: "24 Hrs", aum: "KES 5.8B", trend: "down", type: "MMF", desc: "Legacy security and growth." },
  { id: "absa", provider: "Absa MMF", yield: "13.8%", liquidity: "24 Hrs", aum: "KES 4.1B", trend: "up", type: "MMF", desc: "Global standards, local yields." },
];

const AI_RECOMMENDATIONS = [
  { symbol: "KEGN", name: "KenGen PLC", signal: "BUY", target: "KES 6.20", confidence: "94%", reason: "Oversold RSI + Renewable shift." },
  { symbol: "COOP", name: "Co-operative Bank", signal: "HOLD", target: "KES 13.50", confidence: "82%", reason: "Dividend stability." },
  { symbol: "SCOM", name: "Safaricom PLC", signal: "BUY", target: "KES 24.00", confidence: "88%", reason: "M-Pesa growth acceleration." },
  { symbol: "EQTY", name: "Equity Group", signal: "BUY", target: "KES 56.00", confidence: "91%", reason: "Regional expansion alpha." },
  { symbol: "EABL", name: "East African Breweries", signal: "SELL", target: "KES 110.00", confidence: "76%", reason: "Cost pressures in supply chain." },
  { symbol: "ABS", name: "Absa Bank", signal: "BUY", target: "KES 16.50", confidence: "85%", reason: "Credit growth momentum." },
  { symbol: "IFB1", name: "Infrastructure Bond", signal: "TAX-FREE", target: "18.5%", confidence: "99%", reason: "Sovereign-backed, zero WHT." },
];

export default function HomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isCloning, setIsCloning] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeCalc, setActiveCalc] = useState<"growth" | "compare" | "loan">("growth");

  const { isPremiumModalOpen, setPremiumModalOpen } = useAIStore();

  const { data: nseData } = useSWR("/api/market/nse", fetcher);
  const { data: aiRatesData } = useSWR("/api/market/ai-rates", fetcher);

  const getLiveRate = (symbol: string) => {
     if (symbol === "ETICA") {
        const rate = aiRatesData?.rates?.["ETCA"] || 17.55;
        return { display: `${rate}%`, verified: true };
     }
     
     const stockSym = symbol === "ABS" ? "ABSA" : symbol;
     const stock = nseData?.stocks?.find((s: any) => s.symbol === stockSym);
     if (stock) {
        return { 
           display: `KES ${stock.price.toFixed(2)}`, 
           verified: stock.source === "gemini-forced"
        };
     }
     return { display: "Gathering...", verified: false };
  };

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    }
    checkSession();
  }, []);

  const handleCloneStrategy = async (strategyName: string) => {
    if (!isLoggedIn) {
      toast.error("Authentication Required", {
        description: "Please sign in or create an account to start cloning strategies.",
        action: {
          label: "Sign In",
          onClick: () => router.push("/auth/login")
        }
      });
      return;
    }

    setIsCloning(strategyName);
    try {
      const res = await fetch("/api/portfolio/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyName, principal: 100000 }) // Default 100k principal for cloning
      });

      if (res.ok) {
        toast.success(`Successfully cloned ${strategyName}!`, {
          description: "Strategy assets have been added to your portfolio.",
          action: {
            label: "View Dashboard",
            onClick: () => router.push("/dashboard")
          }
        });
      } else {
        const error = await res.json();
        toast.error("Failed to clone strategy", { description: error.error });
      }
    } catch (err) {
      toast.error("Network error during cloning");
    } finally {
      setIsCloning(null);
    }
  };

  const handleOpenAssetModal = (assetId?: string) => {
    if (assetId) setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Generate FAQ Schema for AI Overviews
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  // Parallax
  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  // Countdown
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const update = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / 864e5),
          hours: Math.floor((diff / 36e5) % 24),
          minutes: Math.floor((diff / 6e4) % 60),
          seconds: Math.floor((diff / 1e3) % 60),
        });
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Slider auto-advance
  useEffect(() => {
    const id = setInterval(() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="bg-white min-h-screen text-slate-900 flex flex-col font-inter overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — FULL-WIDTH HERO SLIDER
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[100vh] flex items-center pt-44 pb-16 overflow-hidden -mt-44">
        {/* Background image with fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority
            />
            {/* White fade overlays reduced to allow full wide images to shine through */}
            <div className="absolute inset-0 bg-white/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-7"
              >
                {/* Badge row */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] shadow-sm">
                    {slide.badge === "Recommended" ? <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> : <Zap className="w-3.5 h-3.5" />}
                    {slide.badge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{slide.subtitle}</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-[4.2rem] font-black text-slate-900 tracking-tighter leading-[1.05]">
                  {slide.title}
                </h1>

                <p className="text-slate-600 text-lg max-w-lg leading-relaxed font-medium">{slide.description}</p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 border-y border-slate-200 py-5 max-w-lg">
                  {slide.stats.map((s, i) => (
                    <div key={i}>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block mb-1">{s.label}</span>
                      <span className="text-lg font-black text-slate-900">{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* IFB countdown */}
                {slide.id === "ifb" && (
                  <div className="flex items-center gap-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl max-w-lg shadow-sm">
                    <div className="flex-1">
                      <p className="text-[10px] text-emerald-600 uppercase tracking-[0.15em] font-black mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Auction Closes</p>
                      <div className="flex items-center gap-2 font-mono font-black text-xl text-slate-900">
                        {[
                          { v: timeRemaining.days, l: "D" },
                          { v: timeRemaining.hours, l: "H" },
                          { v: timeRemaining.minutes, l: "M" },
                          { v: timeRemaining.seconds, l: "S" },
                        ].map((u, i) => (
                          <span key={i} className="flex items-baseline gap-0.5">
                            <span className="bg-white px-2 py-1 rounded-lg border border-slate-200">{String(u.v).padStart(2, "0")}</span>
                            <span className="text-[9px] text-slate-400">{u.l}</span>
                            {i < 3 && <span className="text-slate-300 mx-0.5">:</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="w-px h-14 bg-slate-200" />
                    <div className="pl-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Yield</p>
                      <p className="text-emerald-600 font-black text-2xl">{slide.value}</p>
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex items-center gap-4 max-w-lg pt-1">
                  <Link href="/auth/register" className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg">
                    {slide.id === "ifb" ? "Access Dashboard" : "Join Sentill"} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button onClick={() => setIsAssetModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl py-4 text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
                    <Plus className="w-4 h-4" /> Log Asset
                  </button>
                </div>
                {/* WhatsApp quick access */}
                <div className="mt-4">
                  <WhatsAppQR />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex items-center gap-2.5 mt-14">
              {HERO_SLIDES.map((s, i) => (
                <button key={s.id} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-400 ${i === currentSlide ? "w-10 bg-emerald-500" : "w-4 bg-slate-200 hover:bg-slate-300"}`} aria-label={`Slide ${i + 1}`} />
              ))}
              <span className="ml-3 text-[10px] font-mono font-bold text-slate-400 tracking-wider">0{currentSlide + 1}/0{HERO_SLIDES.length}</span>
            </div>
          </div>

          {/* Right — floating photo card */}
          <div className="relative h-[550px] hidden lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl"
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/20" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl border border-slate-200 p-6 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{slide.badge}</p>
                        <p className="text-lg font-black text-slate-900">{slide.value}</p>
                      </div>
                    </div>
                    <BarChart3 className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="h-16 flex items-end gap-1.5">
                    {[30, 50, 40, 65, 55, 80, 70, 90, 75, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: i * 0.04 + 0.5, type: "spring" }}
                        className={`flex-1 rounded-t ${i === 9 ? "bg-emerald-500" : "bg-slate-200"}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1.5 — IFB BOND PULSE (HIGH-IMPACT TERMINAL)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative -mt-16 z-20 max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10 group-hover:bg-emerald-500/10 transition-colors duration-1000" />
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left: Pulse Meta */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg animate-pulse">Live Auction</div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sovereign Asset Terminal</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                  IFB1/2024 Bond Pulse
                </h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">
                  The Kenyan Infrastructure Bond Tap Sale is currently open. Yields are trading at historic premiums with 100% tax exemption on coupon payments.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                 {[
                   { label: "Net Yield", value: "18.46%", sub: "Tax Free", color: "text-emerald-600" },
                   { label: "Duration", value: "6.5 Yrs", sub: "Maturity 2031", color: "text-slate-900" },
                   { label: "Status", value: "Tap Open", sub: "Sovereign A+", color: "text-blue-600" },
                   { label: "Min Entry", value: "100K", sub: "KES Nominal", color: "text-slate-900" },
                 ].map((stat, i) => (
                   <div key={i} className="space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                     <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">{stat.sub}</span>
                   </div>
                 ))}
              </div>
            </div>

            {/* Right: Countdown & CTAs */}
            <div className="w-full lg:w-[400px] space-y-8 bg-slate-50 border border-slate-100 p-8 lg:p-10 rounded-[2rem]">
               <div className="text-center lg:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Auction Close Countdown</span>
                  <div className="flex items-center justify-center lg:justify-start gap-4 font-mono font-black text-3xl text-slate-900">
                    {[
                      { v: timeRemaining.days, l: "Days" },
                      { v: timeRemaining.hours, l: "Hrs" },
                      { v: timeRemaining.minutes, l: "Min" },
                      { v: timeRemaining.seconds, l: "Sec" },
                    ].map((u, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="bg-white w-14 h-14 flex items-center justify-center rounded-xl border border-slate-200 shadow-sm">{String(u.v).padStart(2, "0")}</span>
                        <span className="text-[8px] text-slate-400 mt-2 font-sans uppercase tracking-widest">{u.l}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="h-px bg-slate-200" />

               <div className="flex flex-col gap-3">
                  <Link href="/markets/bonds" className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl">
                    <Zap className="w-4 h-4 text-emerald-400" /> Instant Bid Entry
                  </Link>
                  <button onClick={() => setIsAssetModalOpen(true)} className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Log Position
                  </button>
               </div>
               
               <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">Verified CBK Security Standard</span>
               </div>
            </div>
          </div>
        </motion.div>
      </section>


      {/* ── SECTION 2 — VISION 2030 IMPACT ─────────────────────────────── */}
      <section className="pt-24 pb-12 bg-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="bg-slate-950 rounded-[3rem] p-10 lg:p-20 relative overflow-hidden border border-white/5 shadow-2xl">
             {/* Animated blurred backgrounds */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-0" />
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] -z-0" />
             
             <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Vision 2030 Alignment</span>
                   </div>
                   <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none">
                      National Economic <br/>
                      <span className="text-emerald-400">Impact Engine.</span>
                   </h2>
                   <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                      Sentill isn&apos;t just a wealth tool; it&apos;s a sovereign capital catalyst. By optimizing individual portfolios, we strengthen the national economic fabric.
                   </p>
                   
                   <div className="flex flex-wrap gap-4">
                      <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Theoretical Capital Flow</p>
                         <p className="text-2xl font-black text-white">KES 14.82B</p>
                      </div>
                      <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tax Revenue Contribution</p>
                         <p className="text-2xl font-black text-white">KES 842M</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   {[
                     { label: "Energy Sovereignty", icon: Zap, val: "24%", color: "text-amber-400" },
                     { label: "Infrastructure Growth", icon: Landmark, val: "42%", color: "text-blue-400" },
                     { label: "Financial Inclusion", icon: Users, val: "18%", color: "text-emerald-400" },
                     { label: "SME Capitalization", icon: TrendingUp, val: "16%", color: "text-indigo-400" },
                   ].map((item, i) => (
                     <motion.div 
                       key={i}
                       whileHover={{ y: -5 }}
                       className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors"
                     >
                       <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                       <p className="text-xs font-black text-white uppercase tracking-wider mb-1">{item.label}</p>
                       <p className="text-2xl font-black text-white">{item.val}</p>
                     </motion.div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2.1 — SENTILL ACADEMY PREVIEW (E-LEARNING)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: Content */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Award className="w-4 h-4" /> Sentill Academy
                </h2>
                <h3 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                   Learn to Invest. <br/>
                   <span className="text-blue-600">Like an Institution.</span>
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">
                   Access Kenya&apos;s most comprehensive financial education vault. From Infrastructure Bond mastery to NSE technical analysis, we provide the blueprints for generational wealth.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Bond Mastery", desc: "Sovereign bidding strategies.", icon: Landmark, color: "text-emerald-500" },
                  { title: "NSE Alpha", desc: "Technical analysis for traders.", icon: TrendingUp, color: "text-blue-500" },
                  { title: "Tax Optimization", desc: "Maximize your net returns.", icon: ShieldCheck, color: "text-amber-500" },
                  { title: "Portfolio Theory", desc: "Build resilient portfolios.", icon: PieChart, color: "text-indigo-500" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group/acc hover:bg-white hover:shadow-xl transition-all">
                    <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover/acc:scale-110 transition-transform`}>
                       <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/academy" className="inline-flex items-center gap-3 px-10 py-5 bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl group">
                 Enter The Academy <PlayCircle className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </Link>
            </div>

            {/* Right: Visual Cards */}
            <div className="w-full lg:w-[500px] h-[600px] relative">
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 className="absolute top-0 right-0 w-4/5 h-3/4 rounded-[2.5rem] overflow-hidden shadow-2xl z-10 border border-white/20"
               >
                 <Image src={IMG.academy1} alt="Sentill Academy" fill className="object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent " />
                 <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Coming Next Week</p>
                    <p className="text-white font-black text-lg uppercase tracking-tight">Private Market Strategies</p>
                 </div>
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.2 }}
                 className="absolute bottom-0 left-0 w-3/4 h-2/3 rounded-[2.5rem] overflow-hidden shadow-2xl z-0 border border-white/20"
               >
                 <Image src={IMG.academy3} alt="Masterclass" fill className="object-cover" />
                 <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
               </motion.div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative w-full min-h-[500px] flex items-center overflow-hidden py-24">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/african-american-entrepreneur-businessman-working-2026-03-09-09-18-43-utc.jpg" 
            alt="Sentiment Intelligence" 
            fill 
            className="object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/30 border border-indigo-400/40 rounded-full mb-6 backdrop-blur-md">
              <Signal className="w-4 h-4 text-indigo-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50">Social Pulse Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.95] drop-shadow-2xl">
              Sentiment <br/>
              <span className="text-indigo-400">Intelligence Engine.</span>
            </h2>
            <p className="text-lg font-medium text-slate-200 leading-relaxed mb-8 max-w-lg drop-shadow">
              Sentill&apos;s AI monitors X, Reddit, and Telegram in real-time to detect institutional signals and retail momentum before they hit the terminal. 
            </p>
            
            <div className="flex gap-4">
               <div className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                  <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Global Sentiment</p>
                  <p className="text-2xl font-black text-emerald-400 uppercase">Exuberant</p>
               </div>
               <div className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                  <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Social Score</p>
                  <p className="text-2xl font-black text-white uppercase">82/100</p>
               </div>
            </div>
          </motion.div>

          {/* Data on the Right — Top Portfolios Widget */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group/card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-400" /> Top Portfolios
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Yield Leaders</p>
                </div>
                <Link href="/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Sovereign Shield", return: "+17.8%", tag: "Low Risk", color: "text-emerald-400" },
                  { name: "Equity Growth", return: "+24.2%", tag: "High Alpha", color: "text-blue-400" },
                  { name: "Balanced Wealth", return: "+19.5%", tag: "Steady", color: "text-amber-400" },
                ].map((p, i) => (
                  <Link 
                    key={i} 
                    href={`/dashboard?strategy=${p.name.toLowerCase().replace(' ', '-')}`}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group/item"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-[10px]">0{i + 1}</div>
                      <div>
                        <p className="text-xs font-black text-white">{p.name}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{p.tag}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${p.color}`}>{p.return}</p>
                      <p className="text-[8px] font-semibold text-slate-600 uppercase">Est. Annual</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <Link href="/markets" className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                  Explore All Alpha Markets <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2.4 — DAILY INTELLIGENCE BOARD (AI RECOMMENDATIONS)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Cpu className="w-4 h-4" /> Sentill Africa Oracle</h2>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">Today&apos;s Top Recommendations</h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Wealth Diagnostics · Updated {new Date().toLocaleDateString()}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AI_RECOMMENDATIONS.map((rec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem] group hover:bg-slate-950 hover:text-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-xl tracking-tighter uppercase mb-0.5">{rec.symbol}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{rec.name}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${rec.signal === 'BUY' ? 'bg-emerald-500 text-white' : rec.signal === 'ALLOCATE' ? 'bg-indigo-500 text-white' : rec.signal === 'HOLD' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {rec.signal}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                    <span className="text-slate-400">Current Rate</span>
                    <span className="text-slate-900 flex items-center gap-1.5">
                      {getLiveRate(rec.symbol).display}
                      {getLiveRate(rec.symbol).verified && (
                         <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                           <CheckCircle className="w-3 h-3 text-blue-500" />
                           <span className="text-[7px] font-black uppercase tracking-widest text-blue-600">AI Verified</span>
                         </div>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                    <span className="text-slate-400">Target</span>
                    <span>{rec.target}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-emerald-500">{rec.confidence}</span>
                  </div>
                  <div className="h-px bg-slate-200 group-hover:bg-white/10" />
                  <p className="text-[11px] leading-relaxed font-medium text-slate-500 group-hover:text-slate-300 italic">
                    &quot;{rec.reason}&quot;
                  </p>
                </div>

                <button 
                  onClick={() => {
                    if (isLoggedIn) {
                       if (user?.isPremium) {
                         router.push(`/markets/${rec.signal === 'ALLOCATE' ? 'mmfs' : 'nse'}`);
                       } else {
                         setPremiumModalOpen(true);
                       }
                    } else {
                       router.push("/packages");
                    }
                  }}
                  className="w-full py-4 rounded-xl border border-slate-200 group-hover:border-white/20 group-hover:bg-white/10 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  {isLoggedIn && !user?.isPremium ? "Unlock Analysis" : "Deep Dive"} <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — ADVANCED WEALTH WIDGETS (AI PULSE & TAX ALPHA)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-8">
           <SocialSentimentPulse score={82} mentions={14500} />
           <TaxAlphaOptimizer yieldRate={17.5} taxCategory="WHT_15" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — FEATURED ALPHA MATRIX (5 ITEMS PER LINE)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-y border-slate-100 py-24 relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> Market Matrix</h2>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">Market Intelligence</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
               <div className="flex gap-2">
                 {["All", "MMF", "Stock", "Bond"].map((cat) => (
                   <button 
                     key={cat} 
                     onClick={() => setFilterCategory(cat)}
                     className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${filterCategory === cat ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
               <Link href="/markets/mmfs" className="text-[10px] font-black text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors uppercase tracking-widest">View All Assets <ChevronRight className="w-4 h-4" /></Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {MARKET_ASSETS.filter(a => filterCategory === "All" || a.type === filterCategory).slice(0, 10).map((asset, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 text-sm mb-0.5 line-clamp-1">{asset.provider}</h4>
                    <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">{asset.type}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${asset.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                    <TrendingUp className={`w-3.5 h-3.5 ${asset.trend === "down" && "rotate-180"}`} />
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">{asset.desc}</p>
                
                <div className="space-y-3 mb-6">
                   <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Yield</span>
                      <span className="text-slate-900 font-black">{asset.yield}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Liquidity</span>
                      <span className="text-slate-600">{asset.liquidity}</span>
                   </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenAssetModal(asset.id)} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors hover:bg-slate-800">Add to Portfolio</button>
                    <button onClick={() => handleOpenAssetModal(asset.id)} className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors hover:bg-emerald-100 italic">Analyse</button>
                  </div>
                  <Link href="/tools/compare" className="w-full py-2 bg-slate-50 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center gap-2 transition-all">
                    <Layers className="w-3 h-3" /> Compare
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3.25 — FINANCIAL CALCULATORS HUB
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative" id="calculators">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Calculator className="w-4 h-4" /> Financial Tools</h2>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">Wealth Calculators</h3>
              <p className="text-slate-500 font-medium text-sm mt-2 max-w-xl">Run projections on Kenya&apos;s top investment products. All calculations are for informational purposes only.</p>
            </div>
          </div>

          {/* Calculator Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: "growth" as const, label: "Investment Growth", icon: TrendingUp },
              { key: "compare" as const, label: "MMF Comparison", icon: Layers },
              { key: "loan" as const, label: "Loan vs Invest", icon: Target },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCalc(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeCalc === tab.key
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Calculator Content */}
          <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 lg:p-12">
            {activeCalc === "growth" && <InvestmentGrowthCalculator />}
            {activeCalc === "compare" && <MMFCompareCalculator />}
            {activeCalc === "loan" && <LoanVsInvestCalculator />}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3.5 — TOP PORTFOLIOS (SLIDER/ROW)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><PieChart className="w-4 h-4" /> Strategic Allocation</h2>
              <h3 className="text-4xl font-black text-white tracking-tight">Top Managed Portfolios</h3>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
            {[
              { name: "Sovereign Shield", risk: "Low", return: "17.8%", assets: "Bonds + MMF", icon: ShieldCheck, img: IMG.hero1, color: "text-emerald-400" },
              { name: "Equity Growth", risk: "High", return: "24.2%", assets: "Blue-Chip NSE", icon: TrendingUp, img: IMG.hero2, color: "text-blue-400" },
              { name: "Balanced Wealth", risk: "Med", return: "19.5%", assets: "Mixed Assets", icon: Layers, img: IMG.hero3, color: "text-amber-400" },
              { name: "Dividend Income", risk: "Low", return: "15.9%", assets: "REITs + Saccos", icon: Landmark, img: IMG.hero4, color: "text-indigo-400" },
              { name: "Global Diaspora", risk: "Med", return: "18.4%", assets: "FX Hedged", icon: Globe, img: IMG.hero5, color: "text-rose-400" },
            ].map((p, i) => (
              <div key={i} className="min-w-[320px] min-h-[420px] relative rounded-[2.5rem] snap-center overflow-hidden group shadow-2xl border border-white/10">
                {/* Background Image */}
                <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                         <p.icon className={`w-5 h-5 ${p.color}`} />
                      </div>
                      <div>
                         <p className={`text-[10px] font-black uppercase tracking-widest ${p.color}`}>{p.assets}</p>
                         <h4 className="text-xl font-black text-white">{p.name}</h4>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5 pb-6">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">Risk</span>
                        <span className="text-sm font-black text-white">{p.risk}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">Est. Return</span>
                        <span className="text-sm font-black text-emerald-400">{p.return}</span>
                      </div>
                   </div>

                   <button 
                     onClick={() => handleCloneStrategy(p.name)}
                     disabled={isCloning === p.name}
                     className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                   >
                      {isCloning === p.name ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )} 
                      {isCloning === p.name ? "Cloning..." : "Clone Strategy"}
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — CHAMA & SACCO AUDIT MODULE
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
           <div className="relative group">
              <div className="absolute -inset-4 bg-emerald-500/5 rounded-[3rem] blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-emerald-100/50 rounded-2xl">
                       <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-slate-900">Wealth Group Audit</h4>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Group Ledger</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {[
                      { name: "Total Asset Value", value: "KES 14,250,000", change: "+12.4%", icon: Wallet },
                      { name: "Active Members", value: "48 Members", change: "Verified", icon: ShieldCheck },
                      { name: "Next Disbursment", value: "24 Mar 2026", change: "Automated", icon: Clock },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-white rounded-xl border border-slate-200">
                              <item.icon className="w-5 h-5 text-slate-900" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</p>
                              <p className="text-sm font-black text-slate-900">{item.value}</p>
                           </div>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.change}</span>
                      </div>
                    ))}
                 </div>

                 <button className="w-full mt-10 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" /> Download Certified Audit Report
                 </button>
              </div>
           </div>

           <div className="space-y-8">
              <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]">Institutional Transparency</h2>
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">Master Your Chama with Absolute Precision.</h3>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Sentinel's Chama Admin module removes the friction of group wealth management. Automatic member contribution tracking, real-time ROI auditing, and KRA-ready reporting.
              </p>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-black">
                       <Check className="w-5 h-5 text-emerald-500" /> Multi-User Access
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-7">Permission Control</p>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-black">
                       <Check className="w-5 h-5 text-emerald-500" /> 1-Click Audits
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-7">PDF Certified</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5 — PARALLAX BREAK
         ═══════════════════════════════════════════════════════════════════════ */}
      <section ref={parallaxRef} className="relative h-[600px] overflow-hidden flex items-center justify-center">
        <motion.div className="absolute inset-0 w-full h-[130%]" style={{ y: parallaxY }}>
          <Image src={IMG.parallax} alt="Sentill user" fill className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
              The Future of African Wealth.
            </h2>
            <p className="text-white/90 text-xl font-medium mb-12 leading-relaxed max-w-2xl mx-auto">
              Sovereign bonds, money markets, and high-alpha equities — all managed through one surgical interface.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link href="/auth/register" className="px-12 py-5 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-2xl">
                  Open Your Global Ledger
               </Link>
               <button className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest group">
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                     <PlayCircle className="w-6 h-6" />
                  </div>
                  Watch Masterclass Trailer
               </button>
            </div>
          </motion.div>
        </div>
      </section>
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6.1 — SENTILL DIASPORA HUB
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 border-y border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1 relative">
                <div className="absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-2xl opacity-50" />
                <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl aspect-video">
                   <Image src="/images/african-american-entrepreneur-businessman-working-2026-03-09-08-14-40-utc.jpg" alt="Diaspora Investing" fill className="object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                   <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">USD - KES Parity</p>
                         <h4 className="text-2xl font-black text-white">Institutional Remittance</h4>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Saving</p>
                         <p className="text-xl font-black text-emerald-400">4.2% Growth</p>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="order-1 lg:order-2 space-y-8">
                <div className="space-y-4">
                   <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><Globe className="w-4 h-4" /> Diaspora Growth</h2>
                   <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">Invest Globally, Return Locally.</h3>
                   <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">
                       Sentill Diaspora Hub provides specialized treasury insights for Kenyans living abroad. Track USD-KES parity in real-time and access primary Infrastructure Bond auctions with zero local friction.
                   </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 py-4 border-y border-slate-200">
                   <div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Access</h5>
                      <p className="text-sm font-black text-slate-900">Direct CBK Bidding</p>
                   </div>
                   <div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">FX Hedge</h5>
                      <p className="text-sm font-black text-slate-900">Volatility Protection</p>
                   </div>
                </div>
                
                <Link href="/diaspora" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl group">
                   Onboard as Diaspora Client <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6.2 — SUBSCRIPTION PACKAGES
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
             <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]"><Zap className="w-4 h-4 inline-block mr-2" /> Tiered Intelligence</h2>
             <h3 className="text-4xl font-black text-slate-900 tracking-tight">Choose Your Wealth Tier</h3>
             <p className="text-slate-500 font-medium">From casual tracking to institutional mastery. Select the plan that fits your wealth trajectory.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { name: "Starter", price: "Free", period: "", badge: "Core", features: ["Basic Portfolio Tracking", "NSE Price Feeds", "Daily Yield Pulse", "Sentil Academy"], cta: "Start Free", popular: false },
               { name: "1 Week Pro", price: "99", period: "/week", badge: "🔥 Try It", features: ["AI Risk Guard Engine", "Unlimited Portfolio Logging", "Tax-Loss Harvesting AI", "NSE Charts + MACD/RSI", "Priority Support"], cta: "Start — KES 99", popular: false },
               { name: "1 Month Pro", price: "349", period: "/month", badge: "Best Value", features: ["Everything in Weekly", "Estate Vault & Alerts", "Global Macro Pulse", "Automated KRA Tax Export", "1-on-1 Strategy Session"], cta: "Go Pro — KES 349", popular: true },
               { name: "3 Months Pro", price: "999", period: "/quarter", badge: "💎 Max Savings", features: ["Everything in Monthly", "VIP Concierge Support", "Quarterly Wealth Report", "Early Feature Access", "Institutional Briefs"], cta: "Lock In — KES 999", popular: false },
             ].map((pkg, i) => (
               <div key={i} className={`relative p-8 rounded-[2.5rem] border ${pkg.popular ? "border-emerald-600 bg-slate-900 text-white shadow-2xl md:-translate-y-4" : "border-slate-200 bg-white text-slate-900 shadow-sm"} flex flex-col items-center text-center overflow-hidden h-full group`}>
                  {pkg.popular && <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">Recommended</div>}
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-5 opacity-60">{pkg.name}</h4>
                  <div className="mb-6">
                    <span className="text-4xl font-black tracking-tighter">KES {pkg.price}</span>
                    {pkg.price !== "Free" && <span className="text-[10px] font-bold uppercase ml-2 opacity-40">{pkg.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                     {pkg.features.map((f, j) => (
                       <li key={j} className="flex items-center justify-center gap-2 text-sm font-medium">
                          <Check className={`w-4 h-4 ${pkg.popular ? "text-emerald-400" : "text-emerald-600"}`} /> {f}
                       </li>
                     ))}
                  </ul>
                  <button 
                    onClick={() => {
                      if (pkg.name === "Starter") {
                        router.push("/auth/register");
                      } else if (pkg.price !== "Free") {
                        if (isLoggedIn) {
                          setPremiumModalOpen(true);
                        } else {
                          router.push("/packages");
                        }
                      } else {
                        router.push("/contact");
                      }
                    }}
                    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center block ${
                      pkg.popular ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg" : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isLoggedIn && user?.isPremium && pkg.price !== "Free" ? "Active Subscription" : pkg.cta}
                  </button>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6.3 — STRATEGIC DISCLAIMER (WIDE HIGHLIGHT)
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <Image src="/images/smiling-face-making-plans-for-the-night-2026-03-09-08-20-09-utc.jpg" alt="Strategic Vision" fill className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center space-y-8">
           <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-200 rounded-full text-[10px] font-black text-blue-700 uppercase tracking-widest shadow-sm">
              <Info className="w-4 h-4" /> Information Hub Only — Not a Financial Advisor
           </div>
           <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-tight max-w-3xl mx-auto">
              Investment inherently carries risk. Historical yields do not guarantee future performance.
           </h3>
           <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
              SENTILL IS A NON-CUSTODIAL INFORMATION HUB. WE DO NOT HOLD, MANAGE, OR PROCESS ANY FUNDS. ALL INVESTMENTS SHOULD BE CONDUCTED THROUGH LICENSED CMA/SASRA ENTITIES AFTER INDEPENDENT VERIFICATION.
           </p>
           <a
             href="https://wa.me/254703469525?text=Hello%20Sentill%2C%20I'd%20like%20to%20learn%20more%20about%20investment%20options%20in%20Kenya."
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#20BD5A] transition-all shadow-lg"
           >
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
             Ask Questions via WhatsApp
           </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6.5 — CREATIVE PARALLAX GRID
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 bg-slate-950 overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 z-0 opacity-20 select-none pointer-events-none mt-[-5%] overflow-hidden">
           <motion.div style={{ y: parallaxY }} className="w-full h-[150%] relative hidden lg:block">
             <Image src={IMG.creative_entrepreneur} alt="Background Parallax" fill className="object-cover grayscale" />
           </motion.div>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">The Modern Investor</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Intelligence at Every Level.</h3>
          </div>

          <div className="grid md:grid-cols-5 gap-4 md:gap-6 h-auto md:h-[500px]">
            {/* Image 1 - Adult woman reading news */}
            <motion.div 
               whileHover={{ scale: 1.02 }} 
               className="md:col-span-2 relative rounded-[2rem] overflow-hidden group shadow-2xl h-[300px] md:h-auto"
            >
               <Image src={IMG.academy2} alt="Market reading" fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal" />
               <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
               <div className="absolute bottom-6 left-6 right-6">
                 <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Stay Informed</p>
                 <p className="text-white font-bold text-lg">Real-time market insights</p>
               </div>
            </motion.div>

            {/* Middle Column */}
            <div className="md:col-span-1 flex flex-col gap-4 md:gap-6">
               <motion.div whileHover={{ scale: 1.02 }} className="flex-1 relative rounded-[2rem] overflow-hidden group shadow-2xl h-[200px] md:h-auto">
                 <Image src={IMG.creative_man_phone} alt="Mobile investing" fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal" />
                 <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
               </motion.div>
               <motion.div whileHover={{ scale: 1.02 }} className="flex-1 relative rounded-[2rem] overflow-hidden group shadow-2xl h-[200px] md:h-auto">
                 <Image src={IMG.phone} alt="App execution" fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal object-top" />
                 <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
               </motion.div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 flex flex-col gap-4 md:gap-6">
               <motion.div whileHover={{ scale: 1.02 }} className="h-[200px] relative rounded-[2rem] overflow-hidden group shadow-2xl">
                 <Image src={IMG.creative_serious} alt="Deep concentration" fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal object-top" />
                 <div className="absolute inset-0 bg-slate-800/50 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
                 <div className="absolute bottom-6 left-6 right-6">
                   <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Deep Work</p>
                   <p className="text-white font-bold text-lg">Advanced analytical tools</p>
                 </div>
               </motion.div>

               <motion.div whileHover={{ scale: 1.02 }} className="flex-1 relative rounded-[2rem] overflow-hidden group shadow-2xl h-[200px] md:h-auto">
                 <Image src={IMG.academy1} alt="Cultural wealth" fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal object-top" />
                 <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
                 <div className="absolute bottom-6 left-6 right-6">
                   <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Alpha Tier</p>
                   <p className="text-white font-bold text-lg">Sovereign-grade confidence</p>
                 </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 7 — COMMUNITY GALLERIA
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-24 overflow-hidden border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-16 text-center">
          <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Institutional Confidence</h2>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">The Ledger for Kenya&apos;s Elite.</h3>
        </div>
        <div className="flex gap-6 animate-marquee">
          {[IMG.woman, IMG.phone, IMG.calc, IMG.plans, IMG.hero1, IMG.hero2, IMG.hero4, IMG.parallax, IMG.academy1, IMG.academy3].map((src, i) => (
            <div key={i} className="flex-shrink-0 w-[400px] h-[250px] rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl relative group">
              <Image src={src} alt={`Community ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors" />
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 40s linear infinite; display: flex; width: max-content; }
          .animate-marquee:hover { animation-play-state: paused; }
        `}} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 8 — FAQ
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Master Support</h2>
            <h3 className="text-4xl font-black text-white tracking-tight">Strategic Intel & FAQ</h3>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden transition-all hover:bg-white/10">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-8 py-6 flex items-center justify-between gap-4 font-black text-white"
                >
                  <span className="text-base tracking-tight">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-transform duration-500 ${openFaq === i ? "rotate-180 bg-white text-slate-900" : "text-white/60"}`}>
                    <ChevronDown className="w-5 h-5 flex-shrink-0" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-8 pb-8 text-sm text-slate-300 font-medium leading-relaxed border-t border-white/10 pt-6">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          GLOBAL WIDGETS
         ═══════════════════════════════════════════════════════════════════════ */}
      <AssetModal 
        isOpen={isAssetModalOpen} 
        onClose={() => { setIsAssetModalOpen(false); setPrefilledAsset(""); }} 
        prefilledAsset={prefilledAsset}
      />
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setPremiumModalOpen(false)} 
      />
      
    </div>
  );
}
