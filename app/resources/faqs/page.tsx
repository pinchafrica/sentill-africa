"use client";

import { useState } from "react";
import { Plus, Minus, Landmark, ShieldCheck, Mail, MessageCircle, Info, ArrowLeft, BookOpen, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";
import AccordionItem from "@/components/AccordionItem";

const faqCategories = [
  {
    label: "Sentill Platform",
    icon: Landmark,
    color: "emerald",
    items: [
      {
        q: "Is Sentill Africa a licensed bank or fund manager?",
        a: "No. Sentill Africa is an independent WealthTech Knowledge Hub and data intelligence platform. We do not accept, hold, or process investment capital. We aggregate and present institutional data from CMA-regulated entities so Kenyan investors can make informed decisions."
      },
      {
        q: "How do I know the listed yields are accurate?",
        a: "We aggregate data directly from official fund quarterly reports, Central Bank of Kenya auction results, and real-time computation tables provided by fund managers. Yields are updated weekly. We always recommend verifying the final rate directly with the provider before transacting."
      },
      {
        q: "Is Sentill Africa free to use?",
        a: "Yes. The core Sentill platform — including provider directories, yield comparisons, and market intelligence — is 100% free. Our Pro tier unlocks AI projections, yield alerts, and advanced portfolio modelling at KES 490/month — less than KES 16/day."
      },
      {
        q: "How do I report a provider that is unlicensed or acting fraudulently?",
        a: "Report directly to the Capital Markets Authority (CMA) at www.cma.or.ke or call +254 722 207 767. You can also use our Scam Checker tool to verify any entity before investing."
      },
    ],
  },
  {
    label: "Money Market Funds",
    icon: TrendingUp,
    color: "blue",
    items: [
      {
        q: "What is a Money Market Fund (MMF)?",
        a: "An MMF is a CMA-regulated pooled investment vehicle that invests in short-term, high-quality debt instruments such as treasury bills, commercial paper, and fixed deposits. They offer daily interest accrual, high liquidity, and yields that significantly outperform bank savings accounts."
      },
      {
        q: "Can I withdraw my money from an MMF instantly?",
        a: "Most MMFs in Kenya offer T+2 liquidity (within 48 hours). However, some providers (like Lofty Corban and Etica) offer instant M-Pesa withdrawals for amounts up to KES 300,000 per day. Larger amounts typically require 2-3 business days."
      },
      {
        q: "How is the MMF yield taxed?",
        a: "MMF returns are subject to a 15% Withholding Tax (WHT), which is deducted by the fund manager before distributions. For example, if a fund's gross yield is 17%, your net yield after WHT is approximately 14.45%. This is automatically handled — you receive the net amount."
      },
      {
        q: "What is the minimum investment for an MMF?",
        a: "Minimums vary by provider. Lofty Corban accepts as little as KES 500, while most major funds like Sanlam and NCBA start at KES 1,000. Infrastructure Bonds and T-Bills typically require a minimum of KES 50,000–100,000."
      },
    ],
  },
  {
    label: "Government Securities",
    icon: ShieldCheck,
    color: "amber",
    items: [
      {
        q: "What are Kenya's Infrastructure Bonds and why are they tax-free?",
        a: "Infrastructure Bonds (IFBs) are sovereign bonds issued by the Republic of Kenya specifically to fund infrastructure projects. Under the Income Tax Act (Cap 470), interest earned from IFBs is 100% exempt from withholding tax. This means the gross yield (e.g., 18.46%) is your actual take-home yield, making them among the highest net-return instruments in Kenya."
      },
      {
        q: "What is the difference between Treasury Bills and Treasury Bonds?",
        a: "T-Bills are short-term (91, 182, or 364 days) zero-coupon securities — you buy at a discount and receive full face value at maturity. T-Bonds are medium-to-long-term (2–30 years) fixed coupon instruments that pay semi-annual interest and can be traded on the NSE secondary market."
      },
      {
        q: "How do I buy government bonds in Kenya?",
        a: "You can purchase T-Bills and Bonds directly through the Central Bank of Kenya's DhowCSD platform (www.cbk.go.ke), through a licensed stocks broker on the NSE, or through a fund manager who pools investor capital for bond purchases. The minimum is KES 50,000 for T-Bills and KES 100,000 for bonds."
      },
      {
        q: "Are government securities safe?",
        a: "Yes. Government securities (T-Bills and Bonds) carry zero credit risk as they are backed by the full faith and credit of the Republic of Kenya. They are considered the safest investment instruments in the country, underpinning the benchmark yields for all other asset classes."
      },
    ],
  },
  {
    label: "SACCOs & Cooperatives",
    icon: BookOpen,
    color: "violet",
    items: [
      {
        q: "What is a SACCO and how does it differ from an MMF?",
        a: "A SACCO (Savings and Credit Cooperative Organization) is a member-owned financial cooperative regulated by SASRA (Sacco Societies Regulatory Authority). Unlike MMFs, SACCOs also provide loan facilities to members. Dividends are paid annually and are based on the SACCO's financial performance rather than daily market rates."
      },
      {
        q: "Which SACCOs are safest to invest in?",
        a: "SASRA categorizes SACCOs into Tier 1 (largest, most regulated), Tier 2, and Tier 3. Tier-1 SACCOs like Stima SACCO, Mwalimu National, and Kenya Police SACCO are the safest options. Always verify a SACCO's SASRA registration at www.sasra.go.ke before investing."
      },
      {
        q: "What are SACCO dividends and how are they calculated?",
        a: "SACCO dividends are your share of the organization's annual profits, paid proportionally to your shareholding. Top SACCOs have consistently paid 12–15%+ annual dividends over the past decade. You also earn interest on deposits (typically 8–10%) and benefit from discounted loan rates."
      },
      {
        q: "Can I join Stima or Mwalimu SACCO if I'm not a government employee?",
        a: "Sector-specific SACCOs like Stima (energy workers) and Mwalimu (teachers) have membership criteria. However, Unaitas and several other Tier-1 SACCOs are open-membership cooperatives welcoming any Kenyan citizen. Check each SACCO's eligibility requirements directly."
      },
    ],
  },
  {
    label: "Security & Scams",
    icon: AlertTriangle,
    color: "rose",
    items: [
      {
        q: "What is the 'Institutional Interceptor' feature?",
        a: "The Institutional Interceptor is Sentill's safety mechanism that displays the ONLY verified official PayBill or Till Number for each provider before any investment directive. It is designed to prevent you from sending capital to fraudulent entities impersonating licensed fund managers."
      },
      {
        q: "How do I verify if a fund manager is CMA-licensed?",
        a: "Visit the official CMA Kenya website at www.cma.or.ke and navigate to the 'Regulated Entities' section. All licensed fund managers, unit trusts, and stockbrokers are listed there. If an entity doesn't appear, do not invest. You can also use Sentill's Scam Checker at /resources/scam-checker."
      },
      {
        q: "What should I do if I suspect I've been defrauded?",
        a: "1. Do NOT send any more funds. 2. Report to CMA (+254 722 207 767), Directorate of Criminal Investigations (DCI), and your bank immediately. 3. File a report on the CMA investor complaints portal. 4. Alert Sentill so we can flag the entity on our platform."
      },
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const cat = faqCategories[activeCategory];

  return (
    <div className="min-h-screen py-32 px-6 bg-slate-50/50">
      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        {/* Header */}
        <div className="text-center space-y-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">
                <Info className="w-3.5 h-3.5" /> Knowledge Intelligence
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] font-heading">
             Investor <br /> <span className="text-slate-200">FAQs.</span>
           </h1>
           <p className="max-w-xl mx-auto text-lg text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
             Everything you need to know about investing in Kenya, explained without the jargon.
           </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-3 flex-wrap justify-center">
          {faqCategories.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeCategory === i ? "bg-slate-950 text-white shadow-xl" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              <c.icon className="w-3.5 h-3.5" /> {c.label}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-4 bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">{cat.label}</h2>
          {cat.items.map((f, i) => (
            <AccordionItem key={i} question={f.q} answer={f.a} />
          ))}
        </div>

        {/* Support Grid */}
        <div className="grid md:grid-cols-2 gap-8">
           <div className="p-12 rounded-[3rem] bg-emerald-600 space-y-8 text-white relative overflow-hidden group shadow-2xl shadow-emerald-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                 <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-4 relative z-10">
                 <h3 className="text-3xl font-black uppercase tracking-tight font-heading leading-none">Instant <br /> Help.</h3>
                 <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-80">
                   Our Nairobi-based support team is active 24/7 to help you navigate any investment question.
                 </p>
              </div>
              <Link href="https://wa.me/254703469525" target="_blank" className="inline-flex px-10 py-5 bg-white text-emerald-600 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all shadow-xl">
                Open WhatsApp Support
              </Link>
           </div>

           <div className="p-12 rounded-[3.5rem] bg-slate-900 border border-slate-800 space-y-8 shadow-2xl shadow-slate-900/40">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                 <Mail className="w-8 h-8 text-slate-500" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tight font-heading leading-none">Partnership <br /> Desk.</h3>
                 <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                   Are you a licensed fund manager wishing to list your verified institutional data on Sentill?
                 </p>
              </div>
              <Link href="mailto:hello@sentill.africa" className="inline-flex px-10 py-5 bg-slate-800 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all border border-slate-700 w-full text-center items-center justify-center">
                Email Nairobi HQ
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
}
