import type { Metadata } from "next";
import Link from "next/link";
import { Clock, TrendingUp, Tag, ArrowRight, BookOpen, Users, BarChart2, Landmark, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Sentill Research Hub | Kenya Investment Guides & Analysis",
  description: "Expert guides on Money Market Funds, Treasury Bills, SACCOs, and Bonds in Kenya. Data-driven comparisons to help you invest smarter.",
  keywords: ["Kenya investment guide", "MMF Kenya", "Treasury Bills Kenya", "SACCO Kenya", "best investment Kenya 2026"],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Sentill Research Hub — Kenya Investment Intelligence",
    description: "In-depth comparisons and guides for Kenyan investors.",
    type: "website",
  },
};

const ARTICLES = [
  {
    slug: "kenya-mmf-yields-april-2026",
    title: "Kenya MMF Yields April 2026 — Full Update",
    subtitle: "All 11 CMA-regulated funds ranked by net yield, with M-Pesa paybills",
    tag: "Hot Now",
    tagColor: "bg-rose-100 text-rose-700 border-rose-200",
    icon: TrendingUp,
    readTime: "5 min read",
    date: "April 23, 2026",
    excerpt: "Etica Capital 18.20%, Lofty-Corpin 17.50%, Cytonn 16.90% — complete April 2026 yield table for every Kenya MMF with paybills, minimums and withdrawal times.",
    featured: true,
  },
  {
    slug: "is-it-too-late-to-buy-bonds-kenya-2026",
    title: "Is It Too Late to Buy Bonds in Kenya?",
    subtitle: "IFB1/2024 still yields 18.46% tax-free — but the window may be closing",
    tag: "Trending",
    tagColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: Landmark,
    readTime: "8 min read",
    date: "April 23, 2026",
    excerpt: "Kenya's IFB bonds offer 18.46% WHT-free — among the best risk-adjusted rates in Africa. As CBK eases rates in H2 2026, this window won't last forever. Here's the analysis.",
  },
  {
    slug: "higher-for-longer-kenya-investing-2026",
    title: "Higher for Longer: Kenya's Rate Environment & Your Portfolio",
    subtitle: "What the global rate cycle means for MMFs, bonds, T-Bills and NSE stocks",
    tag: "Market Analysis",
    tagColor: "bg-amber-100 text-amber-700 border-amber-200",
    icon: BarChart2,
    readTime: "7 min read",
    date: "April 23, 2026",
    excerpt: "T-Bills at 16.42%, IFBs at 18.46%, MMFs near 18% — Kenya's elevated rate environment is a once-in-a-decade opportunity. Here's who wins, who loses, and how to position.",
  },
  {
    slug: "best-money-market-funds-kenya-2026",
    title: "Best Money Market Funds in Kenya 2026",
    subtitle: "Ranked by yield, liquidity & fund manager stability — with live data",
    tag: "MMF",
    tagColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: BarChart2,
    readTime: "8 min read",
    date: "April 2026",
    excerpt: "With over 30 regulated MMFs offering yields between 11–18%, choosing the right fund can mean KES 50,000+ difference per year on a KES 1M portfolio. We rank them all.",
  },
  {
    slug: "treasury-bills-kenya-guide",
    title: "How to Buy Treasury Bills in Kenya (2026 Guide)",
    subtitle: "Step-by-step: DhowCSD account, auction dates, and what rates to expect",
    tag: "T-Bills",
    tagColor: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Landmark,
    readTime: "6 min read",
    date: "April 2026",
    excerpt: "Treasury Bills are Kenya's safest investment, backed by the government and currently yielding 15–16%. This guide covers everything from opening a CSD account to rolling over your investment.",
  },
  {
    slug: "mmf-vs-bonds-kenya",
    title: "MMF vs Bonds in Kenya: Which Gives Better Returns?",
    subtitle: "A data-driven comparison of liquidity, yield, tax treatment and risk",
    tag: "Comparison",
    tagColor: "bg-violet-100 text-violet-700 border-violet-200",
    icon: TrendingUp,
    readTime: "7 min read",
    date: "April 2026",
    excerpt: "Both offer competitive yields, but they serve very different purposes. We break down when to pick an MMF over a bond — and why Infrastructure Bonds are often misunderstood.",
  },
  {
    slug: "best-saccos-kenya-2026",
    title: "Best SACCOs in Kenya 2026: Dividend Rates Compared",
    subtitle: "Top 10 SACCOs ranked by dividend rate, asset base and member benefits",
    tag: "SACCOs",
    tagColor: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Users,
    readTime: "9 min read",
    date: "April 2026",
    excerpt: "SACCOs can offer yields of 12–22% annually through dividends and rebates. But not all are equal — we compare Kenya's top 10 licensed SACCOs by real dividend data.",
  },
  {
    slug: "how-to-invest-50000-kenya",
    title: "How to Invest KES 50,000 in Kenya: 5 Best Options",
    subtitle: "From MMFs to T-Bills — what actually makes sense at this capital level",
    tag: "Beginner",
    tagColor: "bg-rose-100 text-rose-700 border-rose-200",
    icon: Wallet,
    readTime: "5 min read",
    date: "April 2026",
    excerpt: "KES 50,000 is exactly the right amount to start diversifying. Here's a practical breakdown of where to put it — with projected returns for each option.",
  },
];

export default function BlogPage() {
  const [featured, ...rest] = ARTICLES;
  const FeaturedIcon = featured.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-950 pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Sentill Research Hub</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-6">
            Invest<br /><span className="text-emerald-400">Smarter.</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
            Data-driven guides on Kenya's top investment options — MMFs, T-Bills, SACCOs, and Bonds. Written by Sentill's research team using live market data.
          </p>
          <div className="flex items-center gap-6 mt-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
            <span>{ARTICLES.length} Articles</span>
            <span>·</span>
            <span>Updated Monthly</span>
            <span>·</span>
            <span>Live Rate Data</span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">

        {/* Featured Article */}
        <Link href={`/blog/${featured.slug}`}
          className="block group bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="md:flex">
            <div className="md:w-2/5 bg-gradient-to-br from-slate-900 to-slate-950 p-10 flex flex-col justify-between min-h-[240px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${featured.tagColor} mb-4`}>
                  <Tag className="w-3 h-3" />{featured.tag}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <FeaturedIcon className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
                <span>{featured.date}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Featured</span>
              </div>
            </div>
            <div className="md:w-3/5 p-10 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-3 group-hover:text-emerald-600 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-4">{featured.subtitle}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{featured.excerpt}</p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-emerald-600 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                Read Full Analysis <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>

        {/* Article Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {rest.map((article) => {
            const Icon = article.icon;
            return (
              <Link key={article.slug} href={`/blog/${article.slug}`}
                className="block group bg-white rounded-[1.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${article.tagColor}`}>
                    <Tag className="w-2.5 h-2.5" />{article.tag}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" />{article.readTime}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:border group-hover:border-emerald-200 transition-all">
                  <Icon className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-emerald-600 transition-colors">
                  {article.title}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{article.subtitle}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{article.excerpt}</p>
                <div className="flex items-center gap-2 mt-5 text-emerald-600 text-[9px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
          <div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Get live rates in your pocket</p>
            <h3 className="text-xl font-black text-white">Compare all funds in real time</h3>
            <p className="text-slate-400 text-sm mt-1">Use Sentill's live tools — no sign-up needed for basic access.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/tools/compare" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center">
              Compare Funds
            </Link>
            <Link href="/tools/goal-planner" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center">
              Goal Planner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
