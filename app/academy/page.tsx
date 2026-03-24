"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Play, Lock, CheckCircle, Clock, Trophy, Star,
  TrendingUp, BarChart2, Shield, Globe, Zap, Users, Award,
  ChevronRight, ChevronDown, Search, Filter, Target, Brain,
  Bookmark, Share2, Download, ArrowRight, Flame, Medal,
  GraduationCap, PieChart, DollarSign, Building2, Layers,
  AlertCircle, X, Video, FileText, HelpCircle, BarChart,
  RefreshCw, Check, XCircle, LogIn, UserPlus
} from "lucide-react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const COURSES = [
  {
    id: "investing-101",
    title: "Investing 101: Kenya Edition",
    subtitle: "The complete beginner's guide to building wealth in Kenya",
    category: "Foundations",
    level: "Beginner",
    duration: "4h 30m",
    lessons: 18,
    enrolled: 12840,
    rating: 4.9,
    reviews: 2341,
    instructor: "Sentil Research Team",
    color: "from-blue-600 to-indigo-700",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: BookOpen,
    badge: "Most Popular",
    badgeColor: "bg-blue-100 text-blue-700",
    completed: true,
    progress: 100,
    modules: [
      {
        title: "Understanding Money & Wealth",
        lessons: [
          { title: "What is wealth and why does it matter?", type: "video", duration: "12m", done: true },
          { title: "The time value of money explained", type: "video", duration: "15m", done: true },
          { title: "Inflation: Your greatest silent enemy", type: "video", duration: "10m", done: true },
          { title: "Quiz: Foundations of Wealth", type: "quiz", duration: "5m", done: true },
        ]
      },
      {
        title: "Kenya's Financial Landscape",
        lessons: [
          { title: "The CBK, NSE and regulatory environment", type: "video", duration: "18m", done: true },
          { title: "KRA Tax considerations for investors", type: "video", duration: "14m", done: true },
          { title: "Reading the Kenya Gazette: Bond offerings", type: "reading", duration: "8m", done: true },
          { title: "Quiz: Kenya Financial Ecosystem", type: "quiz", duration: "5m", done: true },
        ]
      },
      {
        title: "Asset Classes Overview",
        lessons: [
          { title: "Equities vs Fixed Income: Core differences", type: "video", duration: "20m", done: true },
          { title: "Alternative investments in Kenya", type: "video", duration: "16m", done: true },
          { title: "Building your first portfolio allocation", type: "reading", duration: "10m", done: true },
          { title: "Final Exam: Investing 101", type: "quiz", duration: "15m", done: true },
        ]
      }
    ]
  },
  {
    id: "tbills-mastery",
    title: "Treasury Bills & Bonds Mastery",
    subtitle: "Dominate the government securities market like a professional",
    category: "Fixed Income",
    level: "Intermediate",
    duration: "6h 15m",
    lessons: 24,
    enrolled: 8920,
    rating: 4.8,
    reviews: 1890,
    instructor: "Sentil Fixed Income Desk",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: Shield,
    badge: "Staff Pick",
    badgeColor: "bg-emerald-100 text-emerald-700",
    completed: false,
    progress: 65,
    modules: [
      {
        title: "Government Securities Fundamentals",
        lessons: [
          { title: "How the CBK Primary Auction works", type: "video", duration: "22m", done: true },
          { title: "91-day, 182-day, 364-day T-Bills explained", type: "video", duration: "18m", done: true },
          { title: "Discount pricing vs yield: The maths", type: "reading", duration: "12m", done: true },
          { title: "Quiz: T-Bill Mechanics", type: "quiz", duration: "8m", done: true },
        ]
      },
      {
        title: "Infrastructure Bonds (IFBs)",
        lessons: [
          { title: "What makes IFBs unique in Kenya", type: "video", duration: "20m", done: true },
          { title: "Tax-exempt status: The Alpha explained", type: "video", duration: "15m", done: true },
          { title: "How to participate in IFB auctions", type: "video", duration: "12m", done: false },
          { title: "IFB vs MMF: A full comparison", type: "reading", duration: "10m", done: false },
        ]
      },
      {
        title: "Bond Valuation & Strategy",
        lessons: [
          { title: "Duration, convexity and interest rate risk", type: "video", duration: "25m", done: false },
          { title: "Yield curve analysis for Kenyan bonds", type: "video", duration: "20m", done: false },
          { title: "Portfolio laddering strategy", type: "reading", duration: "15m", done: false },
          { title: "Final Exam: Fixed Income Mastery", type: "quiz", duration: "20m", done: false },
        ]
      }
    ]
  },
  {
    id: "nse-stock-trading",
    title: "NSE Stock Trading Masterclass",
    subtitle: "From zero to active NSE trader with full technical analysis toolkit",
    category: "Equities",
    level: "Intermediate",
    duration: "8h 45m",
    lessons: 32,
    enrolled: 6540,
    rating: 4.7,
    reviews: 1234,
    instructor: "Sentil Equities Desk",
    color: "from-orange-500 to-red-600",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    icon: BarChart2,
    badge: "New",
    badgeColor: "bg-orange-100 text-orange-700",
    completed: false,
    progress: 20,
    modules: [
      {
        title: "NSE Fundamentals",
        lessons: [
          { title: "How the Nairobi Securities Exchange works", type: "video", duration: "20m", done: true },
          { title: "Understanding CDSC accounts and settlement", type: "video", duration: "15m", done: true },
          { title: "Reading NSE ticker data", type: "reading", duration: "10m", done: false },
          { title: "Quiz: NSE Basics", type: "quiz", duration: "8m", done: false },
        ]
      },
      {
        title: "Fundamental Analysis",
        lessons: [
          { title: "Reading financial statements: P&L, Balance Sheet", type: "video", duration: "30m", done: false },
          { title: "Key ratios: P/E, EV/EBITDA, P/B for Kenyan stocks", type: "video", duration: "25m", done: false },
          { title: "Sector analysis: Banking, Telecom, Manufacturing", type: "reading", duration: "20m", done: false },
          { title: "Dividend yield strategies on the NSE", type: "video", duration: "18m", done: false },
        ]
      },
      {
        title: "Technical Analysis",
        lessons: [
          { title: "Candlestick patterns for NSE traders", type: "video", duration: "28m", done: false },
          { title: "RSI, MACD and moving averages", type: "video", duration: "25m", done: false },
          { title: "Support, resistance and breakout strategies", type: "reading", duration: "15m", done: false },
          { title: "Final Exam: NSE Trading Mastery", type: "quiz", duration: "25m", done: false },
        ]
      }
    ]
  },
  {
    id: "mmf-deep-dive",
    title: "Money Market Funds: Complete Guide",
    subtitle: "Maximize returns from Kenya's most popular investment vehicle",
    category: "Fixed Income",
    level: "Beginner",
    duration: "3h 20m",
    lessons: 14,
    enrolled: 15200,
    rating: 4.9,
    reviews: 3102,
    instructor: "Sentil Research Team",
    color: "from-violet-500 to-purple-700",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
    icon: DollarSign,
    badge: "Best Rated",
    badgeColor: "bg-violet-100 text-violet-700",
    completed: false,
    progress: 0,
    modules: [
      {
        title: "MMF Fundamentals",
        lessons: [
          { title: "What is a Money Market Fund?", type: "video", duration: "15m", done: false },
          { title: "How MMFs generate returns in Kenya", type: "video", duration: "18m", done: false },
          { title: "The 15% Withholding Tax impact", type: "reading", duration: "10m", done: false },
          { title: "Quiz: MMF Basics", type: "quiz", duration: "5m", done: false },
        ]
      },
      {
        title: "Comparing Kenya's Top MMFs",
        lessons: [
          { title: "CIC, Cytonn, Sanlam, NCBA comparison", type: "video", duration: "22m", done: false },
          { title: "Daily accrual vs monthly distribution", type: "video", duration: "16m", done: false },
          { title: "Liquidity windows and redemption timelines", type: "reading", duration: "12m", done: false },
          { title: "Final Exam: MMF Mastery", type: "quiz", duration: "15m", done: false },
        ]
      }
    ]
  },
  {
    id: "portfolio-construction",
    title: "Portfolio Construction & Risk Management",
    subtitle: "Build and manage a resilient multi-asset portfolio like a fund manager",
    category: "Advanced Strategy",
    level: "Advanced",
    duration: "10h 00m",
    lessons: 38,
    enrolled: 3890,
    rating: 4.8,
    reviews: 876,
    instructor: "Sentil Portfolio Lab",
    color: "from-slate-700 to-slate-900",
    bgLight: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    icon: PieChart,
    badge: "Pro",
    badgeColor: "bg-slate-900 text-white",
    completed: false,
    progress: 0,
    modules: [
      {
        title: "Modern Portfolio Theory",
        lessons: [
          { title: "Markowitz Efficient Frontier explained", type: "video", duration: "30m", done: false },
          { title: "Correlation and diversification in Kenya context", type: "video", duration: "25m", done: false },
          { title: "Sharpe Ratio, Sortino and alpha generation", type: "reading", duration: "20m", done: false },
          { title: "Quiz: MPT Fundamentals", type: "quiz", duration: "10m", done: false },
        ]
      },
      {
        title: "Asset Allocation Strategies",
        lessons: [
          { title: "Strategic vs tactical asset allocation", type: "video", duration: "28m", done: false },
          { title: "Risk tolerance profiling: Your investor DNA", type: "video", duration: "20m", done: false },
          { title: "Rebalancing: When and how", type: "reading", duration: "15m", done: false },
          { title: "Final Exam: Portfolio Management", type: "quiz", duration: "30m", done: false },
        ]
      }
    ]
  },
  {
    id: "real-estate-kenya",
    title: "Real Estate Investment in Kenya",
    subtitle: "REITs, direct property, and land banking strategies for the modern investor",
    category: "Real Assets",
    level: "Intermediate",
    duration: "5h 30m",
    lessons: 20,
    enrolled: 7300,
    rating: 4.6,
    reviews: 1120,
    instructor: "Sentil Real Assets Desk",
    color: "from-amber-500 to-yellow-600",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: Building2,
    badge: "Trending",
    badgeColor: "bg-amber-100 text-amber-700",
    completed: false,
    progress: 0,
    modules: [
      {
        title: "Kenya Real Estate 101",
        lessons: [
          { title: "The Kenyan property market landscape", type: "video", duration: "20m", done: false },
          { title: "REITs: Acorn D-REIT vs Ilam Fahari I-REIT", type: "video", duration: "25m", done: false },
          { title: "Land banking strategies in satellite towns", type: "reading", duration: "15m", done: false },
          { title: "Quiz: Real Estate Fundamentals", type: "quiz", duration: "8m", done: false },
        ]
      }
    ]
  }
];

