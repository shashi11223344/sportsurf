import { prisma } from "@/lib/prisma";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await prisma.siteSettings.findFirst() || {
    privacyIntro: "At SportSurf Antigravity, we prioritize the protection of your intellectual property and project data.",
    privacySectionsJson: "[]",
  } as any;

  let sections = [] as any[];
  try {
    sections = JSON.parse(settings.privacySectionsJson || "[]");
  } catch {
    sections = [];
  }

  if (sections.length === 0) {
    sections = [
      {
        id: "overview",
        title: "1. Data Stewardship",
        icon: "ShieldCheck",
        body: [
          "SportSurf (\"we\", \"our\", or \"us\") operates the Antigravity platform. This policy informs you of our practices regarding the collection, use, and disclosure of personal data when you use our Service.",
          "We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy."
        ],
        list: []
      },
      {
        id: "data-collection",
        title: "2. Information Collection",
        icon: "Lock",
        body: [
          "While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (\"Personal Data\")."
        ],
        list: [
          "Email address",
          "First name and last name",
          "Phone number",
          "Address, State, Province, ZIP/Postal code, City",
          "Project site coordinates and dimensions"
        ]
      },
      {
        id: "security",
        title: "3. Data Security",
        icon: "Eye",
        body: [
          "The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure.",
          "We strive to use commercially acceptable means to protect your Personal Data, including SSL encryption and restricted database access for mission-critical infrastructure data."
        ],
        list: []
      }
    ];
  }

  const IconMap: any = { ShieldCheck, Lock, Eye, FileText };

  return (
    <div className="pt-12     bg-ag-bg min-h-screen  pb-32">
      <div className="container-retail">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <span className="text-ag-primary font-extrabold text-[11px] uppercase tracking-widest">Legal Documentation</span>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-ag-text uppercase tracking-tight mt-2">
              Privacy <span className="text-ag-primary">Policy</span>
            </h1>
            <p className="font-body text-ag-text-muted mt-6 text-lg max-w-2xl">
              {settings.privacyIntro}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1 border-r border-ag-border pr-8 hidden lg:block">
               <nav className="sticky top-80 space-y-6">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-ag-primary uppercase tracking-[0.2em]">Navigation</p>
                     <ul className="space-y-4">
                        {["Overview", "Data Collection", "User Rights", "Security", "Contact"].map((item) => (
                          <li key={item}>
                             <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm font-bold text-ag-text-muted hover:text-ag-primary transition-colors uppercase tracking-wider">{item}</a>
                          </li>
                        ))}
                     </ul>
                  </div>
               </nav>
            </div>

            <div className="lg:col-span-3 space-y-16">
              {sections.map((section: any, index: number) => {
                const Icon = IconMap[section.icon] || FileText;
                return (
                  <section key={section.id || index} id={section.id || `section-${index}`} className="space-y-6">
                    <h2 className="font-heading font-bold text-2xl text-ag-text uppercase tracking-tight flex items-center gap-3">
                       <Icon className="text-ag-primary" size={24} />
                       {section.title}
                    </h2>
                    <div className="font-body text-ag-text-muted text-base leading-relaxed space-y-4">
                      {(section.body || []).map((paragraph: string, pIndex: number) => (
                        <p key={`${section.id}-p-${pIndex}`}>{paragraph}</p>
                      ))}
                      {section.list && section.list.length > 0 && (
                        <ul className="list-disc pl-5 space-y-2">
                          {section.list.map((item: string, itemIndex: number) => (
                            <li key={`${section.id}-li-${itemIndex}`}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                );
              })}

              <div className="p-8 bg-ag-bg-alt border border-ag-border rounded-2xl flex gap-6 items-start">
                 <div className="p-3 bg-ag-primary/10 rounded-xl text-ag-primary shrink-0">
                    <FileText size={24} />
                 </div>
                 <div className="space-y-2">
                    <h4 className="font-heading font-bold text-ag-text uppercase tracking-tight">Questions about Privacy?</h4>
                    <p className="font-body text-ag-text-muted text-sm">
                       Our legal team is available for detailed compliance inquiries at <b>legal@sportsurf.in</b>.
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
