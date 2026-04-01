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
  MessageCircle,
  Info
} from 'lucide-react';

const WA_LINK = "https://wa.me/254703469525?text=Hello%20Sentill%2C%20I'd%20like%20to%20learn%20more%20about%20investment%20options%20in%20Kenya.";

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
            Kenya&apos;s premier wealth intelligence information hub. Precision data for the ambitious African investor.
          </p>
          <div className="flex gap-3">
            <a 
              href={WA_LINK}
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center hover:bg-[#20BD5A] transition-colors shadow-lg shadow-emerald-500/20"
              aria-label="WhatsApp"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
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

        {/* Support & Legal with WhatsApp */}
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
            <a href="tel:+254703469525" className="flex items-center gap-3 text-slate-500 hover:text-blue-500 transition-colors">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold uppercase">+254 703 469 525</span>
            </a>
          </div>
          
          {/* WhatsApp CTA */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#25D366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#20BD5A] transition-all shadow-lg shadow-emerald-500/10 group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Get Info via WhatsApp
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-6 mt-24 pt-12 border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            {/* Information Hub Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Information Hub Only — Not a Financial Advisor</span>
            </div>
            
            <div className="bg-slate-900/50 rounded-3xl p-8 border border-white/5">
              <div className="flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                <div>
                  <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2">Institutional Disclaimer</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase">
                    Sentill Africa is a non-custodial information hub. We do not hold, manage, or process any capital or investments.
                    All data is provided for informational purposes only. Investment carries inherent risk. 
                    Always verify data and consult licensed CMA/SASRA institutions before making investment decisions.
                  </p>
                </div>
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
