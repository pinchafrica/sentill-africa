import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Clock, TrendingUp, ArrowRight, AlertTriangle, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Is It Too Late to Buy Bonds in Kenya? April 2026 Analysis",
  description: "Are Kenya IFB bonds still worth buying in April 2026? IFB1/2024 yields 18.46% tax-free. We analyse the bond market, rate trajectory, and whether to buy now or wait.",
  keywords: [
    "is it too late to buy bonds 2026", "kenya infrastructure bond 2026", "ifb bond kenya april 2026",
    "kenya bond yield 2026", "should i buy ifb bond now", "bond ladder kenya",
    "cbk bond auction 2026", "kenya government bond yield", "is it too late to invest bonds"
  ],
  alternates: { canonical: "/blog/is-it-too-late-to-buy-bonds-kenya-2026" },
  openGraph: {
    title: "Is It Too Late to Buy Bonds in Kenya? April 2026",
    description: "IFB1/2024 still offers 18.46% WHT-free. Analysis of Kenya's bond market, rate trajectory, and the right window to buy.",
    type: "article",
    publishedTime: "2026-04-23T00:00:00Z",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Is It Too Late to Buy Bonds in Kenya? April 2026 Analysis",
  author: { "@type": "Organization", name: "Sentill Africa Research Team" },
  publisher: { "@type": "Organization", name: "Sentill Africa", logo: { "@type": "ImageObject", url: "https://sentill.africa/logo.png" } },
  datePublished: "2026-04-23",
  dateModified: "2026-04-23",
  mainEntityOfPage: "https://sentill.africa/blog/is-it-too-late-to-buy-bonds-kenya-2026",
};

const BONDS = [
  { name: "IFB1/2024", type: "Infrastructure Bond", coupon: 18.46, net: 18.46, wht: "0% (exempt)", tenor: "10yr", min: "KES 50,000", tradeable: true, verdict: "Best overall" },
  { name: "IFB2/2023", type: "Infrastructure Bond", coupon: 17.93, net: 17.93, wht: "0% (exempt)", tenor: "10yr", min: "KES 50,000", tradeable: true, verdict: "Strong alternative" },
  { name: "FXD2/2023", type: "Fixed Rate Bond", coupon: 15.50, net: 13.18, wht: "15%", tenor: "7yr", min: "KES 50,000", tradeable: true, verdict: "" },
  { name: "364-Day T-Bill", type: "Treasury Bill", coupon: 16.42, net: 13.96, wht: "15%", tenor: "1yr", min: "KES 50,000", tradeable: false, verdict: "" },
];

