"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, Clock, Tag, TrendingUp, Search, User } from "lucide-react";

const POSTS = [
  {
    id: 1,
    title: "Understanding High-Yield Kenyan Money Market Funds in 2026",
    excerpt: "With the CBK base lending rate shifts, how do MMFs like Etica, NCBA, and Sanlam adjust their yields? We break down the correlation.",
    category: "Market Analysis",
    author: "Sentil Research",
    date: "March 12, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
    tags: ["MMF", "Interest Rates", "CBK"],
  },
  {
    id: 2,
    title: "Infrastructure Bonds vs Fixed Dep: The Ultimate Tax-Alpha Playbook",
    excerpt: "Avoid the 15% Withholding Tax drag completely. Here is why high net-worth investors are aggressively allocating to Government IFBs.",
    category: "Tax Strategies",
    author: "Sentil Advisory",
    date: "March 10, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80&w=800",
    tags: ["Bonds", "WHT", "Tax"],
  },
  {
    id: 3,
    title: "Tier 1 SACCOs: Are 20% Dividend Payouts Sustainable?",
    excerpt: "Tower and Kenya Police SACCOs continue to print market-beating dividends. We dissect their loan books to see if this is a long-term play.",
    category: "Deep Dive",
    author: "Sentil Data Labs",
    date: "March 05, 2026",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    tags: ["SACCOs", "Dividends"],
  },
  {
    id: 4,
    title: "NSE Equities: Hunting for Blue-Chip Dividend Yields",
    excerpt: "While capital gains lag, Safaricom and Equity Bank offer attractive dividend yields at discounted entry prices.",
    category: "Equities",
    author: "Sentil Research",
    date: "Feb 28, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=800",
    tags: ["NSE", "Dividends", "Stocks"],
  },
];

export default function BlogsPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const allTags = ["All", ...Array.from(new Set(POSTS.flatMap(p => p.tags)))];

  const filtered = POSTS.filter(p =>
    (activeTag === "All" || p.tags.includes(activeTag)) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 md:px-10 pt-10 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-6">
          <BookOpen className="w-3 h-3" /> Sentil Intelligence Network
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
          Investment<br />Insights.
        </h1>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] max-w-xl">
          Deep-dive analyses, tax strategies, and market commentary curated by the Sentil Research Team.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        
        {/* ── SEARCH & FILTER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeTag === tag
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900 shadow-sm"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 md:max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search insights..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* ── BLOG GRID ── */}
        <div className="grid md:grid-cols-2 gap-8">
          {filtered.map(post => (
            <article key={post.id} className="group cursor-pointer bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
              <div className="h-48 md:h-64 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-black uppercase tracking-widest text-indigo-700 shadow-sm">
                  {post.category}
                </div>
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.date}</span>
                  <span className="flex items-center gap-1 text-slate-300">|</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.readTime}</span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <img src="https://ui-avatars.com/api/?name=Sentil+Research&background=f1f5f9&color=64748b" className="rounded-full" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{post.author}</span>
                  </div>
                  
                  <span className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Read Story <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">No insights found</h3>
            <p className="text-sm font-medium text-slate-500">Try adjusting your search query or tags.</p>
          </div>
        )}

      </div>
    </div>
  );
}
