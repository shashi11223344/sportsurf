"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Calendar, LayoutGrid, CheckCircle2, ArrowLeft, Share2, ClipboardList } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Lazy-loads lucide-react's full icon set only when a custom deliverable icon is needed,
// instead of bundling all ~1300 icons into this page's initial client JS.
const iconCache: Record<string, any> = {};
function resolveIcon(name?: string) {
  const key = name || "CheckCircle2";
  if (!iconCache[key]) {
    iconCache[key] = dynamic(() =>
      import("lucide-react").then((mod) => (mod as any)[key] || mod.CheckCircle2)
    );
  }
  return iconCache[key];
}

const DynamicIcon = ({ name, size = 20, className = "" }: { name?: string; size?: number; className?: string }) => {
  const Icon = resolveIcon(name);
  return <Icon size={size} className={className} />;
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        const found = Array.isArray(data) ? data.find((item) => item.id === id) : null;
        setProject(found || null);
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-12 min-h-screen bg-ag-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-ag-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-12 min-h-screen flex flex-col items-center justify-center space-y-4 bg-ag-bg">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <Link href="/projects" className="text-ag-primary hover:underline">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="pt-12 bg-ag-bg min-h-screen pb-20">
      <div className="container-retail">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-bold text-ag-text-muted hover:text-ag-primary transition-colors uppercase tracking-widest mb-12"
        >
          <ArrowLeft size={14} />
          Back to Portfolio
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="bg-ag-primary/10 text-ag-primary text-[10px] font-bold px-3 py-1 rounded">Case Study</span>
                 <span className="text-ag-text-muted text-[10px] font-bold uppercase tracking-widest">Completed in {project.year}</span>
              </div>
              <h1 className="font-heading font-extrabold text-4xl md:text-7xl text-ag-text uppercase tracking-tight leading-none">
                {project.name}
              </h1>
              <div className="flex flex-wrap gap-6 items-center pt-4">
                 <div className="flex items-center gap-2 text-ag-text-muted">
                    <MapPin size={18} className="text-ag-primary" />
                    <span className="text-sm font-bold uppercase tracking-wide">{project.city}, {project.state}</span>
                 </div>
                 <div className="flex items-center gap-2 text-ag-text-muted">
                    <LayoutGrid size={18} className="text-ag-primary" />
                    <span className="text-sm font-bold uppercase tracking-wide">{project.area} Area</span>
                 </div>
              </div>
            </div>

            <div className="aspect-video bg-ag-bg-alt border border-ag-border rounded-3xl relative overflow-hidden flex items-center justify-center">
               {project.imageUrl ? (
                 <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="text-ag-text-muted/10 font-heading font-black text-9xl italic uppercase select-none">
                    {project.surface?.split(' ')[0] || 'P'}
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-ag-bg/80 to-transparent" />
               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Surface Specification</p>
                     <p className="text-xl font-bold text-white uppercase">{project.surface}</p>
                  </div>
                  <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                     <Share2 size={20} />
                  </button>
               </div>
            </div>

            <div className="space-y-8">
              <h2 className="font-heading font-black text-3xl text-ag-text uppercase tracking-tight">Project <span className="text-ag-primary">Deliverables</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  let raw: any[] = [];
                  try {
                    raw = JSON.parse(project.deliverablesJson || "[]");
                    if (raw.length === 0) throw new Error();
                  } catch {
                    raw = [
                      "Site Survey & Grading",
                      "Sub-base engineering",
                      "Surface installation",
                      "Line marking & Grooming",
                      "Safety Certification",
                      "Maintenance protocol handover"
                    ];
                  }
                  // Supports both plain strings and { icon, title } objects
                  return raw.map((entry) =>
                    typeof entry === "string" ? { title: entry } : entry
                  );
                })().map((item, i) => (
                  <div key={i} className="flex gap-4 items-center p-5 bg-white border border-ag-border rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-ag-primary/5 flex items-center justify-center text-ag-primary">
                       <DynamicIcon name={item.icon} size={20} />
                    </div>
                    <span className="text-sm font-bold text-ag-text-muted uppercase tracking-wide">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
             <div className="retail-card p-8 bg-ag-bg-alt border-ag-primary/20">
                <h3 className="font-heading font-black text-ag-text text-xl uppercase tracking-tighter mb-6">Expertise Applied</h3>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 rounded bg-white flex items-center justify-center border border-ag-border text-ag-primary">
                         <Calendar size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-ag-text-muted uppercase tracking-widest leading-none mb-1">Duration</p>
                         <p className="text-sm font-bold text-ag-text">{project.duration || "45 Days to Handover"}</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-12 h-12 rounded bg-white flex items-center justify-center border border-ag-border text-ag-primary">
                         <ClipboardList size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-ag-text-muted uppercase tracking-widest leading-none mb-1">Standard</p>
                         <p className="text-sm font-bold text-ag-text">{project.standard || "International Pro Grade"}</p>
                      </div>
                   </div>
                </div>
                <div className="mt-10 pt-8 border-t border-ag-border">
                   <Link href="/quote" className="btn btn-primary w-full py-4 text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                      Start Similar Project
                   </Link>
                </div>
             </div>

             <div className="retail-card p-8 bg-ag-primary text-white text-center">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-4">Quality Checked</p>
                <div className="font-heading font-black text-4xl mb-4 italic">100%</div>
                <p className="text-xs font-body text-white/80 leading-relaxed uppercase tracking-widest">
                   Compliant with all safety and performance benchmarks for surface sports.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