const LEARNING_PATHS = [
  {
    id: "wealth-builder",
    title: "Wealth Builder Path",
    description: "Go from zero financial knowledge to a fully-managed portfolio in 90 days",
    courses: ["investing-101", "mmf-deep-dive", "tbills-mastery", "portfolio-construction"],
    duration: "24h",
    certificate: true,
    color: "from-blue-600 to-violet-700",
    icon: Trophy,
  },
  {
    id: "fixed-income-expert",
    title: "Fixed Income Expert",
    description: "Master Kenya's government securities, MMFs and corporate bonds",
    courses: ["investing-101", "mmf-deep-dive", "tbills-mastery"],
    duration: "14h",
    certificate: true,
    color: "from-emerald-500 to-teal-700",
    icon: Shield,
  },
  {
    id: "equity-trader",
    title: "NSE Equity Trader",
    description: "Full technical and fundamental analysis for active NSE trading",
    courses: ["investing-101", "nse-stock-trading"],
    duration: "13h",
    certificate: true,
    color: "from-orange-500 to-red-600",
    icon: BarChart2,
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "What is the current CBK Monetary Policy Rate (MPR) as of early 2025?",
    options: ["10.00%", "11.25%", "13.00%", "9.50%"],
    correct: 0,
    explanation: "The CBK cut the MPR to 10.00% in early 2025, continuing an easing cycle to stimulate economic activity."
  },
  {
    question: "Which type of Kenyan government bond is exempt from Withholding Tax?",
    options: ["FXD (Fixed Rate Bonds)", "Infrastructure Bonds (IFBs)", "Floating Rate Bonds", "Eurobonds"],
    correct: 1,
    explanation: "Infrastructure Bonds (IFBs) enjoy WHT exemption as an incentive to fund public infrastructure projects."
  },
  {
    question: "If an MMF yields 16% gross with 15% WHT, what is the net effective yield?",
    options: ["16%", "13.6%", "14.5%", "15%"],
    correct: 1,
    explanation: "Net yield = Gross × (1 - WHT%) = 16% × (1 - 0.15) = 16% × 0.85 = 13.6%"
  },
  {
    question: "What does a 91-day T-Bill 'discount rate' of 16% mean?",
    options: ["You earn 16% per annum for 91 days", "You buy the T-Bill at a 16% discount to face value", "The CBK charges 16% for the loan", "None of the above"],
    correct: 1,
    explanation: "T-Bills are zero-coupon instruments sold at a discount. A 16% discount rate means you pay less than face value, earning the difference at maturity."
  },
  {
    question: "Which ratio best measures a company's total return relative to investment risk?",
    options: ["P/E Ratio", "Sharpe Ratio", "Debt/Equity Ratio", "Current Ratio"],
    correct: 1,
    explanation: "The Sharpe Ratio measures risk-adjusted return: (Portfolio Return - Risk-free Rate) / Standard Deviation."
  }
];

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    "Beginner": "bg-emerald-100 text-emerald-700",
    "Intermediate": "bg-amber-100 text-amber-700",
    "Advanced": "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${colors[level] || "bg-slate-100 text-slate-600"}`}>
      {level}
    </span>
  );
}

