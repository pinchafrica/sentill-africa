"use client";

import Link from "next/link";
import { Mail, MessageCircle, MapPin, ArrowLeft, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 relative z-10">
        <div className="space-y-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Intelligence Terminal
          </Link>
          
          <div className="space-y-6">
            <h1 className="text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none">
              Get in Touch <br/>
              <span className="text-blue-600">Nairobi HQ</span>
            </h1>
            <p className="text-xl text-slate-500 font-bold uppercase tracking-tight max-w-md leading-relaxed">
              Connect with our institutional desk for custom terminals, API access, or support.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Official Support</p>
                <p className="text-lg font-black text-slate-950 uppercase tracking-tight">support@sentill.africa</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp Pulse</p>
                <p className="text-lg font-black text-slate-950 uppercase tracking-tight">+254 703 469 525</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Physical Presence</p>
                <p className="text-lg font-black text-slate-950 uppercase tracking-tight">Westlands, Nairobi, KE</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
          
          <form className="relative z-10 space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Full Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Email</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all" placeholder="name@company.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Message</label>
              <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none" placeholder="How can our institutional desk help you?"></textarea>
            </div>

            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]">
              Transmit Message <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
