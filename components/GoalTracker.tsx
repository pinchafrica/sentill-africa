"use client";

import { Target, Plus, CheckCircle2, TrendingUp } from "lucide-react";

interface Goal {
  title: string;
  targetAmount: number;
  currentAmount: number;
}

export default function GoalTracker({ goals }: { goals: Goal[] }) {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">Financial Goals</h4>
        <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {goals.map((goal, i) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-900 uppercase">{goal.title}</span>
                 </div>
                 <span className="text-[10px] font-black text-blue-700 uppercase">
                    KES {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                 </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                {progress.toFixed(1)}% of goal reached
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-4">
        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start gap-4">
           <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
           <div>
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Growth Forecast</p>
              <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest mt-1">
                At your current contribution rate, you will reach "Home Deposit" in 14 months.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
