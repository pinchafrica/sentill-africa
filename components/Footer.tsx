"use client";

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight,
  MessageCircle // Added MessageCircle import
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="inline-block group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter">Sentill Africa</span>
            </div>
          </Link>
          <p className="text-slate-500 text-sm font-bold leading-relaxed uppercase tracking-tight">
            Nairobi's premier wealth intelligence matrix. Precision data for the ambitious African investor.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </Link>
          </div>
        </div>

        {/* Intelligence Links */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Intelligence Hub</h4>
          <ul className="space-y-4">
            <li><Link href="/markets/mmfs" className="text-sm text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">Daily Interest (MMFs)</Link></li>
            <li><Link href="/markets/nse" className="text-sm text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">NSE Dividend Kings</Link></li>
            <li><Link href="/markets/bonds" className="text-sm text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">Infrastructure Bonds</Link></li>
            <li><Link href="/markets/saccos" className="text-sm text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">Tier-1 SACCOs</Link></li>
          </ul>
        </div>

        {/* Wealth Tools */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Wealth Lab</h4>
          <ul className="space-y-4">
            <li><Link href="/tools/compare" className="text-sm text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">Comparison Engine</Link></li>
            <li><Link href="/tools/tax-calculator" className="text-sm text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">KRA Tax Automator</Link></li>
            <li><Link href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">Virtual Portfolio</Link></li>
            <li><Link href="/resources/faqs" className="text-sm text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">Nairobi HQ Support</Link></li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Nairobi HQ</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-500">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold uppercase">Dam Estate, Langata, Nairobi</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold uppercase">support@sentill.africa</span>
            </div>
            <a href="tel:+254706206160" className="flex items-center gap-3 text-slate-500 hover:text-blue-500 transition-colors">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold uppercase">+254 706 206 160</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-6 mt-24 pt-12 border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-slate-900/50 rounded-3xl p-8 border border-white/5">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
              <div>
                <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2">Institutional Disclaimer</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase">
                  Sentill Africa is an informational matrix. We are non-custodial and do not process capital. 
                  Investment carries inherent risk. Verify all data with licensed CMA/SASRA institutions.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center lg:items-end space-y-4">
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Intelligence</Link>
                <Link href="/security" className="hover:text-white transition-colors">Security</Link>
             </div>
             <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-relaxed text-center lg:text-right">
               Sentill Africa is a digital asset of{" "}
               <a href="https://www.pinch.africa" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                 Pinch Africa Limited
               </a>. &copy; 2026 Sentill Wealth Hub.
             </p>
             <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest text-center lg:text-right">
               Designed &amp; Developed by{" "}
               <a href="https://www.pinch.africa" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                 Pinch Africa Limited
               </a>
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
