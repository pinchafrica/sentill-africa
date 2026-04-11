import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "MMF vs Bonds in Kenya 2026: Which Gives Better Returns?",
  description: "Data-driven comparison of Money Market Funds vs Government Bonds in Kenya. Yield, liquidity, tax treatment and risk — which should you choose?",
  keywords: ["MMF vs bonds kenya", "money market fund vs infrastructure bond", "IFB kenya 2026", "best investment kenya bonds mmf", "tax free bonds kenya"],
  alternates: { canonical: "/blog/mmf-vs-bonds-kenya" },
  openGraph: { title: "MMF vs Bonds Kenya 2026 — Which Pays More?", description: "We compare yields, liquidity and tax treatment side by side.", type: "article", publishedTime: "2026-04-01T00:00:00Z" },
};

const jsonLd = {
  "@context": "https://schema.org", "@type": "Article",
  headline: "MMF vs Bonds in Kenya: Which Gives Better Returns?",
  author: { "@type": "Organization", name: "Sentill Africa Research Team" },
  publisher: { "@type": "Organization", name: "Sentill Africa" },
  datePublished: "2026-04-01", mainEntityOfPage: "https://sentill.africa/blog/mmf-vs-bonds-kenya",
};

export default function MMFvsBondsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="min-h-screen bg-white">
        <div className="bg-slate-950 pt-44 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.12),_transparent_60%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-violet-400 transition-colors">Research Hub</Link>
              <span className="text-slate-700">›</span>
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Comparison</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">MMF vs Bonds in Kenya:<br />Which Gives Better Returns?</h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-6">A data-driven comparison of yield, liquidity, tax treatment and risk — with a clear recommendation for each investor type.</p>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Sentill Research</span><span>·</span><span>April 2026</span><span>·</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />7 min read</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mb-10">
            <h2 className="text-xs font-black text-violet-800 uppercase tracking-widest mb-3">📌 Short Answer</h2>
            <ul className="space-y-2">
              {["Infrastructure Bonds (IFBs) win on yield + tax — up to 17.5% TAX-FREE", "MMFs win on liquidity — access your money in 24 hours vs months for bonds", "For long-term savings: IFB Bonds. For active/emergency funds: MMF", "Combining both is the optimal strategy for most Kenyan investors"].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-violet-800 font-medium"><CheckCircle className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">The Core Difference</h2>
          <p className="text-slate-600 leading-relaxed mb-6">An MMF gives you daily liquidity — your money is essentially like a high-yield savings account. A bond locks your money for 2–7 years but pays a fixed (often higher) rate. The right choice depends entirely on <strong>when you'll need the money</strong> and <strong>how much tax you pay</strong>.</p>

          {/* Side-by-side */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              { title: "💰 Money Market Fund", color: "border-emerald-300 bg-emerald-50", h: "text-emerald-900", items: ["Yield: 14–18% gross (11.9–15.3% net)", "Tax: 15% WHT deducted at source", "Liquidity: T+1 (within 24 hours)", "Minimum: KES 100–5,000", "Duration: No lock-in", "Best for: Emergency fund, parking cash"] },
              { title: "🏛 Infrastructure Bond (IFB)", color: "border-blue-300 bg-blue-50", h: "text-blue-900", items: ["Yield: 17–18% gross — TAX FREE", "Tax: 0% WHT (tax-exempt)", "Liquidity: NSE secondary market only", "Minimum: KES 3,000", "Duration: 5–25 years coupon, tradeable", "Best for: Long-term wealth building"] },
            ].map((card, i) => (
              <div key={i} className={`border-2 ${card.color} rounded-2xl p-6`}>
                <h3 className={`font-black text-lg mb-4 ${card.h}`}>{card.title}</h3>
                <ul className="space-y-2">{card.items.map((item, j) => <li key={j} className="text-sm text-slate-700 font-medium flex items-start gap-2"><span className="text-slate-400">•</span>{item}</li>)}</ul>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">The Tax Advantage of Infrastructure Bonds</h2>
          <p className="text-slate-600 leading-relaxed mb-4">This is where bonds become dramatically more attractive — especially for higher-income investors. IFBs are <strong>exempt from Withholding Tax</strong> under the Income Tax Act. This means:</p>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">
            <div className="bg-slate-900 px-6 py-4"><p className="text-white font-black text-sm">KES 1,000,000 invested for 5 years</p></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100 bg-slate-50">{["", "MMF (17.5% gross)", "IFB Bond (17.5% gross)"].map(h=><th key={h} className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-500">{h}</th>)}</tr></thead>
                <tbody>
                  {[["Gross Annual Return","KES 175,000","KES 175,000"],["Tax (15% WHT)","− KES 26,250","KES 0 ✓"],["Net Annual Return","KES 148,750","KES 175,000"],["5-Year Compounded","KES 2,059,000","KES 2,192,000"],["Tax Alpha","—","+ KES 133,000 more"]].map(([label,a,b],i)=>(
                    <tr key={i} className={`border-b border-slate-100 ${i===4?"bg-emerald-50 font-black":""}`}>
                      <td className="px-6 py-3 font-bold text-slate-700">{label}</td>
                      <td className="px-6 py-3 text-slate-600">{a}</td>
                      <td className={`px-6 py-3 ${i===4?"text-emerald-700 font-black":"text-blue-700 font-bold"}`}>{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">Who Should Choose What</h2>
          {[
            { who: "Emergency Fund / Saving for a goal < 1 year", pick: "MMF", why: "You need access to your money without penalty. An MMF returning 15% net is far better than a savings account." },
            { who: "Long-term wealth building (3+ years)", pick: "IFB Bond", why: "Tax-free compounding over 5+ years creates significantly more wealth. Lock away money you won't need." },
            { who: "The optimal strategy", pick: "Both — 60% MMF, 40% Bond", why: "Keep emergency/active money in an MMF. Allocate long-term savings to IFBs for maximum after-tax return." },
          ].map((item, i) => (
            <div key={i} className="mb-4 p-5 bg-white border border-slate-200 rounded-2xl flex items-start gap-4">
              <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${item.pick.includes("Both") ? "bg-violet-100 text-violet-700" : item.pick === "MMF" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>→ {item.pick}</div>
              <div><p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{item.who}</p><p className="text-sm text-slate-600 leading-relaxed">{item.why}</p></div>
            </div>
          ))}

          <div className="bg-slate-950 rounded-3xl p-8 mt-10">
            <h3 className="text-white font-black text-xl mb-2">Use the Tax Alpha Calculator</h3>
            <p className="text-slate-400 text-sm mb-5">See exactly how much more you'd earn in an IFB vs MMF with our interactive tool — enter your own numbers.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/tools/tax-calculator" className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Tax Alpha Tool <ArrowRight className="w-3.5 h-3.5" /></Link>
              <Link href="/markets/bonds" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Live Bond Yields</Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Related Articles</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{href:"/blog/best-money-market-funds-kenya-2026",label:"Best MMFs in Kenya 2026"},{href:"/blog/treasury-bills-kenya-guide",label:"How to Buy Treasury Bills in Kenya"}].map((r,i)=>(
                <Link key={i} href={r.href} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 rounded-xl transition-all group">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-violet-700">{r.label}</span><ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