export default function IsTooLateBondsKenya2026() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-slate-950 pt-44 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.12),_transparent_60%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors">Research Hub</Link>
              <span className="text-slate-700">›</span>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Bond Analysis</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> April 23, 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
              Is It Too Late to Buy Bonds in Kenya?
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-6">
              IFB1/2024 still yields 18.46% — completely tax-free. But with CBK rates likely to ease in H2 2026, is now the right window? A data-driven answer.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Sentill Research</span><span>·</span><span>April 2026</span><span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />8 min read</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* TL;DR */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-10">
            <h2 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-3">📌 Short Answer</h2>
            <ul className="space-y-2">
              {[
                "No — it is NOT too late. IFB1/2024 still offers 18.46% WHT-free and trades on the NSE secondary market",
                "The window may be closing: CBK is expected to ease rates in H2 2026, which will push new bond yields lower",
                "If you buy now and lock in at 18.46% for 10 years, you capture the peak of this rate cycle",
                "The real risk is waiting too long — not acting too early",
                "Minimum to buy on secondary market: KES 50,000 via a licensed NSE stockbroker or DhowCSD",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-800 font-medium">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />{t}
                </li>
              ))}
            </ul>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">The Global Context: "Higher for Longer" Ends Eventually</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Globally, the April 2026 investment landscape is defined by a "higher for longer" rate environment. US 10-year Treasuries hover near 4.0%, global sovereign bonds have sold off as yields rise, and search queries for <strong>"bond yield inversion 2026"</strong> and <strong>"is it too late to buy bonds"</strong> are trending at their highest since 2023.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Kenya mirrors this dynamic with a twist: our rates are significantly higher. The CBK benchmark rate is <strong>10.75%</strong> — and Kenya's risk premium pushes sovereign yields above 15%. This has created an extraordinary window for Kenyan investors.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            The key insight from global markets: when central banks eventually cut rates, <strong>bond prices rise and yields fall</strong>. Investors who buy bonds now lock in today's high rates for the full duration — earning inflation-beating returns even as new issuances pay less.
          </p>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Kenya Bond Market — April 2026 Snapshot</h2>
          <div className="overflow-x-auto mb-8 rounded-2xl border border-slate-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">Instrument</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Coupon</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Net Yield</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">WHT</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Tenor</th>
                  <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest">Min</th>
                </tr>
              </thead>
              <tbody>
                {BONDS.map((b) => (
                  <tr key={b.name} className={`border-t border-slate-100 ${b.verdict === "Best overall" ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{b.name}</span>
                      {b.verdict && <span className="ml-2 text-[8px] font-black text-indigo-600 bg-indigo-100 border border-indigo-200 rounded-full px-2 py-0.5 uppercase tracking-widest">{b.verdict}</span>}
                      <span className="block text-[9px] text-slate-400 mt-0.5">{b.type}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">{b.coupon.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right font-black text-indigo-600">{b.net.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs">{b.wht}</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs">{b.tenor}</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs">{b.min}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">Why IFBs Are the Best Bond Kenya Has Ever Offered</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Infrastructure Bonds (IFBs) are issued by the National Treasury to fund specific infrastructure projects. By law, interest earned on IFBs is <strong>completely exempt from income tax and withholding tax</strong> — you keep 100% of the coupon.
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            Compare this to a fixed-rate bond: a 16.80% FXD bond nets you 14.28% after 15% WHT. The IFB at 18.46% nets you the full 18.46%. That 4%+ spread is enormous compounded over 10 years.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-indigo-900 mb-3">✅ Reasons to Buy Now</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                {[
                  "Lock in 18.46% tax-free for 10 years",
                  "If CBK cuts rates, new bonds will yield less — but yours doesn't change",
                  "Bond price appreciation: as yields fall, your bond value rises (capital gain + coupon)",
                  "Best risk-adjusted rate in Kenya — zero credit risk (government issuer)",
                  "Available on NSE secondary market today — no need to wait for next auction",
                ].map((r, i) => <li key={i} className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />{r}</li>)}
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-amber-900 mb-3">⚠️ Risks to Consider</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                {[
                  "Long duration (10yr) — your capital is locked unless you sell on NSE",
                  "If CBK raises rates further, new bonds will offer even more",
                  "Secondary market liquidity: NSE bond market can be thin",
                  "You need a CDS account and a licensed broker (1–3 day setup)",
                  "Not suitable for emergency funds — use MMF for liquid savings",
                ].map((r, i) => <li key={i} className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />{r}</li>)}
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">The Kenya Rate Cycle: Where Are We Now?</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            CBK cut its benchmark rate from 13.0% to 10.75% in late 2025 — signalling the beginning of an easing cycle. However, sticky inflation (currently at 6.3%) and the shilling's stability concerns have kept the CBK on hold through Q1 2026.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Market consensus: CBK is likely to cut once more in H2 2026 (to ~9.5–10%) if inflation cools. When that happens, T-Bill rates will fall from 15–16% toward 13–14%, and new bond auction rates will follow. <strong>Bonds issued today at 18.46% will look exceptional by 2027.</strong>
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            The bond ladder strategy many global investors are applying — buying bonds at different durations to capture peak rates — directly applies in Kenya. An IFB purchase now is the long-duration anchor of that ladder.
          </p>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">How to Buy Kenya Bonds in 2026</h2>
          <div className="space-y-3 mb-10">
            {[
              { step: "1", title: "Via CBK Auction (DhowCSD)", body: "Register at dhowcsd.centralbank.go.ke with your ID and bank account. Auctions run every Monday. Minimum: KES 50,000. Best for primary market access." },
              { step: "2", title: "Via NSE Secondary Market", body: "IFB1/2024 and IFB2/2023 trade daily on the Nairobi Securities Exchange. Use a licensed stockbroker (NCBA, Dyer & Blair, Faida). Commission: ~1.5%." },
              { step: "3", title: "Via Ziidi (Safaricom)", body: "Ziidi is expanding bond access for retail investors. Watch for IFB availability on the Safaricom/Ziidi platform — currently being rolled out." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">{s.step}</div>
                <div>
                  <p className="font-black text-slate-900 text-sm">{s.title}</p>
                  <p className="text-slate-600 text-sm mt-0.5">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 mb-10">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">📊 Example: KES 500,000 in IFB1/2024</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Annual coupon (18.46%)", value: "KES 92,300" },
                { label: "WHT deducted", value: "KES 0 (exempt)" },
                { label: "Net annual income", value: "KES 92,300" },
                { label: "Monthly income", value: "KES 7,692" },
                { label: "10-year total income", value: "KES 923,000" },
                { label: "vs savings account (4%)", value: "+KES 723,000 more" },
              ].map((m) => (
                <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{m.label}</p>
                  <p className="text-sm font-black text-white mt-1">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white mb-10">
            <Shield className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Track Kenya Bond Yields Live</h3>
            <p className="text-indigo-100 text-sm mb-5">See IFB bond yields, T-Bill rates, and CBK policy rate — updated daily on Sentill Africa.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/markets/bonds" className="px-6 py-3 bg-white text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors flex items-center gap-2 justify-center">
                Kenya Bond Market <ArrowRight className="w-3 h-3" />
              </Link>
              <Link href="/blog/mmf-vs-bonds-kenya" className="px-6 py-3 bg-indigo-700 border border-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center gap-2 justify-center">
                MMF vs Bonds Comparison <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium">
              <strong>Disclaimer:</strong> This article is for informational purposes only and does not constitute licensed financial advice. Bond yields are as at April 2026 and may change. CBK rate projections are consensus estimates only. Verify all rates with CBK and your broker before investing. Sentill Africa does not hold or manage investor funds.
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
