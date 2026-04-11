import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Best SACCOs in Kenya 2026 | Dividend Rates Compared",
  description: "Top 10 SACCOs in Kenya ranked by dividend rate, asset base, and member benefits. Data from SASRA audits. Stima, Kenya Police, Mwalimu, and more.",
  keywords: ["best sacco kenya 2026", "highest dividend sacco kenya", "sacco vs bank kenya", "stima sacco dividend", "mwalimu sacco kenya", "SASRA regulated sacco"],
  alternates: { canonical: "/blog/best-saccos-kenya-2026" },
  openGraph: { title: "Best SACCOs in Kenya 2026 — Dividend Rates", description: "Top 10 SASRA-licensed SACCOs ranked by real dividend data.", type: "article", publishedTime: "2026-04-01T00:00:00Z" },
};

const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: "Best SACCOs in Kenya 2026: Dividend Rates Compared", author: { "@type": "Organization", name: "Sentill Africa Research Team" }, publisher: { "@type": "Organization", name: "Sentill Africa" }, datePublished: "2026-04-01", mainEntityOfPage: "https://sentill.africa/blog/best-saccos-kenya-2026" };

const SACCOS = [
  { rank:1,  name:"Stima SACCO",         dividend:"18.0%", rebate:"9%",  assets:"KES 80B+",  members:"90,000+",  sector:"Multi-sector" },
  { rank:2,  name:"Kenya Police SACCO",   dividend:"17.5%", rebate:"8%",  assets:"KES 75B+",  members:"120,000+", sector:"Public Service" },
  { rank:3,  name:"Mwalimu National",     dividend:"17.0%", rebate:"10%", assets:"KES 90B+",  members:"300,000+", sector:"Teachers" },
  { rank:4,  name:"Kenya Airlines SACCO", dividend:"16.8%", rebate:"7%",  assets:"KES 25B+",  members:"5,000+",   sector:"Aviation" },
  { rank:5,  name:"Unaitas SACCO",        dividend:"16.5%", rebate:"8%",  assets:"KES 20B+",  members:"55,000+",  sector:"Multi-sector" },
  { rank:6,  name:"Wanandege SACCO",      dividend:"16.2%", rebate:"9%",  assets:"KES 8B+",   members:"10,000+",  sector:"Aviation" },
  { rank:7,  name:"Kenya Bankers SACCO",  dividend:"15.8%", rebate:"7%",  assets:"KES 30B+",  members:"40,000+",  sector:"Banking" },
  { rank:8,  name:"Harambee SACCO",       dividend:"15.5%", rebate:"6%",  assets:"KES 18B+",  members:"60,000+",  sector:"Public Service" },
  { rank:9,  name:"Imarisha SACCO",       dividend:"15.2%", rebate:"8%",  assets:"KES 12B+",  members:"30,000+",  sector:"Multi-sector" },
  { rank:10, name:"Afya SACCO",           dividend:"14.8%", rebate:"5%",  assets:"KES 10B+",  members:"15,000+",  sector:"Healthcare" },
];

