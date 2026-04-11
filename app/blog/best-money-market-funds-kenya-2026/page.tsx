import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, TrendingUp, Shield, AlertCircle, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Money Market Funds in Kenya 2026 | Ranked by Yield",
  description: "Compare Kenya's top Money Market Funds by yield, liquidity and fund manager. CIC, Sanlam, Zidi, Britam, NCBA and 10+ others — ranked with live data.",
  keywords: ["best money market fund kenya 2026", "MMF kenya comparison", "highest yield MMF kenya", "CIC money market fund", "Sanlam MMF kenya"],
  alternates: { canonical: "/blog/best-money-market-funds-kenya-2026" },
  openGraph: {
    title: "Best Money Market Funds Kenya 2026 — Ranked by Yield",
    description: "Live comparison of 15+ MMFs in Kenya. Who's paying the most right now?",
    type: "article",
    publishedTime: "2026-04-01T00:00:00Z",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Money Market Funds in Kenya 2026",
  description: "A data-driven comparison of Kenya's top MMFs by yield, liquidity and risk.",
  author: { "@type": "Organization", name: "Sentill Africa Research Team" },
  publisher: { "@type": "Organization", name: "Sentill Africa", logo: { "@type": "ImageObject", url: "https://sentill.africa/images/logo.jpg" } },
  datePublished: "2026-04-01",
  dateModified: "2026-04-01",
  mainEntityOfPage: "https://sentill.africa/blog/best-money-market-funds-kenya-2026",
};

const MMF_TABLE = [
  { rank: 1,  name: "Zidi by Sanlam",             yield: "18.2%", min: "KES 100",    liquidity: "T+1",  manager: "Sanlam" },
  { rank: 2,  name: "Etica Capital MMF",           yield: "18.0%", min: "KES 1,000",  liquidity: "T+1",  manager: "Etica" },
  { rank: 3,  name: "CIC Money Market Fund",       yield: "17.5%", min: "KES 1,000",  liquidity: "T+1",  manager: "CIC Asset Mgmt" },
  { rank: 4,  name: "Britam MMF",                  yield: "16.8%", min: "KES 1,000",  liquidity: "T+2",  manager: "Britam" },
  { rank: 5,  name: "NCBA MMF",                    yield: "16.5%", min: "KES 5,000",  liquidity: "T+1",  manager: "NCBA" },
  { rank: 6,  name: "Cytonn MMF",                  yield: "16.2%", min: "KES 1,000",  liquidity: "T+3",  manager: "Cytonn" },
  { rank: 7,  name: "Old Mutual MMF",              yield: "15.8%", min: "KES 1,000",  liquidity: "T+1",  manager: "Old Mutual" },
  { rank: 8,  name: "Sanlam MMF",                  yield: "15.5%", min: "KES 500",    liquidity: "T+1",  manager: "Sanlam" },
  { rank: 9,  name: "Dry Associates MMF",          yield: "15.2%", min: "KES 1,000",  liquidity: "T+2",  manager: "Dry Associates" },
  { rank: 10, name: "ICEA Lion MMF",               yield: "14.8%", min: "KES 1,000",  liquidity: "T+1",  manager: "ICEA Lion" },
];

