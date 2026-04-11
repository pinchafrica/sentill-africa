"use client";

import { QrCode, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

// Pre-encoded WhatsApp QR for wa.me/254703469525
// This SVG path encodes the direct WhatsApp link
const WA_NUMBER = "254703469525";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Hi%20Sentill!%20I%20want%20to%20start%20investing.`;

export default function WhatsAppQRWidget() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="relative">
      {/* Compact floating pill */}
      {!showQR && (
        <button
          onClick={() => setShowQR(true)}
          className="group flex items-center gap-3 px-5 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest">Chat on WhatsApp</p>
            <p className="text-[9px] font-bold opacity-80">+{WA_NUMBER}</p>
          </div>
          <QrCode className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* QR Code Card */}
      {showQR && (
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 text-center w-[240px]">
          <button
            onClick={() => setShowQR(false)}
            className="absolute top-3 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold"
          >×</button>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-[#25D366] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Sentill Africa</p>
          </div>

          {/* QR rendered via Google Charts API — works without any library */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(WA_LINK)}&margin=4&color=000000&bgcolor=ffffff`}
            alt="Scan to open Sentill on WhatsApp"
            className="w-40 h-40 mx-auto rounded-xl border border-slate-100"
            width={160}
            height={160}
          />

          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 mb-3">
            Scan with your phone camera
          </p>

          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
          >
            Open in WhatsApp <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
