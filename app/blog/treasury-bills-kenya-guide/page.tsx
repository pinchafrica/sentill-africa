import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Buy Treasury Bills in Kenya 2026 | Complete Guide",
  description: "Step-by-step guide to buying 91-day, 182-day and 364-day Treasury Bills in Kenya via CBK DhowCSD. Rates, auction dates, and what to expect.",
  keywords: ["treasury bills kenya", "how to buy t-bills kenya", "CBK auction kenya", "91 day t-bill kenya 2026", "dhow csd kenya", "government securities kenya"],
  alternates: { canonical: "/blog/treasury-bills-kenya-guide" },
  openGraph: { title: "How to Buy Treasury Bills in Kenya — 2026 Guide", description: "The complete beginner guide to Kenya Government T-Bills.", type: "article", publishedTime: "2026-04-01T00:00:00Z" },
};

const jsonLd = {
  "@context": "https://schema.org", "@type": "Article",
  headline: "How to Buy Treasury Bills in Kenya (2026 Guide)",
  author: { "@type": "Organization", name: "Sentill Africa Research Team" },
  publisher: { "@type": "Organization", name: "Sentill Africa" },
  datePublished: "2026-04-01", dateModified: "2026-04-01",
  mainEntityOfPage: "https://sentill.africa/blog/treasury-bills-kenya-guide",
};

const TBILL_RATES = [
  { tenor: "91-Day T-Bill",  rate: "15.8%", yield: "15.8%", minBid: "KES 50,000", auction: "Weekly (Monday)" },
  { tenor: "182-Day T-Bill", rate: "16.1%", yield: "16.1%", minBid: "KES 50,000", auction: "Weekly (Monday)" },
  { tenor: "364-Day T-Bill", rate: "16.4%", yield: "16.4%", minBid: "KES 50,000", auction: "Weekly (Monday)" },
];

