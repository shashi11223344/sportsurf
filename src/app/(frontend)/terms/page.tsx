import { prisma } from "@/lib/prisma";
import { FileText, Gavel, AlertCircle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await prisma.siteSettings.findFirst() || {
    termsIntro: "By accessing the Antigravity platform, you agree to comply with our sports infrastructure standards and legal framework.",
    termsSectionsJson: "[]",
  } as any;

  let sections = [] as any[];
  try {
    sections = JSON.parse(settings.termsSectionsJson || "[]");
  } catch {
    sections = [];
  }

  if (sections.length === 0) {
    sections = [
      {
        id: "terms-of-use",
        title: "1. Terms of Use",
        icon: "Gavel",
        body: [
          "By accessing this website, you are agreeing to be bound by these web site Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.",
          "If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this web site are protected by applicable copyright and trade mark law."
        ],
        checklist: []
      },
      {
        id: "project-quotations",
        title: "2. Project Quotations",
        icon: "FileText",
        body: [
          "All quotations generated through our platform are preliminary and subject to physical site verification by our technical team."
        ],
        checklist: [
          "Quote validity: 15 days",
          "Site access requirements",
          "Sub-base readiness clauses",
          "Material logistics terms"
        ]
      },
      {
        id: "disclaimer",
        title: "3. Disclaimer",
        icon: "AlertCircle",
        body: [
          "The materials on SportSurf&apos;s web site are provided &quot;as is&quot;. SportSurf makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
        ],
        checklist: []
      }
    ];
  }

  const IconMap: any = { FileText, Gavel, AlertCircle, CheckCircle2 };

  return (
    <div className="pt-12     bg-ag-bg min-h-screen  pb-32">
      <div className="container-retail">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <span className="text-ag-primary font-extrabold text-[11px] uppercase tracking-widest">User Agreement</span>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-ag-text uppercase tracking-tight mt-2">
              Terms of <span className="text-ag-primary">Service</span>
            </h1>
            <p className="font-body text-ag-text-muted mt-6 text-lg max-w-2xl">
              {settings.termsIntro}
            </p>
          </div>

          <div className="retail-card p-10 md:p-16 space-y-12">
             {sections.map((section: any, index: number) => {
               const Icon = IconMap[section.icon] || Gavel;
               return (
                 <section key={section.id || index} className="space-y-6">
                    <h2 className="font-heading font-bold text-2xl text-ag-text uppercase tracking-tight flex items-center gap-3">
                       <Icon className="text-ag-primary" size={24} />
                       {section.title}
                    </h2>
                    <div className="font-body text-ag-text-muted text-base leading-relaxed space-y-4">
                       {(section.body || []).map((paragraph: string, pIndex: number) => (
                         <p key={`${section.id}-p-${pIndex}`}>{paragraph}</p>
                       ))}
                       {section.checklist && section.checklist.length > 0 && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                           {section.checklist.map((item: string, i: number) => (
                             <div key={`${section.id}-chk-${i}`} className="flex gap-3 items-center p-4 bg-ag-bg-alt rounded-lg border border-ag-border">
                                <CheckCircle2 size={16} className="text-ag-primary" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{item}</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </section>
               );
             })}

             <div className=" border-t border-ag-border">
                <p className="font-body text-[10px] text-ag-text-muted font-bold text-center uppercase tracking-[0.3em]">
                   Last Updated: March 2024 • Gurgaon, India
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
