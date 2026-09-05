import { prisma } from "@/lib/prisma";
import FloatCard from "@/components/ui/FloatCard";
import * as LucideIcons from "lucide-react";

const DynamicIcon = ({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) => {
   const IconComponent = (LucideIcons as any)[name];
   if (!IconComponent) return <LucideIcons.HelpCircle size={size} className={className} />;
   return <IconComponent size={size} className={className} />;
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
   const settings = await prisma.siteSettings.findFirst() || {
     aboutOriginTitle: "THE ORIGIN",
     aboutOriginText: "Today, \"Antigravity\" represents our next evolution — a commitment to physics-driven design that minimizes injury risk and maximizes performance potential.",
     aboutImageUrl: "",
     valuesJson: "[]"
   } as any;

  let values = [];
  try { values = JSON.parse(settings.valuesJson || "[]"); } catch { values = []; }
  if (values.length === 0) {
    values = [
      { title: "PRECISION", icon: "Target", text: "Every millimeter of our turf and flooring is tested for consistent ball bounce and player traction." },
      { title: "PEOPLE", icon: "Users", text: "A team of 50+ certified installers and sports engineers dedicated to zero-gravity performance." },
      { title: "PROTECTION", icon: "Shield", text: "Safety is not an afterthought. Our surfaces feature advanced shock absorption layers." }
    ];
  }

   return (
     <div className="bg-ag-bg overflow-hidden">
       <div className="container mx-auto px-6 space-y-6 md:space-y-8 pt-12 md:pt-16 pb-16 md:pb-24">
         {/* Core Narrative */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="space-y-3">
               <h2 className="font-heading font-black text-ag-lunar text-3xl uppercase tracking-tight leading-none">
                  {settings.aboutOriginTitle?.split(' ')[0]} <span className="text-ag-neon italic">{settings.aboutOriginTitle?.split(' ').slice(1).join(' ')}</span>
               </h2>
               <div className="space-y-3 font-body text-ag-asteroid leading-relaxed text-lg">
                 <p>
                   {settings.aboutOriginText}
                 </p>
               </div>
            </div>
            <div className="aspect-video bg-ag-panel rounded-2xl border border-ag-electric/10 relative overflow-hidden flex items-center justify-center">
               {settings.aboutImageUrl ? (
                  <img src={settings.aboutImageUrl} alt="About SportSurf" className="w-full h-full object-cover" />
               ) : (
                  <LucideIcons.History size={120} className="text-ag-electric/5" />
               )}
               <div className="absolute inset-x-8 bottom-8 flex gap-4">
                  <div className="badge-neon">Est. 2013</div>
                  <div className="badge-neon border-ag-plasma text-ag-plasma bg-ag-plasma/10">ISO Certified</div>
               </div>
            </div>
         </div>

         {/* Values */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {values.map((val: any, i: number) => (
              <FloatCard key={i} delay={i * 0.2} className="text-center">
                 <div className="w-16 h-16 rounded-2xl bg-ag-electric/5 border border-ag-electric/20 flex items-center justify-center mx-auto mb-8">
                    <DynamicIcon name={val.icon} className="text-ag-neon" size={28} />
                 </div>
                 <h3 className="font-heading font-bold text-ag-lunar text-xl mb-4 uppercase tracking-widest">{val.title}</h3>
                 <p className="font-body text-ag-asteroid text-sm leading-relaxed">{val.text}</p>
              </FloatCard>
            ))}
         </div>
       </div>
     </div>
   );
}