export default function TBillGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="min-h-screen bg-white">
        <div className="bg-slate-950 pt-44 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.12),_transparent_60%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Research Hub</Link>
              <span className="text-slate-700">›</span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">T-Bills</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">How to Buy Treasury Bills in Kenya (2026 Guide)</h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-6">Step-by-step: DhowCSD account setup, CBK auction dates, minimum bids, and what rates to expect right now.</p>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>By Sentill Research Team</span><span>·</span><span>April 2026</span><span>·</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />6 min read</span><span>·</span><span className="text-blue-400">Live Rates</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-10">
            <h2 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-3">📌 Key Takeaways</h2>
            <ul className="space-y-2">
              {["T-Bills are sovereign-backed — safest investment in Kenya", "Currently yielding 15.8–16.4% (April 2026)", "Minimum bid: KES 50,000 per application", "100% liquid at maturity (91, 182, or 364 days)", "Subject to 15% WHT — net yield ≈ 13.4–13.9%"].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-800 font-medium"><CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">What Are Treasury Bills?</h2>
          <p className="text-slate-600 leading-relaxed mb-4">Treasury Bills (T-Bills) are short-term government debt instruments issued by the Central Bank of Kenya (CBK) on behalf of the National Treasury. When you buy a T-Bill, you're lending money to the Kenyan government for 91, 182, or 364 days. At maturity, you receive your principal back plus interest — guaranteed by the sovereign.</p>
          <p className="text-slate-600 leading-relaxed mb-6">T-Bills are sold at a <strong>discount to face value</strong>. This means if you buy a KES 100,000 T-Bill, you pay roughly KES 96,000 today and receive the full KES 100,000 at maturity. The KES 4,000 difference is your return.</p>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-6">Current T-Bill Rates (April 2026)</h2>
          <div className="overflow-x-auto mb-10">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="bg-slate-900 text-white">{["Tenor", "Rate", "Net Yield (after WHT)", "Min. Bid", "Auction Day"].map(h => <th key={h} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{TBILL_RATES.map((r, i) => <tr key={i} className="border-b border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-bold text-slate-900">{r.tenor}</td><td className="px-4 py-3 font-black text-blue-600">{r.rate}</td><td className="px-4 py-3 font-bold text-slate-600">{(parseFloat(r.rate) * 0.85).toFixed(1)}%</td><td className="px-4 py-3 font-bold text-slate-600">{r.minBid}</td><td className="px-4 py-3 font-bold text-slate-600">{r.auction}</td></tr>)}</tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">Step-by-Step: How to Buy T-Bills in Kenya</h2>
          {[
            { step: "1. Open a DhowCSD Account", body: "Go to dhowcsd.ke and register for a Central Securities Depository (CSD) account. You'll need your National ID, KRA PIN, and a bank account. Account opening is free and takes 1–3 business days to approve." },
            { step: "2. Fund Your CSD Account", body: "Deposit funds into your linked bank account. Most banks (KCB, Equity, Co-op, NCBA) support direct T-Bill applications. The minimum competitive bid is KES 50,000." },
            { step: "3. Submit Your Bid on Auction Day", body: "CBK holds T-Bill auctions every Monday. Log in to DhowCSD, navigate to Auction Bids, select your preferred tenor (91, 182, or 364 days), enter your amount, and submit. Non-competitive bids are accepted at the weighted average rate." },
            { step: "4. Wait for Allotment Results", body: "Results are published Tuesday. If your bid is accepted, funds are debited from your account on the settlement date (Thursday). You'll receive an allotment confirmation via email." },
            { step: "5. Hold to Maturity or Roll Over", body: "At maturity, your principal and net interest are credited back to your bank account. You can opt for automatic rollover at the current market rate — ideal for passive income." },
          ].map((item, i) => (
            <div key={i} className="mb-4 p-5 bg-white border border-slate-200 rounded-2xl">
              <h3 className="font-black text-slate-900 text-sm mb-2">{item.step}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 my-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-amber-900 text-sm mb-1">Important: Non-Competitive vs Competitive Bids</p>
              <p className="text-amber-800 text-xs font-medium">First-time investors should always submit <strong>non-competitive bids</strong>. This guarantees allotment at the weighted average market rate. Competitive bids risk rejection if your rate bid is too high.</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">T-Bills vs MMFs: Which Should You Choose?</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="bg-slate-900 text-white">{["Feature", "T-Bills", "MMFs"].map(h => <th key={h} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{[["Minimum Investment", "KES 50,000", "KES 100–5,000"], ["Liquidity", "At maturity only", "T+1 (daily)"], ["Yield (Gross)", "15.8–16.4%", "14–18%"], ["Tax", "15% WHT", "15% WHT"], ["Risk", "Sovereign (Zero)", "Very Low"], ["Who manages it", "You (via DhowCSD)", "Fund Manager"]].map(([f, a, b], i) => <tr key={i} className="border-b border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-bold text-slate-700">{f}</td><td className="px-4 py-3 font-bold text-blue-700">{a}</td><td className="px-4 py-3 font-bold text-emerald-700">{b}</td></tr>)}</tbody>
            </table>
          </div>

          <div className="bg-slate-950 rounded-3xl p-8 mt-10">
            <h3 className="text-white font-black text-xl mb-2">Check live T-Bill rates on Sentill</h3>
            <p className="text-slate-400 text-sm mb-5">We track every CBK auction result and update T-Bill yields every Monday after results are announced.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/markets/treasuries" className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Live T-Bill Rates <ArrowRight className="w-3.5 h-3.5" /></Link>
              <Link href="/tools/dhowcsd" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">DhowCSD Tool</Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Related Articles</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{href:"/blog/mmf-vs-bonds-kenya",label:"MMF vs Bonds — Which Pays More?"},{href:"/blog/best-money-market-funds-kenya-2026",label:"Best MMFs in Kenya 2026"}].map((r,i)=>(
                <Link key={i} href={r.href} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{r.label}</span><ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
