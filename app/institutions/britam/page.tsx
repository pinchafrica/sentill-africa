import { PrismaClient } from "@prisma/client";
import { ShieldCheck, Info, Globe, Mail, Phone, ArrowLeft, Activity, TrendingUp, Landmark, Star } from "lucide-react";
import Link from "next/link";
import ProviderCard from "@/components/ProviderCard";

const prisma = new PrismaClient();

export default async function BritamInstitutionPage() {
  const providers = await prisma.provider.findMany({
    where: { 
      OR: [
        { name: { contains: "Britam" } },
        { slug: { contains: "britam" } }
      ]
    },
    orderBy: { currentYield: 'desc' }
  });

  return (
    <div className="min-h-screen py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
                 <Star className="w-3 h-3" /> Core Partner
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] font-heading">
                Britam <br /> <span className="text-slate-200">Holdings.</span>
              </h1>
              <p className="text-lg text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                A leading diversified financial services group in the region. Listed on the Nairobi Securities Exchange, Britam offers a wide range of investment and insurance solutions.
              </p>
              
              <div className="flex flex-wrap gap-4">
                 <a href="https://britam.com" target="_blank" className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 hover:bg-emerald-600 transition-all">
                    <Globe className="w-4 h-4" /> Official Website
                 </a>
                 <div className="flex items-center gap-6 px-4">
                    <div className="flex items-center gap-2">
                       <Mail className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black uppercase text-slate-400">info@britam.com</span>
                    </div>
                 </div>
              </div>
           </div>
           <div className="relative group">
               <div className="absolute inset-0 bg-blue-500 rounded-[3rem] translate-x-3 translate-y-3 -z-10 blur-3xl opacity-20 group-hover:opacity-30 transition-all" />
               <div className="aspect-[4/3] rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2400&auto=format&fit=crop" 
                    alt="Britam Institutional Leadership" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
               </div>
            </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm">
                 <TrendingUp className="w-8 h-8 text-blue-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total AUM</span>
                 <span className="text-2xl font-black text-slate-900 block">KES 150B+</span>
              </div>
              <div className="p-8 bg-slate-900 rounded-[2.5rem] space-y-4 text-white">
                 <ShieldCheck className="w-8 h-8 text-blue-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Regulatory Status</span>
                 <span className="text-2xl font-black block">SASRA/CMA</span>
              </div>
           </div>
        </div>

        {/* Product Registry */}
        <div className="space-y-12">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                 <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight font-heading">Institutional Portfolio</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Verified Regulated Solutions by Britam</p>
              </div>
              <div className="bg-slate-50 px-6 py-2 rounded-full border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 {providers.length} Live Registries
              </div>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} />
              ))}
           </div>
        </div>

        {/* About/History */}
        <div className="p-16 rounded-[4rem] bg-slate-50 border border-slate-100 space-y-8">
           <div className="max-w-3xl space-y-6">
              <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tight font-heading">Regional Presence</h3>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-loose">
                Britam has a strong presence across East and Central Africa, providing millions of customers with financial security through innovative asset management and insurance products. Their specialized funds are among the most respected in the Kenyan market.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