function LessonTypeIcon({ type }: { type: string }) {
  if (type === "video") return <Video className="w-3.5 h-3.5 text-blue-500" />;
  if (type === "quiz") return <HelpCircle className="w-3.5 h-3.5 text-violet-500" />;
  return <FileText className="w-3.5 h-3.5 text-slate-400" />;
}

function ProgressRing({ progress, size = 48, stroke = 4 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={progress >= 100 ? "#10b981" : "#6366f1"}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="bold"
        fill={progress >= 100 ? "#10b981" : "#6366f1"}>
        {progress}%
      </text>
    </svg>
  );
}

// ─── QUICK QUIZ MODAL ────────────────────────────────────────────────────────
function QuickQuizModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[current];

  function handleSelect(i: number) {
    if (confirmed) return;
    setSelected(i);
  }

  function handleConfirm() {
    if (selected === null) return;
    setConfirmed(true);
    if (selected === q.correct) setScore(s => s + 1);
  }

  function handleNext() {
    if (current + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setConfirmed(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-violet-200 mb-1">
                Sentil Academy · Quick Quiz
              </p>
              <h2 className="text-xl font-black">Knowledge Check</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {!finished && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-violet-200 mb-2">
                <span>Question {current + 1} of {QUIZ_QUESTIONS.length}</span>
                <span>Score: {score}/{current}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white rounded-full h-1.5 transition-all"
                  style={{ width: `${((current) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {finished ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Quiz Complete!</h3>
              <p className="text-slate-500 text-sm mb-4">You scored <span className="font-black text-violet-600">{score}/{QUIZ_QUESTIONS.length}</span></p>
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                <p className="text-sm font-medium text-slate-600">
                  {score === QUIZ_QUESTIONS.length ? "🎉 Perfect score! You're an investing expert!" :
                    score >= 3 ? "🔥 Great work! Keep building your knowledge." :
                      "📚 Keep studying — the Sentil Academy is here to help!"}
                </p>
              </div>
              <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
                Back to Academy
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-base font-bold text-slate-900 mb-5 leading-relaxed">{q.question}</h3>
              <div className="space-y-3 mb-6">
                {q.options.map((opt, i) => {
                  let cls = "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300 hover:bg-violet-50";
                  if (confirmed) {
                    if (i === q.correct) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
                    else if (i === selected && i !== q.correct) cls = "border-red-400 bg-red-50 text-red-700";
                    else cls = "border-slate-100 bg-slate-50 text-slate-400";
                  } else if (selected === i) {
                    cls = "border-violet-500 bg-violet-50 text-violet-800";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold flex items-center gap-3 ${cls}`}
                    >
                      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                      {confirmed && i === q.correct && <CheckCircle className="w-4 h-4 ml-auto text-emerald-500" />}
                      {confirmed && i === selected && i !== q.correct && <XCircle className="w-4 h-4 ml-auto text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {confirmed && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">{q.explanation}</p>
                </div>
              )}

              <div className="flex gap-3">
                {!confirmed ? (
                  <button
                    onClick={handleConfirm}
                    disabled={selected === null}
                    className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {current + 1 >= QUIZ_QUESTIONS.length ? "See Results" : "Next Question"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── COURSE DETAIL MODAL ─────────────────────────────────────────────────────
function CourseModal({ course, onClose }: { course: typeof COURSES[0]; onClose: () => void }) {
  const [openModule, setOpenModule] = useState(0);
  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
  const doneLessons = course.modules.reduce((a, m) => a + m.lessons.filter(l => l.done).length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${course.color} p-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest">{course.category}</span>
              <LevelBadge level={course.level} />
            </div>
            <h2 className="text-2xl font-black mb-2 leading-tight">{course.title}</h2>
            <p className="text-sm text-white/80 mb-4">{course.subtitle}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-70" />{course.duration}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 opacity-70" />{totalLessons} lessons</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 opacity-70" />{course.enrolled.toLocaleString()} enrolled</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 opacity-70 fill-current" />{course.rating} ({course.reviews.toLocaleString()} reviews)</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        {course.progress > 0 && (
          <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
            <ProgressRing progress={course.progress} size={52} stroke={5} />
            <div>
              <p className="text-sm font-black text-slate-900">{doneLessons}/{totalLessons} lessons complete</p>
              <p className="text-xs text-slate-500">Keep going — you're on a roll!</p>
            </div>
            <button className="ml-auto px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 transition-colors">
              <Play className="w-3.5 h-3.5" /> Continue
            </button>
          </div>
        )}
        {course.progress === 0 && (
          <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-600">Ready to start this course?</p>
            <button className={`px-6 py-2.5 bg-gradient-to-r ${course.color} text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity`}>
              <Play className="w-3.5 h-3.5" /> Start Learning
            </button>
          </div>
        )}

        {/* Curriculum */}
        <div className="p-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Course Curriculum</h3>
          <div className="space-y-3">
            {course.modules.map((mod, mi) => (
              <div key={mi} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenModule(openModule === mi ? -1 : mi)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${mod.lessons.every(l => l.done) ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {mod.lessons.every(l => l.done) ? <Check className="w-3.5 h-3.5" /> : mi + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{mod.title}</p>
                      <p className="text-[10px] text-slate-500">{mod.lessons.length} lessons · {mod.lessons.filter(l => l.done).length}/{mod.lessons.length} done</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openModule === mi ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openModule === mi && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="divide-y divide-slate-100">
                        {mod.lessons.map((les, li) => (
                          <div key={li} className={`flex items-center gap-3 px-5 py-3.5 ${les.done ? "opacity-60" : ""}`}>
                            {les.done ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                            <LessonTypeIcon type={les.type} />
                            <span className="text-sm text-slate-700 flex-1">{les.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{les.duration}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function AcademyPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "guest" | "authenticated">("loading");
  const [activeTab, setActiveTab] = useState<"courses" | "paths" | "quiz">("courses");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(d => setAuthState(d?.authenticated ? "authenticated" : "guest"))
      .catch(() => setAuthState("guest"));
  }, []);

  const categories = ["All", "Foundations", "Fixed Income", "Equities", "Advanced Strategy", "Real Assets"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = useMemo(() => {
    return COURSES.filter(c => {
      const catMatch = selectedCategory === "All" || c.category === selectedCategory;
      const lvlMatch = selectedLevel === "All" || c.level === selectedLevel;
      const searchMatch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return catMatch && lvlMatch && searchMatch;
    });
  }, [selectedCategory, selectedLevel, searchQuery]);

  const totalProgress = Math.round(COURSES.reduce((a, c) => a + c.progress, 0) / COURSES.length);
  const completedCount = COURSES.filter(c => c.completed).length;
  const inProgressCount = COURSES.filter(c => c.progress > 0 && !c.completed).length;

  // ── Loading State ──
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center mx-auto animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Loading Academy...</p>
        </div>
      </div>
    );
  }

  // ── Auth Gate — Guest View ──
  if (authState === "guest") {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex items-center justify-center px-6">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Gate message */}
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-400/30 rounded-full">
                  <GraduationCap className="w-4 h-4 text-violet-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-violet-300">Sentill Academy</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter leading-[0.95]">
                  Master Finance.<br />
                  <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Build Real Wealth.</span>
                </h1>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                  Kenya&apos;s most comprehensive financial education platform is <span className="text-white font-black">completely free</span> — but you need to create an account to access it.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, label: "6 In-Depth Courses", color: "text-blue-400" },
                  { icon: Trophy, label: "3 Learning Paths", color: "text-amber-400" },
                  { icon: Award, label: "Completion Certificates", color: "text-violet-400" },
                  { icon: Brain, label: "Live Knowledge Quizzes", color: "text-emerald-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm font-bold text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="flex-1 flex items-center justify-center gap-3 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-violet-900/50 group"
                >
                  <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Create Free Account
                </Link>
                <Link
                  href="/auth/login"
                  className="flex-1 flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all group"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
              </div>

              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
                100% Free · No Credit Card Required · Instant Access
              </p>
            </div>

            {/* Right: Course preview cards (blurred/locked) */}
            <div className="relative">
              <div className="space-y-4">
                {COURSES.slice(0, 3).map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shrink-0`}>
                      <course.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{course.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons} lessons</span>
                        <span className="text-[10px] text-emerald-400 font-black uppercase">Free</span>
                      </div>
                    </div>
                    <Lock className="w-5 h-5 text-slate-600 shrink-0" />
                  </motion.div>
                ))}
                <div className="text-center py-4">
                  <p className="text-slate-600 text-sm font-bold">+ {COURSES.length - 3} more courses inside</p>
                </div>
              </div>
              {/* Blurred gradient at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-violet-400" />
              <span className="text-[10px] font-black tracking-widest uppercase text-violet-400">Sentil Academy · E-Learning Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              Master Finance.<br />
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Build Real Wealth.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Kenya's most comprehensive financial education platform. Learn investing, trading, bonds, and wealth management from institutional-grade courses built by the Sentil research team.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              {[
                { icon: BookOpen, label: `${COURSES.length} Courses`, val: "" },
                { icon: Users, label: "54,690 Students", val: "" },
                { icon: Trophy, label: "3 Learning Paths", val: "" },
                { icon: Award, label: "Certificates", val: "" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <item.icon className="w-4 h-4 text-violet-300" />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
              ))}
            </div>

            {/* My Progress Summary */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              {[
                { label: "Overall Progress", value: `${totalProgress}%`, color: "text-violet-400" },
                { label: "Completed", value: `${completedCount} courses`, color: "text-emerald-400" },
                { label: "In Progress", value: `${inProgressCount} courses`, color: "text-amber-400" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ─── TABS ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 mb-8 w-fit shadow-sm">
          {([
            { id: "courses", label: "All Courses", icon: BookOpen },
            { id: "paths", label: "Learning Paths", icon: Layers },
            { id: "quiz", label: "Quick Quiz", icon: Brain },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "quiz") { setShowQuiz(true); return; }
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab.id && tab.id !== "quiz" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── COURSES TAB ─────────────────────────────────────────────────── */}
        {activeTab === "courses" && (
          <>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 shadow-sm"
                />
              </div>
              {/* Category */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${selectedCategory === cat ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Level */}
              <div className="flex gap-2">
                {levels.map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${selectedLevel === lvl ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Learning Banner */}
            {inProgressCount > 0 && (
              <div className="mb-8 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-black tracking-widest uppercase text-violet-200 mb-1">Continue Where You Left Off</p>
                  <h3 className="text-xl font-black mb-1">Treasury Bills & Bonds Mastery</h3>
                  <p className="text-sm text-white/70">Module 2 · How to participate in IFB auctions</p>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressRing progress={65} size={60} stroke={5} />
                  <button className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 transition-colors whitespace-nowrap">
                    <Play className="w-4 h-4" /> Resume
                  </button>
                </div>
              </div>
            )}

            {/* Course Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedCourse(course)}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  {/* Card Top Gradient */}
                  <div className={`bg-gradient-to-br ${course.color} h-32 relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-end p-6">
                      <course.icon className="w-16 h-16 text-white/20" />
                    </div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${course.badgeColor}`}>
                        {course.badge}
                      </span>
                    </div>
                    {course.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                          className="h-1 bg-white transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${course.bgLight} ${course.textColor}`}>
                        {course.category}
                      </span>
                      <LevelBadge level={course.level} />
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1 leading-snug group-hover:text-violet-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{course.subtitle}</p>

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons} lessons</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{course.rating}</span>
                    </div>

                    {/* Progress or Enroll */}
                    {course.progress > 0 ? (
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                          <span>{course.completed ? "Completed!" : "In Progress"}</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${course.completed ? "bg-emerald-500" : "bg-indigo-500"}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{course.enrolled.toLocaleString()} students</span>
                        <button className={`px-4 py-2 bg-gradient-to-r ${course.color} text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-90 transition-opacity`}>
                          Enroll <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg">No courses found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </>
        )}

        {/* ─── LEARNING PATHS TAB ──────────────────────────────────────────── */}
        {activeTab === "paths" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Structured Learning Paths</h2>
              <p className="text-slate-500">Follow a curated sequence of courses designed to take you from beginner to expert. Complete a path to earn your Sentil Certificate.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {LEARNING_PATHS.map((path, i) => {
                const pathCourses = COURSES.filter(c => path.courses.includes(c.id));
                const avgProgress = Math.round(pathCourses.reduce((a, c) => a + c.progress, 0) / pathCourses.length);
                return (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className={`bg-gradient-to-br ${path.color} p-6 text-white`}>
                      <path.icon className="w-10 h-10 mb-3 opacity-90" />
                      <h3 className="text-xl font-black mb-1">{path.title}</h3>
                      <p className="text-sm text-white/75 leading-relaxed">{path.description}</p>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />{path.duration} total
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <BookOpen className="w-3.5 h-3.5" />{path.courses.length} courses
                        </div>
                        {path.certificate && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                            <Award className="w-3.5 h-3.5" />Certificate
                          </div>
                        )}
                      </div>

                      {/* Courses in path */}
                      <div className="space-y-2 mb-4">
                        {pathCourses.map((c, ci) => (
                          <div key={ci} className="flex items-center gap-3 text-sm">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${c.completed ? "bg-emerald-100 text-emerald-600" : c.progress > 0 ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                              {c.completed ? <Check className="w-3 h-3" /> : ci + 1}
                            </div>
                            <span className="text-slate-700 flex-1 truncate">{c.title}</span>
                            {c.completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                        ))}
                      </div>

                      <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Path Progress</span>
                        <span>{avgProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full mb-4">
                        <div className={`h-2 rounded-full bg-gradient-to-r ${path.color}`} style={{ width: `${avgProgress}%` }} />
                      </div>

                      <button className={`w-full py-3 bg-gradient-to-r ${path.color} text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}>
                        {avgProgress > 0 ? "Continue Path" : "Start Path"} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Achievements */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-500" /> Your Achievements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: BookOpen, title: "First Course", desc: "Complete your first course", unlocked: true, color: "from-blue-500 to-indigo-600" },
                  { icon: Flame, title: "On Fire", desc: "7-day learning streak", unlocked: true, color: "from-orange-500 to-red-600" },
                  { icon: Trophy, title: "Path Master", desc: "Complete a learning path", unlocked: false, color: "from-amber-500 to-yellow-600" },
                  { icon: Star, title: "Quiz Ace", desc: "Score 100% on any quiz", unlocked: false, color: "from-violet-500 to-purple-700" },
                ].map((ach, i) => (
                  <div key={i} className={`rounded-2xl p-4 text-center border-2 transition-all ${ach.unlocked ? "border-transparent shadow-md" : "border-slate-100 opacity-50 grayscale"}`}>
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${ach.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <ach.icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-sm font-black text-slate-900 mb-0.5">{ach.title}</p>
                    <p className="text-[10px] text-slate-500">{ach.desc}</p>
                    {ach.unlocked && <p className="text-[9px] text-emerald-600 font-black mt-1 uppercase tracking-widest">Unlocked!</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showQuiz && <QuickQuizModal onClose={() => setShowQuiz(false)} />}
      {selectedCourse && <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
    </div>
  );
}
