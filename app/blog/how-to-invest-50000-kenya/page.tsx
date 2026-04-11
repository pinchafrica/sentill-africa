import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Invest KES 50,000 in Kenya | 5 Best Options 2026",
  description: "What to do with KES 50,000 in Kenya right now. MMFs, T-Bills, SACCOs, Bonds and NSE equities — compared with real projected returns.",
  keywords: ["how to invest 50000 in kenya", "invest 50k kenya", "best investment 50000 kenya 2026", "start investing kenya", "where to invest money kenya"],
  alternates: { canonical: "/blog/how-to-invest-50000-kenya" },
  openGraph: { title: "How to Invest KES 50,000 in Kenya — 5 Best Options", description: "Practical guide with projected returns for each investment option.", type: "article", publishedTime: "2026-04-01T00:00:00Z" },
};

const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: "How to Invest KES 50,000 in Kenya: 5 Best Options in 2026", author: { "@type": "Organization", name: "Sentill Africa Research Team" }, publisher: { "@type": "Organization", name: "Sentill Africa" }, datePublished: "2026-04-01", mainEntityOfPage: "https://sentill.africa/blog/how-to-invest-50000-kenya" };

const OPTIONS = [
  { rank:1, title:"Money Market Fund",   yield:"15.3% net", yr1:"KES 57,650",  yr3:"KES 73,600",  yr5:"KES 93,200",  min:"KES 100",    pro:"🔥 Best for liquidity",   con:"WHT reduces gross yield",   cta:"/markets/mmfs" },
  { rank:2, title:"Treasury Bill (91-Day)", yield:"13.4% net",yr1:"KES 56,700", yr3:"KES 68,400",  yr5:"KES 82,100",  min:"KES 50,000", pro:"Sovereign-backed, safest", con:"Locked till maturity",      cta:"/markets/treasuries" },
  { rank:3, title:"Infrastructure Bond",yield:"17.5% net",   yr1:"KES 58,750", yr3:"KES 81,800",  yr5:"KES 113,600", min:"KES 3,000",  pro:"🏆 Tax-FREE returns",       con:"Multi-year commitment",     cta:"/markets/bonds" },
  { rank:4, title:"SACCO Shares",       yield:"16.5% total", yr1:"KES 58,250", yr3:"KES 79,100",  yr5:"KES 107,500", min:"Varies",     pro:"Loan access (3× shares)",  con:"Sector eligibility needed", cta:"/markets/saccos" },
  { rank:5, title:"NSE Equities",       yield:"Variable",    yr1:"Varies",     yr3:"Varies",       yr5:"Varies",      min:"KES 100",    pro:"Capital gains potential",  con:"High volatility risk",      cta:"/markets/nse" },
];

