import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Clock, TrendingUp, ArrowRight, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Kenya Money Market Fund Yields April 2026 — Full Update",
  description: "Complete April 2026 update of Kenya MMF yields. Etica Capital 18.20%, Lofty-Corpin 17.50%, Cytonn 16.90% and 11 more funds ranked by net yield with paybills.",
  keywords: [
    "money market fund yields april 2026", "kenya mmf rates 2026", "best money market fund kenya 2026",
    "etica mmf yield", "lofty corpin mmf", "cytonn mmf yield", "ncba money market fund",
    "kcb money market", "mmf kenya comparison", "highest yield mmf kenya"
  ],
  alternates: { canonical: "/blog/kenya-mmf-yields-april-2026" },
  openGraph: {
    title: "Kenya MMF Yields April 2026 — Every Fund Ranked",
    description: "Etica 18.20%, Lofty-Corpin 17.50%, Cytonn 16.90% — full April 2026 yield update for all 11 CMA-regulated Kenyan MMFs.",
    type: "article",
    publishedTime: "2026-04-23T00:00:00Z",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Kenya Money Market Fund Yields April 2026 — Full Update",
  description: "Complete April 2026 update of Kenya MMF yields ranked by net yield after 15% WHT.",
  author: { "@type": "Organization", name: "Sentill Africa Research Team" },
  publisher: { "@type": "Organization", name: "Sentill Africa", logo: { "@type": "ImageObject", url: "https://sentill.africa/logo.png" } },
  datePublished: "2026-04-23",
  dateModified: "2026-04-23",
  mainEntityOfPage: "https://sentill.africa/blog/kenya-mmf-yields-april-2026",
};

const FUNDS = [
  { rank: 1, name: "Etica Capital MMF (Zidi)", gross: 18.20, net: 15.47, min: "KES 1,000", liquidity: "T+1", paybill: "511116", highlight: true, tag: "Top Pick" },
  { rank: 2, name: "Lofty-Corpin MMF", gross: 17.50, net: 14.88, min: "KES 1,000", liquidity: "Instant", paybill: "512600", highlight: false, tag: "Fastest Withdrawal" },
  { rank: 3, name: "Cytonn Money Market", gross: 16.90, net: 14.37, min: "KES 1,000", liquidity: "T+2", paybill: "525200", highlight: false, tag: "" },
  { rank: 4, name: "NCBA Money Market", gross: 16.20, net: 13.77, min: "KES 1,000", liquidity: "Instant", paybill: "880100", highlight: false, tag: "" },
  { rank: 5, name: "KCB Money Market", gross: 15.80, net: 13.43, min: "KES 1,000", liquidity: "T+1", paybill: "522522", highlight: false, tag: "" },
  { rank: 6, name: "Britam Money Market", gross: 15.50, net: 13.18, min: "KES 1,000", liquidity: "T+1", paybill: "602600", highlight: false, tag: "" },
  { rank: 7, name: "Sanlam Investments MMF", gross: 15.10, net: 12.84, min: "KES 5,000", liquidity: "T+2", paybill: "880100", highlight: false, tag: "" },
  { rank: 8, name: "ICEA Lion MMF", gross: 14.50, net: 12.33, min: "KES 5,000", liquidity: "T+1", paybill: "402402", highlight: false, tag: "" },
  { rank: 9, name: "CIC Money Market", gross: 13.60, net: 11.56, min: "KES 5,000", liquidity: "T+1", paybill: "174174", highlight: false, tag: "" },
  { rank: 10, name: "Old Mutual MMF", gross: 13.40, net: 11.39, min: "KES 1,000", liquidity: "T+2", paybill: "542542", highlight: false, tag: "" },
  { rank: 11, name: "Absa MMF", gross: 13.20, net: 11.22, min: "KES 1,000", liquidity: "T+1", paybill: "303030", highlight: false, tag: "" },
];

