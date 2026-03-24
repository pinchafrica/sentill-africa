import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, ShieldCheck, Activity, Landmark, Mail, Phone, Globe, MapPin, Clock, CheckCircle2, ChevronDown, Building2, FileText, Star, AlertCircle, CreditCard, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import YieldChart from "@/components/YieldChart";
import AccordionItem from "@/components/AccordionItem";

const prisma = new PrismaClient();

function ShieldAlert(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>;
}

const typeColors: Record<string, string> = {
  MMF: "emerald", Bond: "blue", "T-Bill": "amber", SACCO: "violet", Pension: "rose",
};

export default async function ProviderDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = await prisma.provider.findUnique({ where: { slug } });
  if (!provider) notFound();

  const history = JSON.parse(provider.history3Year);
  const highlights: string[] = JSON.parse(provider.highlights || "[]");
  const applySteps: { step: number; title: string; detail: string }[] = JSON.parse(provider.applySteps || "[]");
  const faqs: { q: string; a: string }[] = JSON.parse(provider.faqs || "[]");
  const offices: { city: string; address: string; phone: string; hours: string }[] = JSON.parse(provider.officeLocations || "[]");
  const accountTypes: { name: string; min: string; features: string[] }[] = JSON.parse(provider.accountTypes || "[]");

  const color = typeColors[provider.type] || "emerald";

  return (
    <div className="min-h-screen bg-slate-50/30">

      {/* ── TOP HERO STRIP ── */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/markets/providers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-400 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Registry
          </Link>
          <div className="grid lg:grid-cols-2 gap-16 items-center pb-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 bg-${color}-600 rounded-[1.5rem] flex items-center justify-center shadow-xl`}>
                  <Landmark className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                    {provider.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-400 px-3 py-1 bg-${color}-400/10 rounded-full`}>{provider.type}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Since {provider.inceptionDate}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest text-emerald-400`}>{provider.regulatedBy}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{provider.description}</p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Current Yield", value: `${provider.currentYield}%`, sub: "Per Annum (Gross)" },
                { label: "Assets Under Mgmt", value: provider.aum, sub: "Total Fund Size" },
                { label: "Min. Investment", value: provider.minimumInvest || "KES 1,000", sub: "Entry Point" },
                { label: "Risk Level", value: provider.riskLevel, sub: "Risk Classification" },
              ].map((s, i) => (
                <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-3xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{s.label}</span>
                  <span className="text-2xl font-black text-white block tracking-tight">{s.value}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">

        {/* ── QUICK ACTION BAR ── */}
        <div className="flex flex-wrap gap-4">
          {provider.website && (
            <a href={provider.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
              <Globe className="w-4 h-4" /> Visit Official Website
            </a>
          )}
          {provider.phone && (
            <a href={`tel:${provider.phone}`}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <Phone className="w-4 h-4 text-emerald-600" /> {provider.phone}
            </a>
          )}
          {provider.email && (
            <a href={`mailto:${provider.email}`}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <Mail className="w-4 h-4 text-emerald-600" /> {provider.email}
            </a>
          )}
          {provider.paybill && provider.paybill !== "N/A" && (
            <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-widest rounded-2xl">
              <CreditCard className="w-4 h-4" /> M-Pesa Paybill: {provider.paybill}
            </div>
          )}
          {provider.isHalal && (
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-2xl">
              <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" /> Shariah Compliant
            </div>
          )}
        </div>

        {/* ── HIGHLIGHTS + CHART ── */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Highlights */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Key Highlights</h2>
            </div>
            <ul className="space-y-4">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-slate-700 font-bold leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="mb-4 space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Intelligence</span>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">36-Month Historical Yield</h3>
            </div>
            <div className="h-[280px]">
              <YieldChart data={history} label={provider.name} />
            </div>
          </div>
        </div>

        {/* ── TAX NOTES ── */}
        {provider.taxNotes && (
          <div className="p-8 rounded-[2.5rem] bg-amber-50 border border-amber-100 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tax & Withholding Notes</h2>
            </div>
            <p className="text-xs text-slate-600 font-bold leading-relaxed">{provider.taxNotes}</p>
          </div>
        )}

        {/* ── ACCOUNT TYPES ── */}
        {accountTypes.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Account Types & Plans</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accountTypes.map((acc, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-lg transition-all space-y-5">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">{acc.name}</h3>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Min: {acc.min}</span>
                  </div>
                  <ul className="space-y-2">
                    {acc.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="text-[11px] text-slate-600 font-bold">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOW TO APPLY ── */}
        {applySteps.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">How to Apply — Step by Step</h2>
            </div>
            <div className="space-y-4">
              {applySteps.map((s, i) => (
                <div key={i} className="flex gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group">
                  <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 transition-colors">
                    <span className="text-white font-black text-sm">{s.step}</span>
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.title}</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQs ── */}
        {faqs.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem key={i} question={f.q} answer={f.a} />
              ))}
            </div>
          </div>
        )}

        {/* ── OFFICE LOCATIONS ── */}
        {offices.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Office Locations & Contact</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offices.map((o, i) => (
                <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-lg transition-all space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{o.city}</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600 font-bold leading-relaxed">{o.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <a href={`tel:${o.phone}`} className="text-[11px] text-slate-600 font-bold hover:text-emerald-600 transition-colors">{o.phone}</a>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-500 font-bold">{o.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DISCLAIMER ── */}
        <div className="p-8 bg-slate-100 border border-slate-200 rounded-[2.5rem] space-y-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-slate-600" />
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Institutional Yield Disclosure</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
            Sentill Africa is an independent data intelligence platform. We do not accept, manage, or process investment capital.
            Historical performance does not guarantee future results. All investments carry market risk. Verify all PayBill/Till numbers
            and contact details directly with the institution before transacting. Do not share your M-Pesa PIN with anyone.
            Regulated by: {provider.regulatedBy}.
          </p>
        </div>

      </div>
    </div>
  );
}
