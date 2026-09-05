"use client";

import { useState, useEffect } from "react";
import { MapPin, LayoutGrid, ArrowRight } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export default function ProjectsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then(res => res.json())
      .then(data => setList(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-12      min-h-screen bg-ag-bg flex items-center justify-center ">
        <div className="w-8 h-8 rounded-full border-2 border-ag-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-12   bg-ag-bg min-h-screen pb-20"> {/* Removed  as global layout handle this */}
      <div className="container-retail space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <PageHeader
              page="projects"
              defaultTag="Our Global Footprint"
              defaultTitle={<>Landmark <span className="text-ag-primary">Installations</span></>}
              defaultSubtitle="Explore our portfolio of 500+ missions delivered across India."
              titleClassName="font-heading font-extrabold text-3xl md:text-6xl text-ag-text uppercase tracking-tight leading-none"
            />
            <div className="pb-2">
               <span className="text-xs font-bold text-ag-text-muted uppercase tracking-widest border-b-2 border-ag-primary">All Projects</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {list.map((project) => (
             <Link key={project.id} href={`/projects/${project.id}`} className="retail-card group flex flex-col hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-[16/10] bg-ag-bg-alt relative overflow-hidden flex items-center justify-center">
                   {project.imageUrl ? (
                     <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 duration-700 transition-transform" />
                   ) : (
                     <div className="w-full h-full bg-ag-border/20 flex items-center justify-center text-ag-text-muted/10 font-heading font-black text-6xl italic animate-pulse">
                        {project.surface ? project.surface.charAt(0) : "P"}
                     </div>
                   )}
                   <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm border border-ag-border text-ag-text font-bold text-[9px] px-3 py-1 rounded shadow-sm">
                         {project.year}
                      </span>
                   </div>
                </div>

                <div className="p-6 flex flex-col flex-1 space-y-4">
                   <div className="flex items-center gap-2 text-ag-text-muted">
                      <MapPin size={14} className="text-ag-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{project.city}, {project.state}</span>
                   </div>
                   
                   <div>
                      <h3 className="font-body font-bold text-xl text-ag-text group-hover:text-ag-primary transition-colors leading-tight">
                        {project.name}
                      </h3>
                      <p className="text-xs text-ag-text-muted font-bold mt-2 uppercase tracking-wide">
                        Infrastructure: <span className="text-ag-text">{project.surface}</span>
                      </p>
                   </div>

                   <div className="pt-6 mt-auto border-t border-ag-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <LayoutGrid size={14} className="text-ag-text-muted" />
                         <span className="text-[10px] font-bold text-ag-text-muted uppercase">{project.area}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-ag-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                         VIEW CASE STUDY
                         <ArrowRight size={12} />
                      </span>
                   </div>
                </div>
             </Link>
           ))}
        </div>

        {/* Lead Generation Box */}
        <div className="p-12 bg-ag-bg-alt border border-ag-border rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-sm">
           <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-ag-text text-2xl uppercase tracking-tighter">Your Project Could Be Next</h2>
              <p className="font-body text-ag-text-muted text-sm max-w-md">
                 Join our portfolio of professional sports arenas. We provide full consultation, design, and installation services.
              </p>
           </div>
           <Link href="/contact" className="btn btn-primary px-10 py-4 text-sm uppercase tracking-widest shadow-lg shadow-ag-primary/20">
              Request Site Visit
           </Link>
        </div>
      </div>
    </div>
  );
}