export default function BestSACCOsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="min-h-screen bg-white">
        <div className="bg-slate-950 pt-44 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.12),_transparent_60%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-amber-400 transition-colors">Research Hub</Link>
              <span className="text-slate-700">›</span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">SACCOs</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">Best SACCOs in Kenya 2026:<br />Dividend Rates Compared</h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">Top 10 SASRA-licensed SACCOs ranked by dividend rate, asset base, and member benefits. Real data from 2025 audited accounts.</p>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Sentill Research</span><span>·</span><span>April 2026</span><span>·</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />9 min read</span><span>·</span><span className="text-amber-400">SASRA Data</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10">
            <h2 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-3">📌 Key Facts About SACCOs in Kenya</h2>
            <ul className="space-y-2">
              {["Over 14,000 registered SACCOs in Kenya — 163 SASRA-licensed deposit-taking SACCOs", "Top SACCOs pay 14–18% in annual dividends + member rebates", "Unlike banks: members own the SACCO and share in the profits", "Shares and deposits grow separately — both earn returns", "Joining requires eligibility (employer/sector link for most)"].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800 font-medium"><CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4">How SACCOs Generate Returns</h2>
          <p className="text-slate-600 leading-relaxed mb-4">SACCOs earn income by lending member deposits to other members at rates of 12–18% per year. At the end of the financial year, the surplus is distributed to members in two ways:</p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              { title: "Dividend on Shares", desc: "Paid on your share capital as a % (e.g. 18% on KES 200,000 shares = KES 36,000). Shares are like equity in the SACCO." },
              { title: "Interest Rebate on Deposits", desc: "Paid on your savings/deposits. Often 5–10% of interest paid on loans taken rebounds to the borrower's account." },
            ].map((c, i) => (
              <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl">
                <p className="font-black text-slate-900 text-sm mb-2">{c.title}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-6">Top 10 SACCOs in Kenya — 2026 Rankings</h2>
          <div className="overflow-x-auto mb-10">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="bg-slate-900 text-white">{["#","SACCO","Dividend","Rebate","Assets","Members","Sector"].map(h=><th key={h} className="px-3 py-3 text-left text-[8px] font-black uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{SACCOS.map((s,i)=>(
                <tr key={i} className={`border-b border-slate-100 ${i===0?"bg-amber-50":i===1?"bg-amber-50/50":"hover:bg-slate-50"}`}>
                  <td className="px-3 py-3 font-black text-slate-400">{s.rank}</td>
                  <td className="px-3 py-3 font-bold text-slate-900">{s.name}</td>
                  <td className="px-3 py-3 font-black text-amber-600">{s.dividend}</td>
                  <td className="px-3 py-3 font-bold text-slate-600">{s.rebate}</td>
                  <td className="px-3 py-3 font-bold text-slate-600">{s.assets}</td>
                  <td className="px-3 py-3 font-bold text-slate-600">{s.members}</td>
                  <td className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">{s.sector}</td>
                </tr>
              ))}</tbody>
            </table>
            <p className="text-[10px] text-slate-400 mt-2">* Dividend rates from 2025 AGM declarations. Data sourced from SASRA reports and individual SACCO audited accounts.</p>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">SACCO vs MMF vs Bank: A Quick Comparison</h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="bg-slate-900 text-white">{["Feature","SACCO","MMF","Bank Savings"].map(h=><th key={h} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{[["Annual Return","14–18%","14–18%","3–5%"],["Liquidity","Low (notice periods)","High (T+1)","High"],["Minimum","Varies","KES 100+","Varies"],["Ownership","Member-owned","None","None"],["Tax","5% WHT on dividend","15% WHT","10% WHT"],["Loan Access","Yes (3× shares)","No","Yes (collateral)"]].map(([f,a,b,c],i)=>(
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-bold text-slate-700">{f}</td><td className="px-4 py-3 font-bold text-amber-700">{a}</td><td className="px-4 py-3 font-bold text-emerald-700">{b}</td><td className="px-4 py-3 font-bold text-slate-500">{c}</td></tr>
              ))}</tbody>
            </table>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-10 mb-4">How to Join a SACCO</h2>
          {["Check eligibility — most sector-specific SACCOs require employment in that sector. Multi-sector SACCOs like Unaitas are open to all.","Pay entrance fee and buy minimum shares — typically KES 1,000–5,000 in shares to join.","Start making monthly contributions — regular deposits to your savings account build your share capital over time.","Access loans after 6 months — once you've built up savings, you can borrow 3× your deposits at competitive rates.","Receive dividends annually — declared at the AGM and credited to your share account or paid out."].map((step, i) => (
            <div key={i} className="mb-3 p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</span>
              <span className="text-sm font-medium text-slate-600">{step}</span>
            </div>
          ))}

          <div className="bg-slate-950 rounded-3xl p-8 mt-10">
            <h3 className="text-white font-black text-xl mb-2">View live SACCO intelligence on Sentill</h3>
            <p className="text-slate-400 text-sm mb-5">Compare SACCO dividend rates, audit scores, and loan product details — all in one place.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/markets/saccos" className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">SACCO Hub <ArrowRight className="w-3.5 h-3.5" /></Link>
              <Link href="/tools/compare" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Compare vs MMF</Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Related Articles</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{href:"/blog/how-to-invest-50000-kenya",label:"How to Invest KES 50,000 in Kenya"},{href:"/blog/mmf-vs-bonds-kenya",label:"MMF vs Bonds — Which Pays More?"}].map((r,i)=>(
                <Link key={i} href={r.href} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-xl transition-all group">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">{r.label}</span><ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