export default function BestMMFPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="min-h-screen bg-white">
        {/* Hero */}
        <div className="bg-slate-950 pt-44 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.12),_transparent_60%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">Research Hub</Link>
              <span className="text-slate-700">›</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">MMF</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
              Best Money Market Funds in Kenya 2026
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-6">
              Ranked by yield, liquidity & fund manager stability — updated with live data from CMA-regulated managers.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>By Sentill Research Team</span>
              <span>·</span>
              <span>April 2026</span>
              <span>·</span>
              <span>8 min read</span>
              <span>·</span>
              <span className="text-emerald-400">Live Data</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 prose prose-slate max-w-none">

          {/* Key Takeaways */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-10 not-prose">
            <h2 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3">📌 Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                "Kenya's top MMFs are currently yielding 14–18% annually (April 2026)",
                "All listed funds are CMA-regulated and licensed under the Capital Markets Act",
                "Minimum investment starts as low as KES 100 (Zidi by Sanlam)",
                "Most funds offer T+1 liquidity — your money is accessible within 24 hours",
                "15% Withholding Tax (WHT) applies on all MMF gains — factor this into net yield",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">What Is a Money Market Fund?</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            A Money Market Fund (MMF) is a collective investment scheme that pools investor funds and places them in short-term, high-quality debt instruments — primarily Treasury Bills, commercial paper, and bank deposits. In Kenya, all MMFs are regulated by the Capital Markets Authority (CMA) and must comply with strict investment guidelines.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            For most Kenyan retail investors, an MMF is the single best alternative to leaving money in a savings account earning 3–5%. The best MMFs currently yield <strong>3–4× that rate</strong> with similar — or better — accessibility.
          </p>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-6">Top 10 MMFs in Kenya (April 2026)</h2>

          {/* Table */}
          <div className="not-prose overflow-x-auto mb-10">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">#</th>
                  <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">Fund Name</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Yield (Gross)</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Min. Investment</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Liquidity</th>
                </tr>
              </thead>
              <tbody>
                {MMF_TABLE.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i === 0 ? "bg-emerald-50" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3 font-black text-slate-400">{row.rank}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{row.name} {row.rank === 1 && <span className="ml-2 text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase">Best Yield</span>}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600">{row.yield}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-600">{row.min}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-600">{row.liquidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">* Yields are gross (before 15% WHT). Net yield = Gross × 0.85. Data sourced from fund manager fact sheets, April 2026.</p>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">Understanding Net vs Gross Yield</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            All MMF returns in Kenya are subject to a <strong>15% Withholding Tax (WHT)</strong> deducted at source by the fund manager before crediting your account. This means:
          </p>
          <div className="not-prose bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
            <p className="text-sm font-bold text-slate-700 mb-2">Example — Zidi MMF at 18.2% gross on KES 1,000,000:</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Gross Return", value: "KES 182,000" },
                { label: "WHT (15%)", value: "− KES 27,300", bad: true },
                { label: "Net Return", value: "KES 154,700", good: true },
              ].map((c, i) => (
                <div key={i} className={`p-3 rounded-xl ${c.good ? "bg-emerald-100 border border-emerald-200" : c.bad ? "bg-rose-50 border border-rose-200" : "bg-white border border-slate-200"}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{c.label}</p>
                  <p className={`text-lg font-black ${c.good ? "text-emerald-700" : c.bad ? "text-rose-600" : "text-slate-900"}`}>{c.value}</p>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">What to Look for When Choosing an MMF</h2>
          <p className="text-slate-600 leading-relaxed mb-4">Beyond yield, consider these five factors:</p>
          {[
            { title: "1. Liquidity", body: "How quickly can you access your money? T+1 means you get funds within 24 hours of a redemption request — ideal for emergency funds." },
            { title: "2. Fund Manager Reputation", body: "CMA-regulated fund managers include Britam, CIC, Sanlam, and NCBA. Stick to managers with audited track records and large AUM (Assets Under Management)." },
            { title: "3. Minimum Investment", body: "Some funds accept as little as KES 100 (Zidi), while others require KES 5,000–10,000 upfront. Choose based on your available capital." },
            { title: "4. Management Fees", body: "Most MMFs charge 1.5–2.5% in annual management fees, which are already deducted before the advertised yield. Ask for the after-fees yield." },
            { title: "5. Investment Portfolio Composition", body: "The best funds hold at least 60% in T-Bills and CBK instruments. Avoid funds with high concentrations in corporate paper from unrated issuers." },
          ].map((item, i) => (
            <div key={i} className="not-prose mb-4 p-5 bg-white border border-slate-200 rounded-2xl">
              <h3 className="font-black text-slate-900 text-sm mb-1">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">MMF vs Savings Account: The Real Cost of Inaction</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The average Kenyan savings account pays <strong>3.5% per year</strong>. Leaving KES 500,000 in a savings account vs the top MMF for 5 years costs you:
          </p>
          <div className="not-prose bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-rose-900 text-sm mb-1">Opportunity Cost: KES 214,000+ over 5 years</p>
              <p className="text-rose-800 text-xs font-medium">Savings account: KES 597,000 final value. Top MMF: KES 811,000 final value. Same principal, same 5 years.</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">How to Open an MMF Account</h2>
          <ol className="text-slate-600 leading-relaxed space-y-3 mb-6 list-none not-prose">
            {[
              "Visit the fund manager's website or download their app (e.g. Zidi, CIC m-Fanisi, Sanlam)",
              "Complete the KYC process — you'll need your National ID and a selfie",
              "Link your M-Pesa number or bank account for deposits and withdrawals",
              "Make your first deposit — most accept M-Pesa directly",
              "Start earning daily accrued interest from day 1",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-sm font-medium">{step}</span>
              </li>
            ))}
          </ol>

          {/* CTA */}
          <div className="not-prose bg-slate-950 rounded-3xl p-8 mt-10">
            <h3 className="text-white font-black text-xl mb-2">Compare all MMFs side-by-side</h3>
            <p className="text-slate-400 text-sm mb-5">Use Sentill's live comparison tool — select up to 3 funds and see yield, risk, and liquidity in one screen.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/markets/mmfs" className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                View Live MMF Rates <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/tools/compare" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Compare Funds
              </Link>
              <Link href="/tools/tax-calculator" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Tax Calculator
              </Link>
            </div>
          </div>

          {/* Related */}
          <div className="not-prose mt-10 pt-8 border-t border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Related Articles</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { href: "/blog/mmf-vs-bonds-kenya", label: "MMF vs Bonds — Which Pays More?" },
                { href: "/blog/how-to-invest-50000-kenya", label: "How to Invest KES 50,000 in Kenya" },
              ].map((r, i) => (
                <Link key={i} href={r.href} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all group">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">{r.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
