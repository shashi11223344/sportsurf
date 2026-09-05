"use client";

import { useEffect, useState } from "react";

interface HeroData {
  title?: string;
  subtitle?: string;
  heroTag?: string;
  imageUrl?: string;
}

interface PageHeaderProps {
  page: string;
  defaultTag: string;
  defaultTitle: React.ReactNode;
  defaultSubtitle?: string;
  align?: "left" | "center";
  titleClassName?: string;
  wrapperClassName?: string;
  subtitleClassName?: string;
}

// Reads the same HeroSection row the admin "Page colours & text" editor
// writes to (page_<slug> tab). Falls back to the original hardcoded copy
// when nothing has been saved yet, so pages look unchanged until an admin
// actually edits them.
export default function PageHeader({
  page,
  defaultTag,
  defaultTitle,
  defaultSubtitle,
  align = "left",
  titleClassName = "font-heading font-extrabold text-4xl md:text-6xl text-ag-text uppercase tracking-tight leading-none",
  wrapperClassName = "space-y-2",
  subtitleClassName = "font-body text-ag-text-muted max-w-xl text-lg",
}: PageHeaderProps) {
  const [hero, setHero] = useState<HeroData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/hero")
      .then((res) => (res.ok ? res.json() : []))
      .then((list: any[]) => {
        if (cancelled) return;
        const match = (list || []).find((h) => h.page === page);
        if (match) setHero(match);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [page]);

  const tag = hero?.heroTag || defaultTag;
  const title = hero?.title || defaultTitle;
  const subtitle = hero?.subtitle ?? defaultSubtitle;

  return (
    <div className={`${wrapperClassName} ${align === "center" ? "text-center" : ""}`}>
      {hero?.imageUrl && (
        <div className={`relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-4 ${align === "center" ? "" : ""}`}>
          <img src={hero.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      )}
      {tag && <span className="text-ag-primary font-extrabold text-[11px] uppercase tracking-widest block">{tag}</span>}
      <h1 className={titleClassName}>{title}</h1>
      {subtitle && (
        <p className={`${subtitleClassName} ${align === "center" ? "mx-auto" : ""}`}>{subtitle}</p>
      )}
    </div>
  );
}
