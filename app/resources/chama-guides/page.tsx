import { ShieldCheck, Info, Users, Landmark, FileText, ArrowLeft, ArrowRight, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ChamaGuidesPage() {
  const steps = [
    { title: "Constitution Drafting", desc: "Define rules, membership, and withdrawal penalties.", icon: FileText },
    { title: "KRA PIN Registration", desc: "Formalize your Chama for institutional banking.", icon: ShieldCheck },
    { title: "Shared Portfolio Setup", desc: "Select MMFs or Bonds with joint signatory access.", icon: Landmark },
  ];

  return (
    <div className="min-h-screen py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
                 <Users className="w-3 h-3" /> Community Wealth
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] font-heading">
                Chama <br /> <span className="text-slate-200">Guides.</span>
              </h1>
              <p className="text-lg text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Grow faster together. Our Chama Guides provide the legal and financial framework to turn your social group into a wealth-building powerhouse.
              </p>
              
              <button className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl flex items-center gap-3">
                 Download Constitution Template <ArrowRight className="w-4 h-4" />
              </button>
           </div>
                      <div className="relative group">
               <div className="absolute inset-0 bg-blue-500/20 rounded-[3.5rem] blur-3xl -z-10 group-hover:bg-emerald-500/20 transition-all duration-1000" />
               <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-2xl relative">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt="African Chama Leadership Group"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-12 left-12 right-12 space-y-4">
                     <h3 className="text-3xl font-black text-white uppercase tracking-tight font-heading leading-none">Collaborative <br /> Wealth.</h3>
                     <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest max-w-[200px]">Strategic social investing for the modern African enterprise.</p>
                  </div>
               </div>
            </div>
         </div>

        {/* Institutional Partners for Chamas */}
        <div className="space-y-12">
           <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight font-heading">Chama Friendly Institutions</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Providers with specialized group accounts</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { name: "Old Mutual Chama Fund", yield: "15.5%", icon: Landmark },
                { name: "Britam Group Portfolio", yield: "14.8%", icon: TrendingUp },
              ].map((item, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] border border-slate-100 bg-white flex items-center justify-between group hover:border-emerald-200 transition-all">
                   <div className="space-y-2">
                      <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest block">{item.name}</span>
                      <div className="flex items-center gap-2">
                         <Activity className="w-3 h-3 text-emerald-500" />
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.yield} Yield</span>
                      </div>
                   </div>
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
}
