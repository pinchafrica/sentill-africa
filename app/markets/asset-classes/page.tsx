import { ShieldCheck, TrendingUp, Zap, Landmark, ArrowRight, Info } from "lucide-react";
import Link from "next/link";

const assets = [
  {
    title: "Money Market Funds (MMFs)",
    desc: "The gold standard for low-risk, high-liquidity wealth growth in Kenya. Regulated by the CMA.",
    yield: "15% - 18%",
    risk: "Low",
    min: "KES 100",
    icon: TrendingUp,
    details: [
      "Daily interest computation",
      "Compounded monthly",
      "Immediate accessibility (24-48hrs)",
      "Regulated by CMA"
    ]
  },
  {
    title: "Government Bonds (IFB)",
    desc: "Lend money to the government for infrastructure projects. Zero withholding tax.",
    yield: "14% - 18.5%",
    risk: "Low",
    min: "KES 50,000",
    icon: ShieldCheck,
    details: [
      "Completely Tax-Free",
      "Bi-annual coupon payments",
      "Secondary market liquidity",
      "Capital preservation guarantee"
    ]
  },
  {
    title: "NSE Equities",
    desc: "Own a piece of Kenya's corporate giants like Safaricom, EABL, and Equity Bank.",
    yield: "8% - 12% (Dividends)",
    risk: "High",
    min: "100 Shares",
    icon: Zap,
    details: [
      "Capital gains potential",
      "Cash dividend income",
      "Shareholder voting rights",
      "Regulated by Nairobi Securities Exchange"
    ]
  },
  {
    title: "Regulated SACCOs",
    desc: "Cooperative wealth building with soft loans and high yearly dividends.",
    yield: "12% - 16%",
    risk: "Moderate",
    min: "Monthly Deposits",
    icon: Landmark,
    details: [
      "High dividend payouts",
      "Access to multiplier loans",
      "Regulated by SASRA",
      "Social-financial empowerment"
    ]
  }
];

export default function AssetClassesPage() {
  return (
    <div className="min-h-screen py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em]">
                 <Info className="w-3.5 h-3.5" /> Educational Intelligence
              </div>
              <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] font-heading">
                Asset <br /> <span className="text-slate-200">Universe.</span>
              </h1>
              <p className="text-lg text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Understanding where to put your money is the first step to financial freedom in the 254. Specialized institutional data for the Kenyan markets.
              </p>
           </div>
           
           <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-[3.5rem] blur-3xl -z-10" />
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border border-slate-100 shadow-2xl relative">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt="African Institutional Asset Mastery"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-12 left-12 right-12">
                     <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Portfolio Strategy</span>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tight font-heading leading-none">Capital <br /> Intelligence.</h3>
                  </div>
              </div>
           </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {assets.map((asset, i) => (
            <div key={i} className="glass-card p-12 rounded-[3.5rem] relative group border-slate-800/50 hover:border-emerald-500/30 transition-all">
               <div className="absolute top-12 right-12 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
               
               <div className="space-y-8">
                 <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] flex items-center justify-center ring-1 ring-slate-800 group-hover:ring-emerald-500/50 transition-all">
                    <asset.icon className="w-8 h-8 text-emerald-500" />
                 </div>
                 
                 <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">{asset.title}</h3>
                    <p className="text-base text-slate-400 font-medium leading-relaxed tracking-wide">{asset.desc}</p>
                 </div>

                 <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-800/50">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Yield Range</span>
                       <span className="text-sm font-black text-emerald-500 uppercase tracking-tighter">{asset.yield}</span>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Risk Profile</span>
                       <span className="text-sm font-black text-white uppercase tracking-tighter">{asset.risk}</span>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Entry Point</span>
                       <span className="text-sm font-black text-white uppercase tracking-tighter">{asset.min}</span>
                    </div>
                 </div>

                 <ul className="space-y-3">
                   {asset.details.map((d, j) => (
                     <li key={j} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{d}</span>
                     </li>
                   ))}
                 </ul>

                 <Link href="/markets/providers" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-white transition-colors pt-4">
                   View Regulated Providers <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-0 rounded-[4rem] lg:rounded-[5rem] bg-slate-900 border border-slate-800 text-center relative overflow-hidden min-h-[500px] flex items-center justify-center">
           <img 
             src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
             className="absolute inset-0 w-full h-full object-cover opacity-20"
             alt="African Corporate Execution"
           />
           <div className="relative z-10 space-y-10 px-12">
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-none font-heading">Ready to <br /><span className="text-emerald-500">Scale?</span></h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em] max-w-xl mx-auto">Access verified institutional data and real-time yield benchmarking today.</p>
              <Link href="/markets/providers" className="inline-flex px-12 py-6 bg-white text-slate-950 font-black rounded-3xl text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all shadow-2xl">
                Open Live Registry
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
}
