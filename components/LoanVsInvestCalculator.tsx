"use client";

import { useState, useMemo } from "react";
import { Scale, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

export default function LoanVsInvestCalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanRate, setLoanRate] = useState(14.0);
  const [loanTerm, setLoanTerm] = useState(36);
  const [investRate, setInvestRate] = useState(17.5);
  const [extraCash, setExtraCash] = useState(50000);

  const results = useMemo(() => {
    const loanMonthlyRate = loanRate / 100 / 12;
    const investMonthlyRate = investRate / 100 / 12;

    // Scenario A: Pay off loan faster with extra cash
    let loanBalanceA = loanAmount;
    const monthlyPayment =
      (loanAmount * loanMonthlyRate * Math.pow(1 + loanMonthlyRate, loanTerm)) /
      (Math.pow(1 + loanMonthlyRate, loanTerm) - 1);
    let totalPaidA = 0;
    let monthsToPayA = 0;

    let tempBalance = loanAmount;
    for (let m = 1; m <= loanTerm * 2; m++) {
      const interest = tempBalance * loanMonthlyRate;
      const payment = monthlyPayment + extraCash;
      tempBalance = tempBalance + interest - payment;
      totalPaidA += payment;
      monthsToPayA = m;
      if (tempBalance <= 0) {
        totalPaidA += tempBalance; // adjust for overpayment
        break;
      }
    }
    const interestSavedA = monthlyPayment * loanTerm - totalPaidA;

    // Scenario B: Minimum loan payments + invest extra cash
    let investBalance = 0;
    let totalLoanPaidB = 0;

    for (let m = 1; m <= loanTerm; m++) {
      totalLoanPaidB += monthlyPayment;
      investBalance = (investBalance + extraCash) * (1 + investMonthlyRate);
    }

    const totalLoanInterestB = totalLoanPaidB - loanAmount;
    const investReturns = Math.round(investBalance - extraCash * loanTerm);
    const netGainB = investReturns - 0;
    const netGainA = interestSavedA;

    const bestOption = investReturns > interestSavedA ? "invest" : "payoff";
    const advantage = Math.abs(investReturns - interestSavedA);

    return {
      monthlyPayment: Math.round(monthlyPayment),
      payoffMonths: monthsToPayA,
      interestSaved: Math.round(Math.max(0, interestSavedA)),
      investBalance: Math.round(investBalance),
      investReturns: Math.round(investReturns),
      totalLoanInterest: Math.round(totalLoanInterestB),
      bestOption,
      advantage: Math.round(advantage),
    };
  }, [loanAmount, loanRate, loanTerm, investRate, extraCash]);

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Loan Balance (KES)</label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Loan Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={loanRate}
            onChange={(e) => setLoanRate(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Loan Term (Months)</label>
          <input
            type="number"
            min={1}
            max={360}
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Invest Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={investRate}
            onChange={(e) => setInvestRate(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Extra Monthly (KES)</label>
          <input
            type="number"
            value={extraCash}
            onChange={(e) => setExtraCash(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Verdict Banner */}
      <div className={`p-6 rounded-2xl border-2 flex items-center gap-4 ${
        results.bestOption === "invest"
          ? "bg-emerald-50 border-emerald-300"
          : "bg-blue-50 border-blue-300"
      }`}>
        {results.bestOption === "invest" ? (
          <TrendingUp className="w-8 h-8 text-emerald-600 shrink-0" />
        ) : (
          <Scale className="w-8 h-8 text-blue-600 shrink-0" />
        )}
        <div>
          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
            {results.bestOption === "invest"
              ? "Investing the extra cash wins!"
              : "Paying off the loan faster wins!"}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            You gain KES {results.advantage.toLocaleString()} more by{" "}
            {results.bestOption === "invest" ? "investing at " + investRate + "%" : "eliminating debt faster"}
          </p>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option A: Pay Off Loan */}
        <div className={`p-6 rounded-2xl border-2 ${results.bestOption === "payoff" ? "border-emerald-500" : "border-slate-200"}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase">Pay Off Loan Faster</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Accelerated Repayment</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Monthly Payment</span>
              <span className="text-slate-900">KES {(results.monthlyPayment + extraCash).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Paid Off In</span>
              <span className="text-slate-900">{results.payoffMonths} months</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Interest Saved</span>
              <span className="text-emerald-600">KES {results.interestSaved.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Option B: Invest */}
        <div className={`p-6 rounded-2xl border-2 ${results.bestOption === "invest" ? "border-emerald-500" : "border-slate-200"}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase">Invest Extra Cash</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Min Loan Payment + Invest</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Loan Payment</span>
              <span className="text-slate-900">KES {results.monthlyPayment.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Investment Balance</span>
              <span className="text-slate-900">KES {results.investBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Investment Returns</span>
              <span className="text-emerald-600">KES {results.investReturns.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Loan Interest Cost</span>
              <span className="text-rose-500">-KES {results.totalLoanInterest.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        This is a simplified model for informational purposes only. Consult a licensed financial advisor before making decisions.
      </div>
    </div>
  );
}