export default function Invest50KPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="min-h-screen bg-white">
        <div className="bg-slate-950 pt-44 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(239,68,68,0.1),_transparent_60%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-400 transition-colors">Research Hub</Link>
              <span className="text-slate-700">›</span>
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Beginner</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">How to Invest KES 50,000 in Kenya:<br />5 Best Options in 2026</h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">From MMFs to T-Bills — what actually makes sense at this capital level, with projected returns for each.</p>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Sentill Research</span><span>·</span><span>April 2026</span><span>·</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />5 min read</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-10">
            <h2 className="text-xs font-black text-rose-800 uppercase tracking-widest mb-3">💡 The Optimal Split for KES 50,000</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[{label:"Money Market Fund",amount:"KES 20,000",pct:"40%",color:"bg-emerald-100 border-emerald-200"},{label:"Infrastructure Bond",amount:"KES 20,000",pct:"40%",color:"bg-blue-100 border-blue-200"},{label:"SACCO/T-Bill",amount:"KES 10,000",pct:"20%",color:"bg-amber-100 border-amber-200"}].map((c,i)=>(
                <div key={i} className={`${c.color} border rounded-xl p-3`}>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">{c.label}</p>
                  <p className="font-black text-slate-900 text-sm">{c.amount}</p>
                  <p className="text-[10px] font-bold text-slate-500">{c.pct}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-700 font-medium mt-3 text-center">This split gives you liquidity (MMF), maximum yield (IFB), and growth potential (SACCO)</p>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">Before You Invest: 3 Questions to Answer</h2>
          {["When will you need this money? If within 12 months, use an MMF or T-Bill. If 3+ years away, bonds are far better.","Do you have an emergency fund? Never invest money you'd need urgently. Keep 3 months of expenses in an MMF first.","What's your risk tolerance? Government securities (T-Bills, IFBs) are near-zero risk. NSE equities can drop 30% in a bad year."].map((q,i)=>(
            <div key={i} className="mb-3 p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</span>
              <span className="text-sm font-medium text-slate-600">{q}</span>
            </div>
          ))}

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-6">5 Best Places for Your KES 50,000</h2>
          <div className="space-y-5">
            {OPTIONS.map((opt) => (
              <div key={opt.rank} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-[11px] font-black flex items-center justify-center">{opt.rank}</span>
                    <h3 className="font-black text-slate-900">{opt.title}</h3>
                  </div>
                  <span className="text-sm font-black text-emerald-600">{opt.yield}</span>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    {[{label:"1 Year",val:opt.yr1},{label:"3 Years",val:opt.yr3},{label:"5 Years",val:opt.yr5}].map((p,i)=>(
                      <div key={i} className="bg-slate-50 rounded-xl p-3"><p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{p.label}</p><p className="font-black text-slate-900 text-sm">{p.val}</p></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2"><span className="text-emerald-500 font-black">✓</span><span className="text-slate-600 font-medium">{opt.pro}</span></div>
                    <div className="flex items-start gap-2"><span className="text-rose-400 font-black">✗</span><span className="text-slate-600 font-medium">{opt.con}</span></div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min: {opt.min}</span>
                    <Link href={opt.cta} className="flex items-center gap-1 text-[10px] font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest transition-colors">View Rates <ArrowRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">What KES 50,000 Becomes Over 5 Years</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="bg-slate-900 text-white">{["Investment","Net Yield","Year 1","Year 3","Year 5"].map(h=><th key={h} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{OPTIONS.filter(o=>o.yr5!=="Varies").map((o,i)=><tr key={i} className={`border-b border-slate-100 ${i===2?"bg-emerald-50 font-black":""}`}><td className={`px-4 py-3 font-bold text-slate-900`}>{o.title} {i===2&&<span className="text-[8px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-2">Best Return</span>}</td><td className={`px-4 py-3 font-bold ${i===2?"text-emerald-700":"text-slate-600"}`}>{o.yield}</td><td className="px-4 py-3 text-slate-600">{o.yr1}</td><td className="px-4 py-3 text-slate-600">{o.yr3}</td><td className={`px-4 py-3 font-bold ${i===2?"text-emerald-700":"text-slate-600"}`}>{o.yr5}</td></tr>)}</tbody>
            </table>
            <p className="text-[10px] text-slate-400 mt-2">Projections assume annual compounding and consistent rates. Past rates may differ from future rates.</p>
          </div>

          <div className="bg-slate-950 rounded-3xl p-8 mt-10">
            <h3 className="text-white font-black text-xl mb-2">Build your own projection</h3>
            <p className="text-slate-400 text-sm mb-5">Use the Sentill Goal Planner to enter your own target and see exactly how much to save monthly across all asset types.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/tools/goal-planner" className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Goal Planner <ArrowRight className="w-3.5 h-3.5" /></Link>
              <Link href="/tools/compare" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Compare Funds</Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Related Articles</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{href:"/blog/best-money-market-funds-kenya-2026",label:"Best MMFs in Kenya 2026"},{href:"/blog/best-saccos-kenya-2026",label:"Best SACCOs in Kenya 2026"}].map((r,i)=>(
                <Link key={i} href={r.href} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all group">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-rose-700">{r.label}</span><ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
