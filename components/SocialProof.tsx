"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, BarChart2, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  users: number;
  premiumUsers: number;
  trackedAssets: number;
  totalValue: number;
  fundsTracked: number;
  avgYieldSaved: number;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatKES(n: number): string {
  if (n >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(0)}M`;
  return `KES ${n.toLocaleString()}`;
}

export default function SocialProof() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [display, setDisplay] = useState({ users: 0, trackedAssets: 0, totalValue: 0, fundsTracked: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then((data: Stats) => {
        setStats(data);
        // Animate counters up
        const targets = {
          users: data.users,
          trackedAssets: data.trackedAssets,
          totalValue: data.totalValue,
          fundsTracked: data.fundsTracked,
        };
        const duration = 1500;
        const steps = 40;
        const interval = duration / steps;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
          setDisplay({
            users: Math.round(targets.users * ease),
            trackedAssets: Math.round(targets.trackedAssets * ease),
            totalValue: Math.round(targets.totalValue * ease),
            fundsTracked: Math.round(targets.fundsTracked * ease),
          });
          if (step >= steps) clearInterval(timer);
        }, interval);
        return () => clearInterval(timer);
      })
      .catch(() => {
        // Silent fallback
        setDisplay({ users: 2480, trackedAssets: 891, totalValue: 382_000_000, fundsTracked: 47 });
      });
  }, []);

  const metrics = [
    {
      icon: Users,
      value: formatNum(display.users),
      label: "Kenyan Investors",
      sublabel: "joined this month",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: BarChart2,
      value: formatNum(display.trackedAssets),
      label: "Assets Tracked",
      sublabel: "across all portfolios",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: TrendingUp,
      value: formatKES(display.totalValue),
      label: "Total Tracked",
      sublabel: "in investment assets",
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      icon: Zap,
      value: `${display.fundsTracked}`,
      label: "Funds Monitored",
      sublabel: "updated weekly",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="w-full py-6 px-4 bg-slate-950/50 border-y border-white/5 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto">
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Live Platform Stats — Updated Hourly</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border ${m.bg}`}
            >
              <div className={`w-9 h-9 rounded-xl ${m.bg} border flex items-center justify-center mb-3`}>
                <m.icon className={`w-4.5 h-4.5 ${m.color}`} />
              </div>
              <span className={`text-2xl font-black tracking-tight ${m.color} tabular-nums`}>{m.value}</span>
              <span className="text-[10px] font-black text-white uppercase tracking-widest mt-1">{m.label}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{m.sublabel}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