export default function KenyaMMFYieldsApril2026() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-slate-950 pt-44 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.1),_transparent_60%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">Research Hub</Link>
              <span className="text-slate-700">›</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">MMF Yields</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Updated April 23, 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
              Kenya MMF Yields<br />April 2026 — Full Update
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-6">
              All 11 CMA-regulated Money Market Funds ranked by net yield after 15% WHT — with M-Pesa paybills, minimum investments and withdrawal times.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Sentill Research</span><span>·</span><span>April 2026</span><span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />5 min read</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* TL;DR */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-10">
            <h2 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3">📌 April 2026 Summary</h2>
            <ul className="space-y-2">
              {[
                "Top MMF: Etica Capital (Zidi) at 18.20% gross — 15.47% net after WHT",
                "Fastest withdrawal: Lofty-Corpin MMF at 17.50% — instant access",
                "Average gross yield across 11 funds: ~15.4% (vs 7–8% savings accounts)",
                "All funds are CMA-regulated. 15% WHT is deducted at source automatically",
                "Minimum entry: KES 1,000 at Etica, Lofty-Corpin, NCBA, KCB, Britam, Absa",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />{t}
                </li>
              ))}
            </ul>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-2">Why Are MMF Yields So High in 2026?</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Kenya's Money Market Fund yields are elevated because the Central Bank of Kenya (CBK) held its benchmark rate at <strong>10.75%</strong> through Q1 2026. This pushed 91-Day T-Bill rates to <strong>15.78%</strong> and the 364-Day T-Bill to <strong>16.42%</strong> — and since MMFs primarily invest in these government securities, their yields followed.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            The global "higher for longer" rate narrative has reinforced this. With US Treasuries hovering near 4.0% and Kenya's sovereign risk premium built in, the real yield differential keeps institutional and retail money flowing into MMFs. Total MMF assets globally hit <strong>$7.64 trillion</strong> in April 2026 — a 15% search interest surge shows investors are actively re-evaluating where to park cash.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            For Kenyan investors, this is a rare window: government-backed returns of 15–18% with full liquidity. MMFs have not been this attractive since 2015–2016.
          </p>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">All 11 Kenya MMFs — April 2026 Yield Table</h2>
          <p className="text-slate-500 text-sm mb-4">Gross yield before 15% WHT | Net yield = gross × 0.85 | All figures are effective annual yield (EAY)</p>

          <div className="overflow-x-auto mb-10 rounded-2xl border border-slate-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">#</th>
                  <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">Fund</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Gross</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Net</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Min</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Withdrawal</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Paybill</th>
                </tr>
              </thead>
              <tbody>
                {FUNDS.map((f) => (
                  <tr key={f.rank} className={`border-t border-slate-100 ${f.highlight ? "bg-emerald-50" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3 font-black text-slate-400">{f.rank}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{f.name}</span>
                      {f.tag && <span className="ml-2 text-[8px] font-black text-emerald-600 bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5 uppercase tracking-widest">{f.tag}</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">{f.gross.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600">{f.net.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs">{f.min}</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs">{f.liquidity}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500 text-xs">{f.paybill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-400 mb-10">Source: Fund manager disclosures, CMA Kenya, Sentill Africa Research. Yields as at April 2026. Verify directly with fund managers before investing.</p>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">How to Invest: The M-Pesa Route (5 Minutes)</h2>
          <p className="text-slate-600 leading-relaxed mb-6">Most Kenyans can now invest in an MMF directly from M-Pesa. No paperwork, no broker — just a paybill number and your national ID for KYC:</p>
          <div className="space-y-3 mb-10">
            {[
              { step: "1", title: "Pick a fund", body: "Use the table above. Etica Capital (Zidi) is the highest-yielding. Lofty-Corpin is best if you need instant access." },
              { step: "2", title: "Go to M-Pesa → Lipa na M-Pesa → Pay Bill", body: "Enter the fund's paybill number. Account number is your national ID number." },
              { step: "3", title: "Complete KYC on the fund's app", body: "First-time investors need to verify identity. Takes 2–5 minutes digitally." },
              { step: "4", title: "Your money starts earning daily", body: "MMF interest accrues daily. Most funds credit monthly. You'll see the balance grow each time you check." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">{s.step}</div>
                <div>
                  <p className="font-black text-slate-900 text-sm">{s.title}</p>
                  <p className="text-slate-600 text-sm mt-0.5">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">What Does 18.20% Actually Mean for Your Money?</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { invested: "KES 10,000", gross: "KES 1,820/yr", net: "KES 1,547/yr", monthly: "KES 129/mo" },
              { invested: "KES 50,000", gross: "KES 9,100/yr", net: "KES 7,735/yr", monthly: "KES 645/mo" },
              { invested: "KES 500,000", gross: "KES 91,000/yr", net: "KES 77,350/yr", monthly: "KES 6,446/mo" },
            ].map((r) => (
              <div key={r.invested} className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">If you invest</p>
                <p className="text-xl font-black text-slate-900 mb-3">{r.invested}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Annual gross</p>
                <p className="text-sm font-black text-slate-700 mb-1">{r.gross}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Annual net (after WHT)</p>
                <p className="text-sm font-black text-emerald-600 mb-1">{r.net}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Monthly equivalent</p>
                <p className="text-sm font-black text-slate-700">{r.monthly}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Safety: Are Kenya MMFs Regulated?</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              Yes. All 11 funds above are regulated by the <strong className="text-white">Capital Markets Authority (CMA) Kenya</strong>. MMFs invest in short-duration government securities (T-Bills, repos, commercial paper) — they cannot invest in stocks or real estate.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Unlike a bank account, your money is not insured by the Kenya Deposit Insurance Corporation (KDIC). However, the underlying assets (government securities) are backed by the Kenyan government, making MMFs among the lowest-risk investments available.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-emerald-600 rounded-2xl p-8 text-center text-white">
            <Zap className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Compare All Kenya MMFs Live</h3>
            <p className="text-emerald-100 text-sm mb-5">Use Sentill's MMF comparison tool for real-time yields, net return calculations and paybill directory.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/markets/mmfs" className="px-6 py-3 bg-white text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors flex items-center gap-2 justify-center">
                Live MMF Rankings <ArrowRight className="w-3 h-3" />
              </Link>
              <Link href="/tools/compare" className="px-6 py-3 bg-emerald-700 border border-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center gap-2 justify-center">
                Compare Calculator <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium">
              <strong>Disclaimer:</strong> Yields quoted are effective annual yields as at April 2026 from fund manager disclosures. WHT of 15% is deducted at source. Net yields = gross × 0.85. Past yields do not guarantee future returns. Always verify directly with the fund manager before investing. Sentill Africa is an information platform and does not manage or hold investor funds.
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
