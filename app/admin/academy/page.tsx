"use client";

import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Users, Trophy, Star, Clock,
  TrendingUp, BarChart2, Shield, DollarSign, PieChart, Building2,
  CheckCircle, Play, Award, Zap, Target
} from "lucide-react";
import Link from "next/link";

// Static course data mirroring the Academy page data
const COURSE_STATS = [
  {
    id: "investing-101",
    title: "Investing 101: Kenya Edition",
    category: "Foundations",
    level: "Beginner",
    enrolled: 12840,
    rating: 4.9,
    lessons: 18,
    duration: "4h 30m",
    completionRate: 72,
    color: "from-blue-600 to-indigo-700",
    icon: BookOpen,
    badge: "Most Popular",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "tbills-mastery",
    title: "Treasury Bills & Bonds Mastery",
    category: "Fixed Income",
    level: "Intermediate",
    enrolled: 8920,
    rating: 4.8,
    lessons: 24,
    duration: "6h 15m",
    completionRate: 58,
    color: "from-emerald-500 to-teal-600",
    icon: Shield,
    badge: "Staff Pick",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "nse-stock-trading",
    title: "NSE Stock Trading Masterclass",
    category: "Equities",
    level: "Intermediate",
    enrolled: 6540,
    rating: 4.7,
    lessons: 32,
    duration: "8h 45m",
    completionRate: 44,
    color: "from-orange-500 to-red-600",
    icon: BarChart2,
    badge: "New",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    id: "mmf-deep-dive",
    title: "Money Market Funds: Complete Guide",
    category: "Fixed Income",
    level: "Beginner",
    enrolled: 15200,
    rating: 4.9,
    lessons: 14,
    duration: "3h 20m",
    completionRate: 81,
    color: "from-violet-500 to-purple-700",
    icon: DollarSign,
    badge: "Best Rated",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    id: "portfolio-construction",
    title: "Portfolio Construction & Risk Management",
    category: "Advanced Strategy",
    level: "Advanced",
    enrolled: 3890,
    rating: 4.8,
    lessons: 38,
    duration: "10h 00m",
    completionRate: 33,
    color: "from-slate-700 to-slate-900",
    icon: PieChart,
    badge: "Pro",
    badgeColor: "bg-slate-900 text-white",
  },
  {
    id: "real-estate-kenya",
    title: "Real Estate Investment in Kenya",
    category: "Real Assets",
    level: "Intermediate",
    enrolled: 7300,
    rating: 4.6,
    lessons: 20,
    duration: "5h 30m",
    completionRate: 51,
    color: "from-amber-500 to-yellow-600",
    icon: Building2,
    badge: "Trending",
    badgeColor: "bg-amber-100 text-amber-700",
  },
];

const totalEnrolled = COURSE_STATS.reduce((a, c) => a + c.enrolled, 0);
const avgRating = (COURSE_STATS.reduce((a, c) => a + c.rating, 0) / COURSE_STATS.length).toFixed(1);
const avgCompletion = Math.round(COURSE_STATS.reduce((a, c) => a + c.completionRate, 0) / COURSE_STATS.length);
const totalLessons = COURSE_STATS.reduce((a, c) => a + c.lessons, 0);

export default function AdminAcademyPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Academy Management</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-Learning Platform Overview</p>
            </div>
          </div>
        </div>
        <Link
          href="/academy"
          target="_blank"
          className="flex items-center gap-2 px-5 py-3 bg-violet-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg"
        >
          <Play className="w-4 h-4" /> View Live Academy
        </Link>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Enrolled", value: totalEnrolled.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Avg. Rating", value: `${avgRating} / 5.0`, icon: Star, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Avg. Completion", value: `${avgCompletion}%`, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Total Lessons", value: totalLessons.toString(), icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white border ${kpi.border} rounded-3xl p-6 shadow-sm`}
          >
            <div className={`w-10 h-10 rounded-2xl ${kpi.bg} flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Course Performance Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Course Performance</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">All {COURSE_STATS.length} active courses</p>
          </div>
          <span className="text-[10px] font-black px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 uppercase tracking-widest">
            All Free
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {COURSE_STATS.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="flex flex-col md:flex-row md:items-center gap-4 px-8 py-5 hover:bg-slate-50/50 transition-colors"
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <course.icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{course.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${course.badgeColor}`}>{course.badge}</span>
                    <span className="text-[10px] text-slate-400">{course.level} · {course.category}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 shrink-0">
                <div className="text-center">
                  <p className="text-base font-black text-slate-900">{course.enrolled.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrolled</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{course.rating}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-slate-900">{course.lessons}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lessons</p>
                </div>
                <div className="text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`text-sm font-black ${course.completionRate >= 70 ? "text-emerald-600" : course.completionRate >= 50 ? "text-amber-500" : "text-slate-600"}`}>
                      {course.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${course.completionRate >= 70 ? "bg-emerald-500" : course.completionRate >= 50 ? "bg-amber-400" : "bg-slate-400"}`}
                      style={{ width: `${course.completionRate}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Completion</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Paths Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: "Wealth Builder Path", courses: 4, duration: "24h", avgProgress: 42, color: "from-blue-600 to-violet-700", icon: Trophy },
          { title: "Fixed Income Expert", courses: 3, duration: "14h", avgProgress: 67, color: "from-emerald-500 to-teal-700", icon: Shield },
          { title: "NSE Equity Trader", courses: 2, duration: "13h", avgProgress: 55, color: "from-orange-500 to-red-600", icon: BarChart2 },
        ].map((path, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm"
          >
            <div className={`bg-gradient-to-br ${path.color} p-5 text-white`}>
              <path.icon className="w-8 h-8 mb-2 opacity-90" />
              <h3 className="font-black text-base">{path.title}</h3>
              <p className="text-white/70 text-[11px] mt-1">{path.courses} courses · {path.duration} total</p>
            </div>
            <div className="p-5">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                <span>Avg. User Progress</span>
                <span>{path.avgProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className={`h-2 rounded-full bg-gradient-to-r ${path.color}`} style={{ width: `${path.avgProgress}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Academy Status</p>
          <h3 className="text-xl font-black text-white">All Content is Live & Free</h3>
          <p className="text-slate-400 text-sm mt-1">Users must register to access courses. No payment required.</p>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-2 px-5 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl text-[11px] font-black uppercase tracking-widest">
            <Zap className="w-4 h-4" /> 6 Courses Live
          </span>
          <span className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">
            <Award className="w-4 h-4" /> Certs Enabled
          </span>
        </div>
      </div>
    </div>
  );
}
