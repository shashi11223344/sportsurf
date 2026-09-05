"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Briefcase, Star, Users, Settings,
  Map, Image as ImageIcon, LogOut, Plus, Pencil, Trash2, X, Save,
  ChevronDown, ChevronUp, ChevronRight, Search, CheckCircle, AlertCircle, Eye,
  Palette, Type, Link2, Megaphone, Shield, Phone, Handshake, Upload,
  XCircle, Loader2, Globe, Grid3x3, Mail
} from "lucide-react";

// ---------- types ----------
type TabGroup = string;
type Tab = string;

interface StatsData { userCount: number; productCount: number; projectCount: number; testimonialCount: number }
interface SitePage { id: string; label: string; slug: string; path: string; status: "published" | "draft"; section: string }
interface HeroItem { id: string; page: string; title: string; subtitle?: string; imageUrl?: string; videoUrl?: string; logoUrl?: string; heroTag?: string; ctaText?: string; ctaLink?: string; cta2Text?: string; cta2Link?: string; textColor: string; overlayOpacity: number }
interface NavItem { id: string; label: string; href: string; order: number }
interface ProductItem { 
  id: string; 
  slug: string; 
  name: string; 
  category: string; 
  shortSpec?: string; 
  description: string; 
  isNew: boolean; 
  isFeatured: boolean; 
  imageUrl?: string; 
  imagesJson?: string; 
  specs?: string; 
  heightClass?: string;
  whyInvestJson?: string;
  premiumBenefitsJson?: string;
  servicesTitle?: string;
  servicesSubtitle?: string;
  servicesJson?: string;
  subCategoryId?: string;
  subCategory?: { id: string; name: string };
  ctaText?: string;
  ctaLink?: string;
  warrantyText?: string;
  standardsText?: string;
  specsTitle?: string;
  whyInvestTitle?: string;
}
interface SubCategoryItem { id: string; name: string; categoryId: string; order: number; category?: { label: string } }
interface ProjectItem { id: string; name: string; city: string; state: string; surface: string; area: string; year: string; duration?: string; standard?: string; imageUrl?: string }
interface TestimonialItem { id: string; name: string; institution: string; quote: string; avatar?: string }
interface CategoryItem {
  id: string;
  label: string;
  order: number;
  imageUrl?: string;
  iconSvg?: string;
  navbarIconUrl?: string;
  href?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  heroTag?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  cta2Text?: string;
  cta2Link?: string;
  imageUrl2?: string;
  imageLabel2?: string;
  imageUrl3?: string;
  imageLabel3?: string;
  logoUrl?: string;
  collabBackgroundColor?: string;
  collabTextColor?: string;
  collabTitle?: string;
  collabSubtitle?: string;
  collabDescription?: string;
  collabCtaText?: string;
  collabCtaLink?: string;
}
interface UserItem { id: string; name?: string; email?: string; role: string; emailVerified?: string }
interface RequestItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  surface?: string;
  message: string;
  status: string;
  createdAt: string;
}
interface CollaborationItem { 
  id: string; 
  name: string; 
  imageUrl: string; 
  description?: string; 
  href?: string; 
  categoryId?: string; 
  category?: { label: string }; 
  isGlobal: boolean; 
  order: number 
}
interface SiteSettings { 
  siteName: string; 
  primaryColor: string; 
  secondaryColor: string; 
  fontHeading: string; 
  fontBody: string; 
  contactEmail?: string; 
  contactPhone?: string; 
  address?: string; 
  logoUrl?: string; 
  showCategoryBar?: boolean; 
  showTicker?: boolean; 
  statsJson?: string; 
  certsJson?: string; 
  ctaTitle?: string; 
  ctaSubtitle?: string; 
  ctaButton?: string; 
  ctaLink?: string;
  homeHeroTitle?: string;
  homeHeroSubtitle?: string;
  homeHeroTag?: string;
  homeHeroPrimaryButtonText?: string;
  homeHeroPrimaryButtonLink?: string;
  homeHeroSecondaryButtonText?: string;
  homeHeroSecondaryButtonLink?: string;
  // New Page Content Fields
  aboutOriginTitle?: string;
  aboutOriginText?: string;
  aboutImageUrl?: string;
  privacyIntro?: string;
  privacySectionsJson?: string;
  termsIntro?: string;
  termsSectionsJson?: string;
  valuesJson?: string;
  timelineJson?: string;
  officeHours?: string;
  whatsappNumber?: string;
  serviceArea?: string;
  facebookLink?: string;
  twitterLink?: string;
  instagramLink?: string;
  linkedinLink?: string;
  youtubeLink?: string;
  pinterestLink?: string;
}

function slugify(text: string | undefined): string {
  if (!text) return "";
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

const EDITABLE_PAGES = [
  { label: "Home", slug: "home", icon: "🏠", path: "/" },
  { label: "Products", slug: "products", icon: "📦", path: "/products" },
  { label: "Projects", slug: "projects", icon: "🏗️", path: "/projects" },
  { label: "About Us", slug: "about", icon: "ℹ️", path: "/about" },
  { label: "Contact Us", slug: "contact", icon: "📞", path: "/contact" },
  { label: "Registration", slug: "registration", icon: "📝", path: "/register" },
  { label: "Login", slug: "login", icon: "🔑", path: "/login" },
  { label: "Forgot Password", slug: "forgot-password", icon: "🔒", path: "/forgot-password" },
  { label: "Privacy Policy", slug: "privacy", icon: "🛡️", path: "/privacy" },
  { label: "Terms", slug: "terms", icon: "📄", path: "/terms" },
  { label: "Quote", slug: "quote", icon: "💬", path: "/quote" },
  { label: "Profile", slug: "profile", icon: "👤", path: "/profile" },
  { label: "Search", slug: "search", icon: "🔎", path: "/search" },
];

// Pages whose headline/subtitle text now reads live from HeroSection (see
// page_<slug> "Hero Settings" tab). About/Contact/Privacy/Terms use their
// own dedicated settings fields instead (handled in openPageEditor).
// Profile and Search show personalized/dynamic content (the logged-in
// user's name, live search results) so they have nothing static to edit.
const HERO_EDITABLE_SLUGS = ["home", "products", "projects", "registration", "login", "forgot-password", "quote"];

const basePageManagerEntries: SitePage[] = EDITABLE_PAGES.map((page, index) => ({
  id: `page-${page.slug}-${index}`,
  label: page.label,
  slug: page.slug,
  path: page.path,
  status: "published",
  section: page.slug === "products" ? "catalog" : page.slug === "projects" ? "portfolio" : "content",
}));

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg || "An error occurred"}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-50">
          <h3 className="font-black text-slate-800 text-xl tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required = false, type = "text", textarea = false, error = false }: { label: string; name: string; value: any; onChange: (e: any) => void; placeholder?: string; required?: boolean; type?: string; textarea?: boolean; error?: boolean }) {
  const baseClasses = `w-full bg-white border rounded-2xl px-4 py-3.5 text-sm transition-all font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4`;
  const errorClasses = error ? `border-red-500 focus:ring-red-500/20 focus:border-red-500 text-red-900 bg-red-50/30` : `border-slate-200 focus:ring-amber-500/10 focus:border-amber-400`;

  return (
    <div className="space-y-1.5">
      <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-1 px-1 ${error ? "text-red-500" : "text-slate-500"}`}>{label} {required && "*"}</label>
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className={`${baseClasses} ${errorClasses} min-h-[120px]`} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className={`${baseClasses} ${errorClasses}`} />
      )}
    </div>
  );
}

function ImageUpload({ label, value, onChange, multiple = false }: { label: string; value: string | string[]; onChange: (val: any) => void; multiple?: boolean }) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("file", files[i]);
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
            const res = await fetch(`${backendUrl}/api/admin/upload`, { method: "POST", body: formData });
            if (res.ok) {
                const data = await res.json();
                if (multiple) {
                    const current = Array.isArray(value) ? value : (value ? [value] : []);
                    onChange([...current, data.url]);
                } else {
                    onChange(data.url);
                }
            }
        }
    } catch (err) {
        console.error("Upload failed", err);
    } finally {
        setUploading(false);
    }
  }

  const images = multiple ? (Array.isArray(value) ? value : []) : (value ? [value as string] : []);

  return (
    <div className="space-y-3 py-2">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{label}</label>
      
      <div className="flex flex-wrap gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-28 h-28 rounded-3xl overflow-hidden group border border-slate-100 shadow-sm transition-transform hover:scale-105">
            {img.match(/\.(mp4|webm|mov|ogg)$/i) ? (
               <video src={img} className="w-full h-full object-cover" controls={false} />
            ) : (
               <img src={img} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                type="button"
                onClick={() => {
                    if (multiple) onChange((value as string[]).filter((_, i) => i !== idx));
                    else onChange("");
                }}
                className="bg-white/90 p-2 rounded-full shadow-lg text-red-500 hover:bg-white scale-90 group-hover:scale-100 transition-all"
                >
                <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
        
        <label className={`w-28 h-28 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${uploading ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50 group hover:shadow-lg hover:shadow-amber-500/5"}`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-amber-500" size={24} />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Uploading...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                <Upload size={20} className="text-slate-400 group-hover:text-amber-600 group-hover:scale-110 transition-all" />
              </div>
              <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.1em] group-hover:text-amber-600">Select File</span>
            </>
          )}
          <input type="file" className="hidden" multiple={multiple} onChange={handleFileChange} accept="image/*,video/*" />
        </label>
      </div>
    </div>
  );
}

// ---------- main component ----------
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Data
  const [stats, setStats] = useState<StatsData>({ userCount: 0, productCount: 0, projectCount: 0, testimonialCount: 0 });
  const [heroes, setHeroes] = useState<HeroItem[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [homepageGridItems, setHomepageGridItems] = useState<{ id: string; label: string; description?: string; imageUrl?: string; href?: string; order: number }[]>([]);
  const [tickerItems, setTickerItems] = useState<{ id: string; text: string; order: number }[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [requestView, setRequestView] = useState<"quotes" | "contacts">("quotes");
  const [settings, setSettings] = useState<SiteSettings>({ siteName: "SPORTSURF", primaryColor: "#f59e0b", secondaryColor: "#1e293b", fontHeading: "Inter", fontBody: "Inter" });
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [pageManagerPages, setPageManagerPages] = useState<SitePage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sportsurf-page-manager");
        if (saved) return JSON.parse(saved) as SitePage[];
      } catch (error) {
        console.warn("Could not load saved pages", error);
      }
    }
    return basePageManagerEntries;
  });
  const [pageForm, setPageForm] = useState<Partial<SitePage> & Record<string, any>>({
    label: "",
    slug: "",
    path: "",
    status: "published",
    section: "content",
  });
  const [pageFormMode, setPageFormMode] = useState<"create" | "edit">("create");
  const [pageFormOpen, setPageFormOpen] = useState(false);

  // Modal state
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [confirmModal, setConfirmModal] = useState<{ title: string; onConfirm: () => void } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), type === "error" ? 8000 : 3000);
  }, []);

  const fetchData = useCallback(async (endpoint: string) => {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return res.json();
    } catch (e) {
      console.error(`Fetch error for ${endpoint}:`, e);
    }
    return null;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sportsurf-page-manager", JSON.stringify(pageManagerPages));
    }
  }, [pageManagerPages]);

  useEffect(() => {
    if (categories.length > 0) {
      setPageManagerPages((prev) => {
        const normalized = categories
          .map((cat, index) => ({
            id: `category-page-${cat.id || index}`,
            label: cat.label,
            slug: slugify(cat.label),
            path: `/${slugify(cat.label)}`,
            status: "published" as const,
            section: "category",
          }));

        const merged: SitePage[] = [...prev.filter((page) => !page.section || page.section !== "category"), ...normalized];
        const uniquePages: SitePage[] = merged.reduce<SitePage[]>((acc, page) => {
          if (!acc.some((item) => item.slug === page.slug)) {
            acc.push(page);
          }
          return acc;
        }, []);

        return uniquePages.sort((a, b) => a.label.localeCompare(b.label));
      });
    }
  }, [categories]);

  useEffect(() => {
    async function load() {
      const s = await fetchData("/api/admin/overview");
      if (s) setStats(s);
      const h = await fetchData("/api/admin/hero");
      if (h) setHeroes(h);
      const n = await fetchData("/api/admin/navigation");
      if (n) setNavItems(n);
      const c = await fetchData("/api/admin/categories");
      if (c) setCategories(c);
      const hg = await fetchData("/api/admin/homepage-grid");
      if (hg) setHomepageGridItems(hg);
      const tk = await fetchData("/api/admin/ticker");
      if (tk) setTickerItems(tk);
      const p = await fetchData("/api/admin/products");
      if (p) setProducts(p);
      const sc = await fetchData("/api/admin/subcategories");
      if (sc) setSubCategories(sc);
      const pr = await fetchData("/api/admin/projects");
      if (pr) setProjects(pr);
      const t = await fetchData("/api/admin/testimonials");
      if (t) setTestimonials(t);
      const u = await fetchData("/api/admin/users");
      if (u) setUsers(u.users || []);
      const r = await fetchData("/api/contact");
      if (r) setRequests(r || []);
      const st = await fetchData("/api/admin/settings");
      if (st && st.id) setSettings(st);
      const cl = await fetchData("/api/admin/collaborations");
      if (cl) setCollaborations(cl);
    }
    load();
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  }

  function openModal(type: string, data?: any) {
    setFormData(data ? { ...data } : {});
    setFormErrors({});
    setModal({ type, data });
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error for this field when the user modifies it
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
    // Also clear native validation message
    const el = document.querySelector(`input[name="${name}"], textarea[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement;
    if (el && typeof el.setCustomValidity === 'function') el.setCustomValidity("");
  }

  // CRUD helpers
  async function saveHero() {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/admin/hero/${formData.id}` : "/api/admin/hero";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) {
      const h = await fetchData("/api/admin/hero");
      if (h) setHeroes(h);
      setModal(null);
      showToast(isEdit ? "Hero section updated!" : "Hero section created!");
    } else {
      try {
        const err = await res.json();
        showToast(err.error || "Failed to save hero section", "error");
      } catch (e) {
        showToast("Server error saving hero. Please try again.", "error");
      }
    }
  }

  async function deleteHero(id: string) {
    setConfirmModal({
      title: "Delete this hero section?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/hero/${id}`, { method: "DELETE" });
        if (res.ok) { setHeroes(h => h.filter(x => x.id !== id)); showToast("Hero section deleted!"); }
        setConfirmModal(null);
      }
    });
  }

  async function saveNav() {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/admin/navigation/${formData.id}` : "/api/admin/navigation";
    const method = isEdit ? "PUT" : "POST";
    const body = { label: formData.label, href: formData.href, order: parseInt(formData.order) || 0 };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const n = await fetchData("/api/admin/navigation");
      if (n) setNavItems(n);
      setModal(null);
      showToast(isEdit ? "Menu item updated!" : "Menu item added!");
    } else {
      try {
        const err = await res.json();
        showToast(err.error || "Failed to save menu item", "error");
      } catch (e) {
        showToast("Server error saving menu. Please try again.", "error");
      }
    }
  }

  async function deleteNav(id: string) {
    setConfirmModal({
      title: "Delete this menu item?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/navigation/${id}`, { method: "DELETE" });
        if (res.ok) { setNavItems(n => n.filter(x => x.id !== id)); showToast("Menu item deleted!"); }
        setConfirmModal(null);
      }
    });
  }

  async function saveHomepageGridItem() {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/admin/homepage-grid/${formData.id}` : "/api/admin/homepage-grid";
    const method = isEdit ? "PUT" : "POST";
    const body = { label: formData.label, description: formData.description, imageUrl: formData.imageUrl, href: formData.href, order: parseInt(formData.order) || 0 };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const hg = await fetchData("/api/admin/homepage-grid");
      if (hg) setHomepageGridItems(hg);
      setModal(null);
      showToast(isEdit ? "Grid item updated!" : "Grid item added!");
    } else {
      try {
        const err = await res.json();
        showToast(err.error || "Failed to save grid item", "error");
      } catch (e) {
        showToast("Server error saving grid item. Please try again.", "error");
      }
    }
  }

  async function deleteHomepageGridItem(id: string) {
    setConfirmModal({
      title: "Delete this grid item?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/homepage-grid/${id}`, { method: "DELETE" });
        if (res.ok) { setHomepageGridItems(prev => prev.filter(x => x.id !== id)); showToast("Grid item deleted!"); }
        setConfirmModal(null);
      }
    });
  }

  async function saveCategory() {
    const isEdit = !!formData.id;
    
    // Explicitly require icon for new categories as requested
    if (!isEdit && !formData.navbarIconUrl) {
      showToast("Please upload a category icon (Navbar Icon) before saving.", "error");
      return;
    }

    const url = isEdit ? `/api/admin/categories/${formData.id}` : "/api/admin/categories";
    const method = isEdit ? "PUT" : "POST";
    const body = { 
      label: formData.label, 
      navbarIconUrl: formData.navbarIconUrl, 
      imageUrl: formData.imageUrl,
      description: formData.description,
      href: formData.href, 
      order: parseInt(formData.order) || 0,
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor,
      // Include collaboration fields
      collabTitle: formData.collabTitle,
      collabSubtitle: formData.collabSubtitle,
      collabDescription: formData.collabDescription,
      collabCtaText: formData.collabCtaText,
      collabCtaLink: formData.collabCtaLink,
      logoUrl: formData.logoUrl,
      collabBackgroundColor: formData.collabBackgroundColor,
      collabTextColor: formData.collabTextColor,
      // Include hero layout fields
      imageUrl2: formData.imageUrl2,
      imageLabel2: formData.imageLabel2,
      imageUrl3: formData.imageUrl3,
      imageLabel3: formData.imageLabel3
    };
    
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const c = await fetchData("/api/admin/categories");
      if (c) setCategories(c);
      setModal(null);
      showToast(isEdit ? "Category updated!" : "Category added!");
    } else {
      const txt = await res.text();
      showToast(`Failed to save: ${txt.substring(0, 300)}`, "error");
    }
  }

  async function deleteCategory(id: string) {
    setConfirmModal({
      title: "Delete this category? All products in this category will display 'Uncategorized'.",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        if (res.ok) { 
          setCategories(c => c.filter(x => x.id !== id)); 
          showToast("Category deleted!"); 
        } else {
          showToast("Failed to delete category. Check if it has products.", "error");
        }
        setConfirmModal(null);
      }
    });
  }

  async function saveTicker() {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/admin/ticker/${formData.id}` : "/api/admin/ticker";
    const method = isEdit ? "PUT" : "POST";
    const body = { text: formData.text, order: parseInt(formData.order) || 0 };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const tk = await fetchData("/api/admin/ticker");
      if (tk) setTickerItems(tk);
      setModal(null);
      showToast(isEdit ? "Ticker updated!" : "Ticker added!");
    } else {
      try {
        const err = await res.json();
        showToast(err.error || "Failed to save ticker", "error");
      } catch (e) {
        showToast("Server error saving ticker. Please try again.", "error");
      }
    }
  }

  async function deleteTicker(id: string) {
    setConfirmModal({
      title: "Delete this ticker item?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/ticker/${id}`, { method: "DELETE" });
        if (res.ok) { setTickerItems(tk => tk.filter(x => x.id !== id)); showToast("Ticker deleted!"); }
        setConfirmModal(null);
      }
    });
  }
   async function saveSubCategory() {
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/admin/subcategories/${formData.id}` : "/api/admin/subcategories";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) {
         const sc = await fetchData("/api/admin/subcategories");
         if (sc) setSubCategories(sc);
         setModal(null);
         showToast(isEdit ? "SubCategory updated!" : "SubCategory added!");
      } else {
         try {
           const err = await res.json();
           showToast(err.error || "Failed to save subcategory", "error");
         } catch (e) {
           showToast("Server error saving subcategory. Please try again.", "error");
         }
      }
   }

   async function deleteSubCategory(id: string) {
     setConfirmModal({
       title: "Delete this sub-category?",
       onConfirm: async () => {
         const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
         if (res.ok) { setSubCategories(sc => sc.filter(x => x.id !== id)); showToast("SubCategory deleted!"); }
         setConfirmModal(null);
       }
     });
   }

   // Auto-derives a unique URL slug from the product name so admins don't
   // have to type one by hand - a colliding slug used to fail the save
   // silently (raw Prisma error in a toast, product never actually created).
   function handleProductNameChange(e: React.ChangeEvent<HTMLInputElement>) {
      const name = e.target.value;
      setFormData(prev => {
         const wasAutoSlug = !prev.id && (!prev.slug || prev.slug === slugify(prev.name || ""));
         if (!wasAutoSlug) return { ...prev, name };

         let base = slugify(name);
         let candidate = base;
         let n = 2;
         const existingSlugs = new Set(products.map(p => p.slug));
         while (candidate && existingSlugs.has(candidate)) {
            candidate = `${base}-${n}`;
            n++;
         }
         return { ...prev, name, slug: candidate };
      });
   }

   async function saveProduct() {
      // Basic JSON validation before saving
      const jsonFields = [
         { key: 'imagesJson', label: 'Images JSON' },
         { key: 'specs', label: 'Specs Mapping' },
         { key: 'whyInvestJson', label: 'Why Build JSON' },
         { key: 'premiumBenefitsJson', label: 'Premium Benefits JSON' },
         { key: 'servicesJson', label: 'Premium Services JSON' }
      ];

      for (const field of jsonFields) {
         if (formData[field.key]) {
            try {
               JSON.parse(formData[field.key]);
            } catch (err: any) {
               setFormErrors(prev => ({ ...prev, [field.key]: true }));
               const errorMsg = err?.message || "Invalid JSON formatting";
               
               // Native browser validation popup
               setTimeout(() => {
                  const el = document.querySelector(`input[name="${field.key}"], textarea[name="${field.key}"]`) as HTMLInputElement | HTMLTextAreaElement;
                  if (el && typeof el.setCustomValidity === 'function') {
                     el.setCustomValidity(`JSON Error: ${errorMsg}. Use double quotes for keys and values, e.g. [{"key": "val"}]`);
                     el.reportValidity();
                  }
               }, 0);
               
               showToast(`JSON Error in "${field.label}": ${errorMsg}`, "error");
               return;
            }
         }
      }

      const isEdit = !!formData.id;
      const url = isEdit ? `/api/admin/products/${formData.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      
      // Sanitize body: remove id, createdAt, updatedAt for Prisma
      const { id, createdAt, updatedAt, ...rest } = formData;
      const body = { 
        ...rest, 
        isNew: !!formData.isNew, 
        isFeatured: !!formData.isFeatured 
      };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
         const p = await fetchData("/api/admin/products");
         if (p) setProducts(p);
         setModal(null);
         showToast(isEdit ? "Product updated!" : "Product added!");
      } else {
         try {
           const err = await res.json();
           showToast(err.error || "Failed to save", "error");
         } catch (e) {
           showToast("Server error. Please try again later.", "error");
         }
      }
   }

  async function deleteProduct(id: string) {
    setConfirmModal({
      title: "Delete this product?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (res.ok) { setProducts(p => p.filter(x => x.id !== id)); showToast("Product deleted!"); }
        setConfirmModal(null);
      }
    });
  }

  async function saveProject() {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/admin/projects/${formData.id}` : "/api/admin/projects";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) {
      const p = await fetchData("/api/admin/projects");
      if (p) setProjects(p);
      setModal(null);
      showToast(isEdit ? "Project updated!" : "Project added!");
    } else showToast("Failed to save", "error");
  }

  async function deleteProject(id: string) {
    setConfirmModal({
      title: "Delete this project?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
        if (res.ok) { setProjects(p => p.filter(x => x.id !== id)); showToast("Project deleted!"); }
        setConfirmModal(null);
      }
    });
  }

  async function saveTestimonial() {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/admin/testimonials/${formData.id}` : "/api/admin/testimonials";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) {
      const t = await fetchData("/api/admin/testimonials");
      if (t) setTestimonials(t);
      setModal(null);
      showToast(isEdit ? "Testimonial updated!" : "Testimonial added!");
    } else showToast("Failed to save", "error");
  }

  async function deleteTestimonial(id: string) {
    setConfirmModal({
      title: "Delete this testimonial?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
        if (res.ok) { setTestimonials(t => t.filter(x => x.id !== id)); showToast("Deleted!"); }
        setConfirmModal(null);
      }
    });
  }

  async function deleteUser(id: string) {
    setConfirmModal({
      title: "Permanently delete this user?",
      onConfirm: async () => {
        const res = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        if (res.ok) { setUsers(u => u.filter(x => x.id !== id)); showToast("User deleted!"); }
        setConfirmModal(null);
      }
    });
  }

  async function saveCollaboration() {
    if (!formData.name || !formData.imageUrl) {
      showToast("Partner name and logo are required", "error");
      return;
    }

    const isEdit = !!formData.id;
    const url = isEdit ? `/api/admin/collaborations/${formData.id}` : "/api/admin/collaborations";
    const method = isEdit ? "PUT" : "POST";
    
    // Sanitize to avoid Prisma errors with stale fields
    const { id, createdAt, updatedAt, category, ...rest } = formData;
    const res = await fetch(url, { 
      method, 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(isEdit ? rest : { ...rest, id: undefined }) 
    });

    if (res.ok) {
      const cl = await fetchData("/api/admin/collaborations");
      if (cl) setCollaborations(cl);
      setModal(null);
      showToast(isEdit ? "Collaboration updated!" : "Collaboration added!");
    } else {
      try {
        const err = await res.json();
        showToast(err.error || "Failed to save collaboration", "error");
      } catch (e) {
        showToast("Server error saving collaboration. Please try again.", "error");
      }
    }
  }

  async function deleteCollaboration(id: string) {
    setConfirmModal({
      title: "Delete this collaboration?",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/collaborations/${id}`, { method: "DELETE" });
        if (res.ok) { setCollaborations(cl => cl.filter(x => x.id !== id)); showToast("Collaboration deleted!"); }
        setConfirmModal(null);
      }
    });
  }

  async function saveSettings() {
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    if (res.ok) showToast("Settings saved!"); else showToast("Failed to save", "error");
  }

   // Unified Page Content Saving
   async function savePageContent() {
      const { _modelType, ...data } = formData;
      
      if (_modelType === "category") {
          // If editing a category, we use saveCategory logic
          // Ensure ID is passed for existing categories
          const isEdit = !!formData.id;
          const url = isEdit ? `/api/admin/categories/${formData.id}` : "/api/admin/categories";
          const method = isEdit ? "PUT" : "POST";
          const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
          if (res.ok) {
            const c = await fetchData("/api/admin/categories");
            if (c) setCategories(c);
            setModal(null);
            showToast(isEdit ? "Category updated!" : "Category added!");
          } else {
            showToast("Failed to save category.", "error");
          }
      } else if (_modelType === "settings") {
          const newSettings = { ...settings, ...data };
          setSettings(newSettings);
          const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSettings) });
          if (res.ok) { showToast("Page content updated!"); setModal(null); } else showToast("Failed to save", "error");
      } else {
          await saveHero();
      }
   }

   async function fixAllPageSections() {
      showToast("Syncing all pages to database...", "success");
      
      // Ensure all heroes exist
      for (const pg of EDITABLE_PAGES) {
         if (["home", "projects", "registration", "login"].includes(pg.slug)) {
            const exists = heroes.find(h => h.page === pg.slug);
            if (!exists) {
               await fetch("/api/admin/heroes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ page: pg.slug, title: `Welcome to ${pg.label}`, subtitle: "Expert sports infrastructure solutions.", textColor: "#ffffff", overlayOpacity: 0.4 })
               });
            }
         }
         // Categories are already created via seed, but we could add more here if missing
      }
      
      // Refresh
      const h = await fetchData("/api/admin/heroes");
      if (h) setHeroes(h);
      showToast("All page sections are valid and synced!");
   }

  const [activeGroup, setActiveGroup] = useState<TabGroup>("overview");

  const [activePageSection, setActivePageSection] = useState<string>("hero");

   const sidebarGroups = [
    {
      id: "pages",
      label: "Live Website Pages",
      icon: <Globe size={18} />,
      tabs: [
        { key: "page_home", label: "Home Base", icon: <div className="text-sm">🏠</div> },
        ...categories.map(c => ({
           key: `page_${slugify(c.label)}`,
           label: `${c.label} Systems`,
           icon: <div className="text-sm">🏟️</div>
        })),
        { key: "page_projects", label: "Project Gallery", icon: <div className="text-sm">🏗️</div> },
        { key: "page_about", label: "About Identity", icon: <div className="text-sm">ℹ️</div> },
        { key: "page_contact", label: "Contact Flow", icon: <div className="text-sm">📞</div> },
        { key: "page_registration", label: "Public Access", icon: <div className="text-sm">📝</div> },
        { key: "page_login", label: "Secure Login", icon: <div className="text-sm">🔑</div> },
      ]
    },
    { 
      id: "catalog", 
      label: "Inventory Hub", 
      icon: <Package size={18} />, 
      tabs: [
        { key: "products", label: "Master Product Catalog", icon: <Package size={16} /> },
        { key: "categories", label: "Navbar & Categories", icon: <Palette size={16} /> },
        { key: "collaborations", label: "Global Partners", icon: <Handshake size={16} /> },
      ] 
    },
    { 
      id: "infrastructure", 
      label: "Infrastructure Assets", 
      icon: <Briefcase size={18} />, 
      tabs: [
        { key: "projects", label: "Landmark Projects", icon: <Briefcase size={16} /> },
        { key: "testimonials", label: "Verified Reviews", icon: <Star size={16} /> },
      ] 
    },
    { 
      id: "system", 
      label: "Control Panel", 
      icon: <Settings size={18} />, 
      tabs: [
        { key: "overview", label: "Analytics Overview", icon: <LayoutDashboard size={16} /> },
        { key: "settings", label: "Global Site Config", icon: <Settings size={16} /> },
        { key: "users", label: "System Admins", icon: <Users size={16} /> },
      ] 
    },
  ];

  useEffect(() => {
    // Sync activeGroup when tab changes
    const group = sidebarGroups.find(g => g.tabs.some(t => t.key === tab));
    if (group) setActiveGroup(group.id);
  }, [tab]);

  const filteredUsers = users.filter(u =>
    !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredProducts = products.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase())
  );
  const quoteRequests = requests.filter(request => request.message.startsWith("PROPOSAL REQUEST:"));
  const contactRequests = requests.filter(request => !request.message.startsWith("PROPOSAL REQUEST:"));
  const visibleRequests = requestView === "quotes" ? quoteRequests : contactRequests;

  async function updateRequestStatus(id: string, status: string) {
    const res = await fetch("/api/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      showToast("Request status could not be updated.", "error");
      return;
    }

    const updatedRequest = await res.json();
    setRequests(prev => prev.map(request => request.id === id ? updatedRequest : request));
    showToast("Request status updated.");
  }
  const editingPageSlug = ((pageForm.slug || slugify(pageForm.label || "")) || "").toLowerCase();

  const openPageEditor = (page?: SitePage) => {
    const baseValues = {
      id: page?.id,
      label: page?.label || "",
      slug: page?.slug || "",
      path: page?.path || "",
      status: page?.status || "published",
      section: page?.section || "content",
    } as Partial<SitePage> & Record<string, any>;

    if (page && page.slug === "challenge-courses") {
      const match = categories.find((cat) => {
        const categoryHref = cat.href || "";
        return slugify(cat.label) === "challenge-courses" || cat.id === page.id || categoryHref.includes("challenge-courses");
      });
      if (match) {
        baseValues.path = match.href || "/challenge-courses";
      }
    }

    if (page?.slug === "about") {
      Object.assign(baseValues, {
        aboutOriginTitle: settings.aboutOriginTitle || "",
        aboutOriginText: settings.aboutOriginText || "",
        aboutImageUrl: settings.aboutImageUrl || "",
      });
    }

    if (page?.slug === "contact") {
      Object.assign(baseValues, {
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        address: settings.address || "",
        officeHours: settings.officeHours || "",
        whatsappNumber: settings.whatsappNumber || "",
      });
    }

    if (page?.slug === "privacy") {
      Object.assign(baseValues, {
        privacyIntro: settings.privacyIntro || "",
        privacySectionsJson: settings.privacySectionsJson || "",
      });
    }

    if (page?.slug === "terms") {
      Object.assign(baseValues, {
        termsIntro: settings.termsIntro || "",
        termsSectionsJson: settings.termsSectionsJson || "",
      });
    }

    if (page) {
      setPageFormMode("edit");
      setPageForm(baseValues);
    } else {
      setPageFormMode("create");
      setPageForm({
        label: "",
        slug: "",
        path: "",
        status: "published",
        section: "content",
      });
    }
    setPageFormOpen(true);
  };

  const savePageManagerEntry = async () => {
    const label = pageForm.label?.trim();
    const slug = (pageForm.slug || slugify(label || "")).trim();
    const path = (pageForm.path || `/${slug}`).trim();

    if (!label || !slug) {
      showToast("Page title and slug are required.", "error");
      return;
    }

    const payload: SitePage = {
      id: pageForm.id || `${Date.now()}`,
      label,
      slug,
      path,
      status: pageForm.status || "published",
      section: pageForm.section || "content",
    };

    const updatedSettings = { ...settings };
    if (slug === "about") {
      updatedSettings.aboutOriginTitle = pageForm.aboutOriginTitle || settings.aboutOriginTitle || "";
      updatedSettings.aboutOriginText = pageForm.aboutOriginText || settings.aboutOriginText || "";
      updatedSettings.aboutImageUrl = pageForm.aboutImageUrl || settings.aboutImageUrl || "";
    }

    if (slug === "contact") {
      updatedSettings.contactEmail = pageForm.contactEmail || settings.contactEmail || "";
      updatedSettings.contactPhone = pageForm.contactPhone || settings.contactPhone || "";
      updatedSettings.address = pageForm.address || settings.address || "";
      updatedSettings.officeHours = pageForm.officeHours || settings.officeHours || "";
      updatedSettings.whatsappNumber = pageForm.whatsappNumber || settings.whatsappNumber || "";
    }

    if (slug === "privacy") {
      updatedSettings.privacyIntro = pageForm.privacyIntro || settings.privacyIntro || "";
      updatedSettings.privacySectionsJson = pageForm.privacySectionsJson || settings.privacySectionsJson || "[]";
    }

    if (slug === "terms") {
      updatedSettings.termsIntro = pageForm.termsIntro || settings.termsIntro || "";
      updatedSettings.termsSectionsJson = pageForm.termsSectionsJson || settings.termsSectionsJson || "[]";
    }

    if (["about", "contact", "privacy", "terms"].includes(slug)) {
      setSettings(updatedSettings);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      if (!res.ok) {
        showToast("Page text could not be saved.", "error");
        return;
      }
    }

    setPageManagerPages((prev) => {
      if (pageFormMode === "edit") {
        return prev.map((page) => (page.id === payload.id ? payload : page));
      }
      return [...prev, payload];
    });

    setPageFormOpen(false);
    showToast(pageFormMode === "edit" ? "Page updated." : "Page added.");
  };

  const deletePageManagerEntry = (page: SitePage) => {
    setPageManagerPages((prev) => prev.filter((item) => item.id !== page.id));
    showToast(`Deleted ${page.label}.`);
  };

  const topNavItems = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
    { key: "all-content", label: "All Content", icon: <Type size={15} /> },
    { key: "page-manager", label: "Page Manager", icon: <Grid3x3 size={15} /> },
    { key: "page_home", label: "Hero Sections", icon: <ImageIcon size={15} /> },
    { key: "page_navigation", label: "Navigation", icon: <Map size={15} /> },
    { key: "page_navbar", label: "Navbar Categories", icon: <Palette size={15} /> },
    { key: "page_homegrid", label: "Homepage Grid", icon: <Grid3x3 size={15} /> },
    { key: "products", label: "Products", icon: <Package size={15} /> },
    { key: "projects", label: "Projects", icon: <Briefcase size={15} /> },
    { key: "testimonials", label: "Testimonials", icon: <Star size={15} /> },
    { key: "users", label: "Users", icon: <Users size={15} /> },
    { key: "requests", label: "Requests", icon: <Mail size={15} /> },
    { key: "ticker", label: "Announcement Ticker", icon: <Megaphone size={15} /> },
    { key: "page_content", label: "Page Content", icon: <Type size={15} /> },
    { key: "settings", label: "Site Settings", icon: <Settings size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-4">
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7b64e] shadow-sm ring-4 ring-[#f6d99b]/40">
              <span className="text-lg font-black text-white">S</span>
            </div>
            <div className="leading-none">
              <div className="text-2xl sm:text-[30px] font-black tracking-[-0.06em] text-slate-800">SPORTSURF</div>
              <div className="mt-1 text-sm text-slate-500">Admin Dashboard</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <nav className="mb-8 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-[#f5f5f5] px-2 py-2">
          {topNavItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setTab(item.key);
                setActiveGroup(item.key === "overview" ? "system" : "pages");
                setActivePageSection("hero");
              }}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-all ${
                tab === item.key
                  ? "border-[#f2c46d] bg-white text-slate-800 shadow-sm"
                  : "border-slate-200 bg-transparent text-slate-600 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <span className={tab === item.key ? "text-[#e29b1f]" : "text-slate-500"}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <main className="pb-12">
          {tab === "all-content" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[42px] font-black leading-none tracking-[-0.06em] text-slate-800">All Content</h2>
                  <p className="mt-2 text-sm text-slate-500">One master place to edit page text, images, category branding, product content, and project media.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openPageEditor()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f7b64e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#eea937]"
                >
                  <Plus size={16} /> Add Page
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-800">Page text & media</h3>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Editable</span>
                  </div>
                  <div className="space-y-3">
                    {EDITABLE_PAGES.map((page) => (
                      <div key={page.slug} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div>
                          <div className="text-sm font-bold text-slate-800">{page.label}</div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{page.path}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openPageEditor(basePageManagerEntries.find((entry) => entry.slug === page.slug) || {
                            id: `page-${page.slug}`,
                            label: page.label,
                            slug: page.slug,
                            path: page.path,
                            status: "published",
                            section: "content",
                          })}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 hover:border-slate-300"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Homepage Icons</h3>
                      <p className="mt-1 text-xs text-slate-500">Change the icon name, upload its icon, or add a new icon.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openModal("category")}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:bg-emerald-400"
                    >
                      <Plus size={13} /> Add Icon
                    </button>
                  </div>
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.label} className="h-full w-full object-cover" /> : <Palette size={18} className="m-2 text-slate-300" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{cat.label}</div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Name + navbar icon + link</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openModal("category", cat)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 hover:border-slate-300"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-800">Navigation Labels</h3>
                    <button
                      type="button"
                      onClick={() => openModal("nav")}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:bg-amber-400"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {navItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div>
                          <div className="text-sm font-bold text-slate-800">{item.label}</div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{item.href} · Order {item.order}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openModal("nav", item)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 hover:border-slate-300"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                    {navItems.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-xs font-medium text-slate-400">No navigation items found.</p>}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-800">Products</h3>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">Catalog</span>
                  </div>
                  <div className="space-y-3">
                    {products.slice(0, 6).map((product) => (
                      <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <Package size={18} className="m-2 text-slate-300" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{product.name}</div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{product.category}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openModal("product", product)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 hover:border-slate-300"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-800">Projects</h3>
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">Media</span>
                  </div>
                  <div className="space-y-3">
                    {projects.slice(0, 6).map((project) => (
                      <div key={project.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            {project.imageUrl ? <img src={project.imageUrl} alt={project.name} className="h-full w-full object-cover" /> : <Briefcase size={18} className="m-2 text-slate-300" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{project.name}</div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{project.city}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openModal("project", project)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 hover:border-slate-300"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "page_content" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[42px] font-black leading-none tracking-[-0.06em] text-slate-800">Page Content</h2>
                  <p className="mt-2 text-sm text-slate-500">Edit the text, images, and page settings used across the website.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openPageEditor()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f7b64e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#eea937]"
                >
                  <Plus size={16} /> Add Page
                </button>
              </div>
              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
                {pageManagerPages.map((page) => (
                  <div key={page.id} className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-bold text-slate-800">{page.label}</div>
                      <div className="mt-1 text-xs text-slate-400">{page.path} · {page.section}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => window.open(page.path, "_blank")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">View</button>
                      {page.section === "category" || HERO_EDITABLE_SLUGS.includes(page.slug) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTab(`page_${page.slug}`);
                            setActiveGroup("pages");
                            setActivePageSection("hero");
                          }}
                          className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-400"
                        >
                          Edit Content
                        </button>
                      ) : (
                        <button type="button" onClick={() => openPageEditor(page)} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-400">Edit Content</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "ticker" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[42px] font-black leading-none tracking-[-0.06em] text-slate-800">Announcement Ticker</h2>
                  <p className="mt-2 text-sm text-slate-500">Manage the scrolling announcements shown in the global header.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openModal("ticker")}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-400"
                >
                  <Plus size={16} /> Add Announcement
                </button>
              </div>
              <div className="space-y-3">
                {tickerItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-sm font-black text-amber-700">{item.order}</span>
                      <span className="font-bold text-slate-700">{item.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openModal("ticker", item)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Pencil size={14} /></button>
                      <button type="button" onClick={() => deleteTicker(item.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {tickerItems.length === 0 && <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">No announcements found.</div>}
              </div>
            </div>
          )}

          {tab === "page_navigation" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[42px] font-black leading-none tracking-[-0.06em] text-slate-800">Navigation</h2>
                  <p className="mt-2 text-sm text-slate-500">Manage the text links shown in the website header.</p>
                </div>
                <button type="button" onClick={() => openModal("nav")} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-amber-400">
                  <Plus size={16} /> Add Link
                </button>
              </div>
              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
                {navItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-bold text-slate-800">{item.label}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.href} · Order {item.order}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openModal("nav", item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Pencil size={13} /> Edit</button>
                      <button type="button" onClick={() => deleteNav(item.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"><Trash2 size={13} /> Delete</button>
                    </div>
                  </div>
                ))}
                {navItems.length === 0 && <div className="p-12 text-center text-sm text-slate-400">No navigation links found.</div>}
              </div>
            </div>
          )}

          {tab === "page_navbar" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[42px] font-black leading-none tracking-[-0.06em] text-slate-800">Navbar Categories</h2>
                  <p className="mt-2 text-sm text-slate-500">Manage the icon categories displayed below the website header.</p>
                </div>
                <button type="button" onClick={() => openModal("category")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-400">
                  <Plus size={16} /> Add Category Icon
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {category.navbarIconUrl ? <img src={category.navbarIconUrl} alt={category.label} className="h-full w-full object-contain p-2" /> : category.iconSvg ? <div className="h-10 w-10" dangerouslySetInnerHTML={{ __html: category.iconSvg }} /> : <Palette size={24} className="text-slate-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-slate-800">{category.label}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Order {category.order}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => openModal("category", category)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-700 hover:bg-slate-50"><Pencil size={12} /> Edit</button>
                        <button
                          type="button"
                          onClick={() => {
                            setTab(`page_${slugify(category.label)}`);
                            setActiveGroup("pages");
                            setActivePageSection("hero");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-amber-700 hover:bg-amber-100"
                        >
                          <Palette size={12} /> Page colours &amp; text
                        </button>
                        <button type="button" onClick={() => deleteCategory(category.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-red-600 hover:bg-red-100"><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {categories.length === 0 && <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">No navbar categories found.</div>}
            </div>
          )}

          {tab === "page_homegrid" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[42px] font-black leading-none tracking-[-0.06em] text-slate-800">Homepage Grid</h2>
                  <p className="mt-2 text-sm text-slate-500">Manage the image cards and feature blocks shown on the homepage.</p>
                </div>
                <button type="button" onClick={() => openModal("homepage")} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-amber-400">
                  <Plus size={16} /> Add Grid Card
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {homepageGridItems.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="aspect-video bg-slate-100">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.label} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><ImageIcon size={36} /></div>}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-800">{item.label}</h3>
                          <p className="mt-1 text-xs text-slate-500">{item.description || "No description"}</p>
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-500">#{item.order}</span>
                      </div>
                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => openModal("homepage", item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Pencil size={13} /> Edit</button>
                        <button type="button" onClick={() => deleteHomepageGridItem(item.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"><Trash2 size={13} /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {homepageGridItems.length === 0 && <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">No homepage grid cards found.</div>}
            </div>
          )}

          {pageFormOpen && (
            <Modal title={pageFormMode === "edit" ? "Edit Page" : "Add Page"} onClose={() => setPageFormOpen(false)}>
              <div className="space-y-5">
                <Field label="Page Title" name="label" value={pageForm.label || ""} onChange={(e) => setPageForm((current) => ({ ...current, label: e.target.value }))} placeholder="About Us" required />
                <Field label="Slug" name="slug" value={pageForm.slug || ""} onChange={(e) => setPageForm((current) => ({ ...current, slug: e.target.value }))} placeholder="about-us" required />
                <Field label="Path" name="path" value={pageForm.path || ""} onChange={(e) => setPageForm((current) => ({ ...current, path: e.target.value }))} placeholder="/about" required />
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Section</label>
                    <select
                      value={pageForm.section || "content"}
                      onChange={(e) => setPageForm((current) => ({ ...current, section: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
                    >
                      <option value="content">Content</option>
                      <option value="catalog">Catalog</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="category">Category</option>
                      <option value="utility">Utility</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</label>
                    <select
                      value={pageForm.status || "published"}
                      onChange={(e) => setPageForm((current) => ({ ...current, status: e.target.value as "published" | "draft" }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                {(editingPageSlug === "about" || editingPageSlug === "contact" || editingPageSlug === "privacy" || editingPageSlug === "terms") && (
                  <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    {editingPageSlug === "about" && (
                      <>
                        <Field label="Story Title" name="aboutOriginTitle" value={pageForm.aboutOriginTitle || ""} onChange={(e) => setPageForm((current) => ({ ...current, aboutOriginTitle: e.target.value }))} />
                        <Field label="The Origin" name="aboutOriginText" value={pageForm.aboutOriginText || ""} onChange={(e) => setPageForm((current) => ({ ...current, aboutOriginText: e.target.value }))} textarea />
                        <ImageUpload label="About Page Image" value={pageForm.aboutImageUrl || ""} onChange={(value) => setPageForm((current) => ({ ...current, aboutImageUrl: value }))} />
                      </>
                    )}

                    {editingPageSlug === "contact" && (
                      <>
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field label="Email" name="contactEmail" value={pageForm.contactEmail || ""} onChange={(e) => setPageForm((current) => ({ ...current, contactEmail: e.target.value }))} />
                          <Field label="Phone" name="contactPhone" value={pageForm.contactPhone || ""} onChange={(e) => setPageForm((current) => ({ ...current, contactPhone: e.target.value }))} />
                        </div>
                        <Field label="Address" name="address" value={pageForm.address || ""} onChange={(e) => setPageForm((current) => ({ ...current, address: e.target.value }))} textarea />
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field label="Office Hours" name="officeHours" value={pageForm.officeHours || ""} onChange={(e) => setPageForm((current) => ({ ...current, officeHours: e.target.value }))} />
                          <Field label="WhatsApp Number" name="whatsappNumber" value={pageForm.whatsappNumber || ""} onChange={(e) => setPageForm((current) => ({ ...current, whatsappNumber: e.target.value }))} />
                        </div>
                      </>
                    )}

                    {editingPageSlug === "privacy" && (
                      <>
                        <Field label="Privacy Intro" name="privacyIntro" value={pageForm.privacyIntro || ""} onChange={(e) => setPageForm((current) => ({ ...current, privacyIntro: e.target.value }))} textarea />
                        <Field label="Privacy Sections JSON" name="privacySectionsJson" value={pageForm.privacySectionsJson || "[]"} onChange={(e) => setPageForm((current) => ({ ...current, privacySectionsJson: e.target.value }))} textarea />
                      </>
                    )}

                    {editingPageSlug === "terms" && (
                      <>
                        <Field label="Terms Intro" name="termsIntro" value={pageForm.termsIntro || ""} onChange={(e) => setPageForm((current) => ({ ...current, termsIntro: e.target.value }))} textarea />
                        <Field label="Terms Sections JSON" name="termsSectionsJson" value={pageForm.termsSectionsJson || "[]"} onChange={(e) => setPageForm((current) => ({ ...current, termsSectionsJson: e.target.value }))} textarea />
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setPageFormOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="button" onClick={savePageManagerEntry} className="rounded-xl bg-[#f7b64e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#eea937]">{pageFormMode === "edit" ? "Save page" : "Add page"}</button>
                </div>
              </div>
            </Modal>
          )}

          {/* DYNAMIC PAGE-CENTRIC EDITOR */}
          {tab.startsWith("page_") && (() => {
             const slug = tab.replace("page_", "");
             const allPages = [
               ...EDITABLE_PAGES,
               ...categories.map(c => ({ label: c.label, slug: slugify(c.label), icon: "🏟️", path: `/${slugify(c.label)}` }))
             ];
             const page = allPages.find(p => p.slug === slug);
             const isHome = slug === "home";
             const isCategory = categories.some(c => slugify(c.label) === slug);
             
             // Define sections for this page
             const sections = isHome ? [
                { id: "hero", label: "Main Hero Section", icon: <ImageIcon size={14} /> },
                { id: "ticker", label: "Announcement Ticker", icon: <Megaphone size={14} /> },
                { id: "nav_categories", label: "Navbar Categories", icon: <Palette size={14} /> },
                { id: "portfolio", label: "Portfolio Grid Cards", icon: <Package size={14} /> },
                { id: "landmarks", label: "Landmark Installations", icon: <Briefcase size={14} /> },
                { id: "testimonials", label: "Verified Reviews", icon: <Star size={14} /> },
             ] : isCategory ? [
                { id: "hero", label: "Header & Branding", icon: <ImageIcon size={14} /> },
                { id: "subcategories", label: "Manage Sub-Types", icon: <Map size={14} /> },
                { id: "logos", label: "Brand Partners", icon: <Handshake size={14} /> },
                { id: "products", label: "Assigned Products", icon: <Package size={14} /> },
             ] : [
                { id: "hero", label: "Hero Settings", icon: <ImageIcon size={14} /> }
             ];

             return (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                  {/* Page Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                          <span className="text-4xl">{page?.icon}</span>
                          {page?.label} Page Control Center
                       </h2>
                       <p className="text-sm text-slate-500 font-medium ml-14">Configure every block and section on the {page?.label} live page</p>
                    </div>
                    <a href={page?.path} target="_blank" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl text-xs font-black transition flex items-center gap-2 uppercase tracking-widest">
                       <Eye size={16} /> View Live Page
                    </a>
                  </div>

                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                     {/* Subsection Navigator (Left) */}
                     <div className="lg:col-span-3 space-y-2 h-fit lg:sticky lg:top-0">
                        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-3">Page Sections</p>
                           {sections.map(s => (
                             <button
                               key={s.id}
                               onClick={() => setActivePageSection(s.id)}
                               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all group ${activePageSection === s.id ? "bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/10" : "text-slate-600 hover:bg-slate-50"}`}
                             >
                                <span className={`${activePageSection === s.id ? "text-white" : "text-slate-400 group-hover:text-amber-500"}`}>{s.icon}</span>
                                {s.label}
                                {activePageSection === s.id && <ChevronRight size={14} className="ml-auto" />}
                             </button>
                           ))}
                        </div>

                        {isCategory && (
                           <div className="bg-amber-900 rounded-[2rem] p-6 text-white shadow-xl shadow-amber-900/20 relative overflow-hidden group">
                              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                              <h4 className="font-bold text-sm mb-1">Add Product</h4>
                              <p className="text-[10px] text-amber-200/70 mb-4 leading-relaxed">Instantly add a new product directly to this category category.</p>
                              <button 
                                onClick={() => openModal("product", { category: page?.label })}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                              >
                                 + Create Profile
                              </button>
                           </div>
                        )}
                     </div>

                     {/* Dynamic Editor Pane (Right) */}
                     <div className="lg:col-span-9">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 min-h-[600px]">
                           {/* SECTION: HERO */}
                           {activePageSection === "hero" && (
                              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                 <div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Header & Branding</h3>
                                    <p className="text-sm text-slate-500 font-medium">Configure visuals and text for the top hero section of the page.</p>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                       {isCategory ? (() => {
                                          const cat = categories.find(c => slugify(c.label) === slug || c.id === slug) as any;
                                          if (!cat) return <div className="p-10 bg-slate-50 rounded-3xl text-center text-slate-400 italic">Category data not found. Syncing required.</div>;
                                          return (
                                            <div className="space-y-4">
                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Navigation Label</label>
                                                     <input type="text" value={cat.label} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].label = e.target.value;
                                                        setCategories(newCats);
                                                     }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                  </div>
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Display Order</label>
                                                     <input type="number" value={cat.order} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].order = parseInt(e.target.value) || 0;
                                                        setCategories(newCats);
                                                     }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                  </div>
                                               </div>
                                               <div>
                                                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Header Description</label>
                                                  <textarea value={cat.description || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].description = e.target.value;
                                                        setCategories(newCats);
                                                     }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm h-32 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-medium" />
                                               </div>
                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Hero Background Color (Hex)</label>
                                                     <div className="relative">
                                                        <input type="text" value={cat.backgroundColor || "#fafbff"} onChange={(e) => {
                                                           const newCats = [...categories];
                                                           const idx = newCats.findIndex(c => c.id === cat.id);
                                                           newCats[idx].backgroundColor = e.target.value;
                                                           setCategories(newCats);
                                                        }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                        <input type="color" value={cat.backgroundColor || "#fafbff"} onChange={(e) => {
                                                           const newCats = [...categories];
                                                           const idx = newCats.findIndex(c => c.id === cat.id);
                                                           newCats[idx].backgroundColor = e.target.value;
                                                           setCategories(newCats);
                                                        }} className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10" title="Choose color" />
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-200 pointer-events-none" style={{backgroundColor: cat.backgroundColor || "#fafbff"}}></div>
                                                     </div>
                                                  </div>
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Text Color (Hex)</label>
                                                     <div className="relative">
                                                        <input type="text" value={cat.textColor || "#0f172a"} onChange={(e) => {
                                                           const newCats = [...categories];
                                                           const idx = newCats.findIndex(c => c.id === cat.id);
                                                           newCats[idx].textColor = e.target.value;
                                                           setCategories(newCats);
                                                        }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                        <input type="color" value={cat.textColor || "#0f172a"} onChange={(e) => {
                                                           const newCats = [...categories];
                                                           const idx = newCats.findIndex(c => c.id === cat.id);
                                                           newCats[idx].textColor = e.target.value;
                                                           setCategories(newCats);
                                                        }} className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10" title="Choose text color" />
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-200 pointer-events-none" style={{backgroundColor: cat.textColor || "#0f172a"}}></div>
                                                     </div>
                                                  </div>
                                               </div>
                                               <div>
                                                     <ImageUpload label="Page Header Logo (Override)" value={cat.logoUrl || ""} onChange={(v) => {
                                                         const newCats = [...categories];
                                                         const idx = newCats.findIndex(c => c.id === cat.id);
                                                         newCats[idx].logoUrl = v;
                                                         setCategories(newCats);
                                                     }} />
                                               </div>
                                               <div>
                                                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Top Badge / Tag</label>
                                                  <input type="text" value={cat.heroTag || ""} onChange={(e) => {
                                                     const newCats = [...categories];
                                                     const idx = newCats.findIndex(c => c.id === cat.id);
                                                     newCats[idx].heroTag = e.target.value;
                                                     setCategories(newCats);
                                                  }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" placeholder="e.g. Infrastructure" />
                                               </div>
                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                  <ImageUpload label="Background Banner Image" value={cat.imageUrl || ""} onChange={(v) => {
                                                      const newCats = [...categories];
                                                      const idx = newCats.findIndex(c => c.id === cat.id);
                                                      newCats[idx].imageUrl = v;
                                                      setCategories(newCats);
                                                  }} />
                                                  <ImageUpload label="Hero Background Video" value={cat.videoUrl || ""} onChange={(v) => {
                                                      const newCats = [...categories];
                                                      const idx = newCats.findIndex(c => c.id === cat.id);
                                                      newCats[idx].videoUrl = v;
                                                      setCategories(newCats);
                                                  }} />
                                               </div>
                                               
                                               {!['surface-sports', 'water-sports', 'small-sports', 'budget-sports', 'sports-academies'].includes(slug) && (
                                               <div className="bg-amber-50/30 p-5 rounded-3xl border border-amber-100/50 space-y-4">
                                                   <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                                                      <Star size={10} /> Specialized Hero Grid (3-Image Layout)
                                                   </span>
                                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                      <div className="space-y-4">
                                                         <ImageUpload label="Hero Grid Image 2" value={cat.imageUrl2 || ""} onChange={(v) => {
                                                            const newCats = [...categories];
                                                            const idx = newCats.findIndex(c => c.id === cat.id);
                                                            newCats[idx].imageUrl2 = v;
                                                            setCategories(newCats);
                                                         }} />
                                                         <input type="text" value={cat.imageLabel2 || ""} onChange={(e) => {
                                                            const newCats = [...categories];
                                                            const idx = newCats.findIndex(c => c.id === cat.id);
                                                            newCats[idx].imageLabel2 = e.target.value;
                                                            setCategories(newCats);
                                                         }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400" placeholder="Grid Label 2 (e.g. Experience)" />
                                                      </div>
                                                      <div className="space-y-4">
                                                         <ImageUpload label="Hero Grid Image 3" value={cat.imageUrl3 || ""} onChange={(v) => {
                                                            const newCats = [...categories];
                                                            const idx = newCats.findIndex(c => c.id === cat.id);
                                                            newCats[idx].imageUrl3 = v;
                                                            setCategories(newCats);
                                                         }} />
                                                         <input type="text" value={cat.imageLabel3 || ""} onChange={(e) => {
                                                            const newCats = [...categories];
                                                            const idx = newCats.findIndex(c => c.id === cat.id);
                                                            newCats[idx].imageLabel3 = e.target.value;
                                                            setCategories(newCats);
                                                         }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400" placeholder="Grid Label 3 (e.g. Technical)" />
                                                      </div>
                                                   </div>
                                               </div>
                                               )}

                                               <div className="bg-emerald-50/30 p-5 rounded-3xl border border-emerald-100/50 space-y-4">
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                                     <Handshake size={10} /> Partner Section Branding
                                                  </span>
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Collab Background Color</label>
                                                       <div className="relative">
                                                          <input type="text" value={cat.collabBackgroundColor || "#0f172a"} onChange={(e) => {
                                                             const newCats = [...categories];
                                                             const idx = newCats.findIndex(c => c.id === cat.id);
                                                             newCats[idx].collabBackgroundColor = e.target.value;
                                                             setCategories(newCats);
                                                          }} className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                          <input type="color" value={cat.collabBackgroundColor || "#0f172a"} onChange={(e) => {
                                                             const newCats = [...categories];
                                                             const idx = newCats.findIndex(c => c.id === cat.id);
                                                             newCats[idx].collabBackgroundColor = e.target.value;
                                                             setCategories(newCats);
                                                          }} className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10" />
                                                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-200 pointer-events-none" style={{backgroundColor: cat.collabBackgroundColor || "#0f172a"}}></div>
                                                       </div>
                                                    </div>
                                                    <div>
                                                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Collab Text Color</label>
                                                       <div className="relative">
                                                          <input type="text" value={cat.collabTextColor || "#ffffff"} onChange={(e) => {
                                                             const newCats = [...categories];
                                                             const idx = newCats.findIndex(c => c.id === cat.id);
                                                             newCats[idx].collabTextColor = e.target.value;
                                                             setCategories(newCats);
                                                          }} className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                          <input type="color" value={cat.collabTextColor || "#ffffff"} onChange={(e) => {
                                                             const newCats = [...categories];
                                                             const idx = newCats.findIndex(c => c.id === cat.id);
                                                             newCats[idx].collabTextColor = e.target.value;
                                                             setCategories(newCats);
                                                          }} className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10" />
                                                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-200 pointer-events-none" style={{backgroundColor: cat.collabTextColor || "#ffffff"}}></div>
                                                       </div>
                                                    </div>
                                                  </div>
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                     <Field label="Title" name="collabTitle" value={cat.collabTitle || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].collabTitle = e.target.value;
                                                        setCategories(newCats);
                                                     }} />
                                                     <Field label="Subtitle" name="collabSubtitle" value={cat.collabSubtitle || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].collabSubtitle = e.target.value;
                                                        setCategories(newCats);
                                                     }} />
                                                  </div>
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Description</label>
                                                     <textarea value={cat.collabDescription || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].collabDescription = e.target.value;
                                                        setCategories(newCats);
                                                     }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-medium min-h-[80px]" />
                                                  </div>
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                     <Field label="Button Text" name="collabCtaText" value={cat.collabCtaText || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].collabCtaText = e.target.value;
                                                        setCategories(newCats);
                                                     }} />
                                                     <Field label="Button Link" name="collabCtaLink" value={cat.collabCtaLink || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].collabCtaLink = e.target.value;
                                                        setCategories(newCats);
                                                     }} />
                                                  </div>
                                               </div>


                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Primary Button Text</label>
                                                     <input type="text" value={cat.ctaText || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].ctaText = e.target.value;
                                                        setCategories(newCats);
                                                     }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                  </div>
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Primary Button Link</label>
                                                     <input type="text" value={cat.ctaLink || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].ctaLink = e.target.value;
                                                        setCategories(newCats);
                                                     }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                  </div>
                                               </div>
                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Secondary Button Text</label>
                                                     <input type="text" value={cat.cta2Text || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].cta2Text = e.target.value;
                                                        setCategories(newCats);
                                                     }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                  </div>
                                                  <div>
                                                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Secondary Button Link</label>
                                                     <input type="text" value={cat.cta2Link || ""} onChange={(e) => {
                                                        const newCats = [...categories];
                                                        const idx = newCats.findIndex(c => c.id === cat.id);
                                                        newCats[idx].cta2Link = e.target.value;
                                                        setCategories(newCats);
                                                     }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                  </div>
                                               </div>
                                               <button onClick={async () => {
                                                  const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cat) });
                                                  if (res.ok) showToast("Branding updated successfully!"); else showToast("Save failed", "error");
                                               }} className="bg-slate-900 text-white w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-black transition-all">Save Category Branding</button>
                                            </div>
                                          );
                                       })() : (() => {
                                          const hero = heroes.find(h => h.page === slug);
                                          const data: any = hero || { page: slug, title: `Welcome to ${page?.label}`, subtitle: "Expert infrastructure.", textColor: "#ffffff", overlayOpacity: 0.4 };
                                          return (
                                             <div className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                   <ImageUpload label="Page Header Logo (Override)" value={data.logoUrl || ""} onChange={(v) => {
                                                       const newHeroes = [...heroes];
                                                       const idx = newHeroes.findIndex(h => h.id === data.id);
                                                       if (idx !== -1) {
                                                           newHeroes[idx].logoUrl = v;
                                                           setHeroes(newHeroes);
                                                       } else {
                                                           data.logoUrl = v;
                                                       }
                                                   }} />
                                                </div>
                                                <Field label="Main Headline" name="title" value={data.title} onChange={(e) => {
                                                   const newHeroes = [...heroes];
                                                   const idx = newHeroes.findIndex(h => h.id === data.id);
                                                   if (idx !== -1) {
                                                      newHeroes[idx].title = e.target.value;
                                                      setHeroes(newHeroes);
                                                   }
                                                }} />
                                                <Field label="Sub-headline" name="subtitle" value={data.subtitle || ""} onChange={(e) => {
                                                   const newHeroes = [...heroes];
                                                   const idx = newHeroes.findIndex(h => h.id === data.id);
                                                   if (idx !== -1) {
                                                      newHeroes[idx].subtitle = e.target.value;
                                                      setHeroes(newHeroes);
                                                   }
                                                }} textarea />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                   <div>
                                                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Text Color (Hex)</label>
                                                      <div className="relative">
                                                         <input type="text" value={data.textColor || "#ffffff"} onChange={(e) => {
                                                            const newHeroes = [...heroes];
                                                            const idx = newHeroes.findIndex(h => h.id === data.id);
                                                            if (idx !== -1) {
                                                               newHeroes[idx].textColor = e.target.value;
                                                               setHeroes(newHeroes);
                                                            }
                                                         }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 font-bold" />
                                                         <input type="color" value={data.textColor || "#ffffff"} onChange={(e) => {
                                                            const newHeroes = [...heroes];
                                                            const idx = newHeroes.findIndex(h => h.id === data.id);
                                                            if (idx !== -1) {
                                                               newHeroes[idx].textColor = e.target.value;
                                                               setHeroes(newHeroes);
                                                            }
                                                         }} className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10" title="Choose color" />
                                                         <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-200 pointer-events-none" style={{backgroundColor: data.textColor || "#ffffff"}}></div>
                                                      </div>
                                                   </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                   <ImageUpload label="Hero Background Media" value={data.imageUrl || ""} onChange={(v) => {
                                                      const newHeroes = [...heroes];
                                                      const idx = newHeroes.findIndex(h => h.id === data.id);
                                                      if (idx !== -1) {
                                                         newHeroes[idx].imageUrl = v;
                                                         setHeroes(newHeroes);
                                                      }
                                                   }} />
                                                   <ImageUpload label="Hero Background Video" value={data.videoUrl || ""} onChange={(v) => {
                                                      const newHeroes = [...heroes];
                                                      const idx = newHeroes.findIndex(h => h.id === data.id);
                                                      if (idx !== -1) {
                                                         newHeroes[idx].videoUrl = v;
                                                         setHeroes(newHeroes);
                                                      }
                                                   }} />
                                                </div>

                                                <button onClick={async () => {
                                                   const res = await fetch(data.id ? `/api/admin/hero/${data.id}` : "/api/admin/hero", { method: data.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                                                   if (res.ok) {
                                                      const h = await fetchData("/api/admin/hero");
                                                      if (h) setHeroes(h);
                                                      showToast("Hero refreshed!");
                                                   }
                                                }} className="bg-slate-900 text-white w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-black transition-all">Save Hero Content</button>
                                             </div>
                                          );
                                       })()}
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                                       <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 animate-pulse">
                                          <AlertCircle size={32} />
                                       </div>
                                       <h4 className="font-bold text-slate-800 text-sm mb-2">Live Preview Note</h4>
                                       <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Changes made here are synced directly to the primary database. Your website will reflect these updates instantly after saving.</p>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* SECTION: TICKER */}
                           {activePageSection === "ticker" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h3 className="text-xl font-black text-slate-800 mb-1">Scrolling Announcement Ticker</h3>
                                       <p className="text-sm text-slate-500 font-medium font-mono">Updates visible on the global header</p>
                                    </div>
                                    <button onClick={() => openModal("ticker")} className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/20 uppercase tracking-widest">+ Add New Entry</button>
                                 </div>
                                 <div className="space-y-3">
                                    {tickerItems.map(tk => (
                                       <div key={tk.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-amber-200 transition-all group">
                                          <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-800 text-sm">{tk.order}</div>
                                             <span className="font-bold text-slate-700">{tk.text}</span>
                                          </div>
                                          <div className="flex gap-2">
                                             <button onClick={() => openModal("ticker", tk)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all"><Pencil size={14} /></button>
                                             <button onClick={() => deleteTicker(tk.id)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"><Trash2 size={14} /></button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* SECTION: NAV CATEGORIES */}
                           {activePageSection === "nav_categories" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h3 className="text-xl font-black text-slate-800 mb-1">Navbar Surface Categories</h3>
                                       <p className="text-sm text-slate-500 font-medium">Global category groups visible in the main navigation</p>
                                    </div>
                                    <button onClick={() => openModal("category")} className="bg-slate-900 border border-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-xl shadow-slate-900/10 uppercase tracking-widest">+ Manage Main Types</button>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categories.map(c => (
                                       <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group">
                                          <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-slate-200/50">
                                             {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover" /> : <Palette className="w-full h-full p-5 text-slate-300" />}
                                          </div>
                                          <div className="flex-1">
                                             <h5 className="font-black text-slate-800 text-sm">{c.label}</h5>
                                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order: {c.order}</p>
                                          </div>
                                          <div className="flex gap-2">
                                             <button onClick={() => openModal("category", c)} className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-amber-500 transition-colors shadow-sm"><Pencil size={14} /></button>
                                             <button onClick={() => deleteCategory(c.id)} className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm"><Trash2 size={14} /></button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* SECTION: PORTFOLIO / GRID CARDS */}
                           {activePageSection === "portfolio" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h3 className="text-xl font-black text-slate-800 mb-1">Portfolio Experience Grid</h3>
                                       <p className="text-sm text-slate-500 font-medium">The 4-block visual explorer on the homepage</p>
                                    </div>
                                    <button onClick={() => openModal("homepage")} className="bg-amber-500 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/10 uppercase tracking-widest">+ Add Feature Card</button>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {homepageGridItems.map(item => (
                                       <div key={item.id} className="group bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden hover:bg-white hover:shadow-2xl transition-all">
                                          <div className="aspect-video relative overflow-hidden">
                                             <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button onClick={() => openModal("homepage", item)} className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center hover:scale-110 transition-all"><Pencil size={16} /></button>
                                                <button onClick={() => deleteHomepageGridItem(item.id)} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all"><Trash2 size={16} /></button>
                                             </div>
                                          </div>
                                          <div className="p-6">
                                             <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-black text-slate-800 text-base">{item.label}</h5>
                                                <span className="text-[10px] font-black bg-white px-2 py-1 rounded-md border border-slate-100">POS. {item.order}</span>
                                             </div>
                                             <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* SECTION: SUBCATEGORIES */}
                           {activePageSection === "subcategories" && (
                             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between">
                                   <div>
                                      <h3 className="text-xl font-black text-slate-800 mb-1">Manage Surface Types</h3>
                                      <p className="text-sm text-slate-500 font-medium">Fine-grained specialization filters for this category</p>
                                   </div>
                                   <button 
                                      onClick={() => openModal("subcategory", { categoryId: categories.find(c => slugify(c.label) === slug || c.id === slug)?.id })}
                                      className="bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black transition shadow-xl shadow-slate-900/10 uppercase tracking-widest"
                                   >
                                      + Add Specialized Type
                                   </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                   {subCategories
                                      .filter(sc => slugify(sc.category?.label) === slug || sc.categoryId === categories.find(c => slugify(c.label) === slug)?.id)
                                      .map(sc => (
                                      <div key={sc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-amber-300 transition-all">
                                         <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-glow"></div>
                                            <span className="font-bold text-slate-700 text-sm">{sc.name}</span>
                                         </div>
                                         <div className="flex gap-1">
                                            <button onClick={() => openModal("subcategory", sc)} className="p-2 text-slate-300 hover:text-amber-600 transition-colors"><Pencil size={14} /></button>
                                            <button onClick={() => deleteSubCategory(sc.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                         </div>
                                      </div>
                                   ))}
                                   {subCategories.filter(sc => slugify(sc.category?.label) === slug || sc.categoryId === categories.find(c => slugify(c.label) === slug)?.id).length === 0 && (
                                     <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                        <Map size={48} className="mx-auto text-slate-100 mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No specialized types assigned yet</p>
                                     </div>
                                   )}
                                </div>
                             </div>
                           )}

                           {/* SECTION: LOGOS / BRANDS */}
                           {activePageSection === "logos" && (
                             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between">
                                   <div>
                                      <h3 className="text-xl font-black text-slate-800 mb-1">Category Partners & Logos</h3>
                                      <p className="text-sm text-slate-500 font-medium">Brand integrations specifically for this group</p>
                                   </div>
                                   <button 
                                      onClick={() => openModal("collaboration", { categoryId: categories.find(c => slugify(c.label) === slug || c.id === slug)?.id })}
                                      className="bg-amber-500 text-white px-5 py-3 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/10 uppercase tracking-widest"
                                   >
                                      + Link Partner Logo
                                   </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                   {collaborations
                                      .filter(c => c.categoryId === categories.find(cat => slugify(cat.label) === slug)?.id || (c.isGlobal && isHome))
                                      .map(cl => (
                                      <div key={cl.id} className="group aspect-square bg-slate-50 rounded-3xl border border-slate-100 p-6 flex flex-col items-center justify-center relative hover:bg-white hover:shadow-xl transition-all">
                                         <img src={cl.imageUrl} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                         <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center gap-2">
                                            <button onClick={() => openModal("collaboration", cl)} className="w-8 h-8 rounded-lg bg-white text-slate-800 flex items-center justify-center"><Pencil size={12} /></button>
                                            <button onClick={() => deleteCollaboration(cl.id)} className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center"><Trash2 size={12} /></button>
                                         </div>
                                         {cl.isGlobal && <span className="absolute top-2 left-2 text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-sm border border-amber-200/50">Global</span>}
                                      </div>
                                   ))}
                                   {collaborations.filter(c => c.categoryId === categories.find(cat => slugify(cat.label) === slug)?.id || (c.isGlobal && isHome)).length === 0 && (
                                      <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                         <Handshake size={48} className="mx-auto text-slate-100 mb-4" />
                                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No brand partners assigned</p>
                                      </div>
                                   )}
                                </div>
                             </div>
                           )}

                           {/* SECTION: PRODUCTS (Linked) */}
                           {activePageSection === "products" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h3 className="text-xl font-black text-slate-800 mb-1">Catalogued Surfaces</h3>
                                       <p className="text-sm text-slate-500 font-medium">All specialized platforms assigned to the {page?.label} sector</p>
                                    </div>
                                    <button 
                                       onClick={() => openModal("product", { category: page?.label })}
                                       className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black transition shadow-xl shadow-slate-900/10 uppercase tracking-widest"
                                    >
                                       + Add New Offering
                                    </button>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {products
                                       .filter(p => slugify(p.category) === slug)
                                       .map(p => (
                                       <div key={p.id} className="group bg-slate-50 rounded-[2.5rem] border border-slate-100 p-4 flex gap-5 hover:bg-white hover:shadow-2xl transition-all">
                                          <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 border border-slate-200/50">
                                             <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                          </div>
                                          <div className="flex-1 flex flex-col justify-center">
                                             <h5 className="font-black text-slate-800 text-sm leading-tight mb-1">{p.name}</h5>
                                             <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-3">{p.subCategory?.name || "Standard Class"}</p>
                                             <div className="flex gap-2">
                                                <button onClick={() => openModal("product", p)} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Edit</button>
                                                <button onClick={() => deleteProduct(p.id)} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Del</button>
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                    {products.filter(p => slugify(p.category) === slug).length === 0 && (
                                      <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                         <Package size={48} className="mx-auto text-slate-100 mb-4" />
                                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No products assigned to this sector catalog</p>
                                      </div>
                                    )}
                                 </div>
                              </div>
                           )}

                           {/* SECTION: LANDMARKS (Projects) */}
                           {activePageSection === "landmarks" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h3 className="text-xl font-black text-slate-800 mb-1">Landmark Projects</h3>
                                       <p className="text-sm text-slate-500 font-medium">Showcasing elite installations across the globe</p>
                                    </div>
                                    <button onClick={() => openModal("project")} className="bg-purple-600 text-white px-5 py-3 rounded-xl text-xs font-black transition shadow-lg shadow-purple-500/20 uppercase tracking-widest">+ Add Project</button>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map(p => (
                                       <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition-all group">
                                          <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden border border-slate-200/50">
                                             <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt="" />
                                          </div>
                                          <div className="flex-1">
                                             <h5 className="font-black text-slate-800 text-sm line-clamp-1">{p.name}</h5>
                                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.city}, {p.state}</p>
                                          </div>
                                          <button onClick={() => openModal("project", p)} className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-purple-600 transition-colors shadow-sm"><Pencil size={14} /></button>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* SECTION: TESTIMONIALS */}
                           {activePageSection === "testimonials" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h3 className="text-xl font-black text-slate-800 mb-1">User Testimonials</h3>
                                       <p className="text-sm text-slate-500 font-medium">Verified endorsements from sports institutions</p>
                                    </div>
                                    <button onClick={() => openModal("testimonial")} className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs font-black transition shadow-lg shadow-emerald-500/20 uppercase tracking-widest">+ Add Proof</button>
                                 </div>
                                 <div className="space-y-4">
                                    {testimonials.map(t => (
                                       <div key={t.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group relative">
                                          <div className="flex items-center gap-4 mb-3">
                                             <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-700">{t.avatar || t.name[0]}</div>
                                             <div>
                                                <h5 className="font-black text-slate-800 text-sm leading-none">{t.name}</h5>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.institution}</p>
                                             </div>
                                          </div>
                                          <p className="text-xs text-slate-600 italic font-medium leading-relaxed max-w-2xl">"{t.quote}"</p>
                                          <div className="absolute top-6 right-6 flex gap-2">
                                             <button onClick={() => openModal("testimonial", t)} className="p-2 bg-white rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"><Pencil size={12} /></button>
                                             <button onClick={() => deleteTestimonial(t.id)} className="p-2 bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
             );
          })()}

          {/* DYNAMIC TABS FOR OTHER SYSTEMS */}
          {tab === "page-manager" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[42px] font-black leading-none tracking-[-0.06em] text-slate-800">Page Manager</h2>
                  <p className="mt-2 text-sm text-slate-500">Manage all pages on the site, including About, Products, categories, and custom pages.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openPageEditor()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f7b64e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#eea937]"
                >
                  <Plus size={16} /> Add Page
                </button>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_0.9fr_0.9fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  <span>Page</span>
                  <span>Slug</span>
                  <span>Path</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>

                {pageManagerPages.map((page) => (
                  <div key={page.id} className="grid grid-cols-[1.5fr_1fr_1fr_0.9fr_0.9fr] items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-b-0">
                    <div>
                      <div className="text-base font-bold text-slate-800">{page.label}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{page.section}</div>
                    </div>
                    <div className="text-sm text-slate-600">/{page.slug}</div>
                    <div className="text-sm text-slate-600">{page.path}</div>
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${page.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {page.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => window.open(page.path, "_blank")} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50">View</button>
                      {page.section === "category" || HERO_EDITABLE_SLUGS.includes(page.slug) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTab(`page_${page.slug}`);
                            setActiveGroup("pages");
                            setActivePageSection("hero");
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      ) : (
                        <button type="button" onClick={() => openPageEditor(page)} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50">Edit</button>
                      )}
                      {page.section !== "category" && (
                        <button type="button" onClick={() => deletePageManagerEntry(page)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
                </div>
                </div>
              </div>
            </div>
          )}

          {tab === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-8 text-[56px] font-black leading-none tracking-[-0.06em] text-slate-800">Dashboard Overview</h2>

              <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Users", value: stats.userCount, icon: <Users size={28} />, color: "bg-[#5d8bf3]" },
                  { label: "Products", value: stats.productCount, icon: <Package size={28} />, color: "bg-[#f7b64e]" },
                  { label: "Projects", value: stats.projectCount, icon: <Briefcase size={28} />, color: "bg-[#3ec2a0]" },
                  { label: "Testimonials", value: stats.testimonialCount, icon: <Star size={28} />, color: "bg-[#b96ae8]" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-[22px] border border-slate-200 bg-white px-6 py-6 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] text-white shadow-sm ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-[56px] font-black leading-none tracking-[-0.08em] text-slate-800">{stat.value}</div>
                      <div className="mt-2 text-xl font-medium text-slate-600">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                <h3 className="mb-6 text-[31px] font-black tracking-[-0.05em] text-slate-800">Quick Links</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Hero Sections", icon: <ImageIcon size={18} />, active: true },
                    { label: "Navigation", icon: <Map size={18} />, active: true },
                    { label: "Navbar Categories", icon: <Palette size={18} />, active: true },
                    { label: "Homepage Grid", icon: <Grid3x3 size={18} />, active: true },
                    { label: "Products", icon: <Package size={18} />, active: true },
                    { label: "Projects", icon: <Briefcase size={18} />, active: true },
                    { label: "Testimonials", icon: <Star size={18} />, active: true },
                    { label: "Users", icon: <Users size={18} />, active: true },
                    { label: "Announcement Ticker", icon: <Megaphone size={18} />, active: true },
                    { label: "Page Content", icon: <Type size={18} />, active: true },
                    { label: "Site Settings", icon: <Settings size={18} />, active: true },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (idx === 0) setTab("page_home");
                        else if (idx === 1) setTab("page_home");
                        else if (idx === 2) setTab("page_home");
                        else if (idx === 3) setTab("page_home");
                        else if (idx === 4) setTab("products");
                        else if (idx === 5) setTab("projects");
                        else if (idx === 6) setTab("testimonials");
                        else if (idx === 7) setTab("users");
                        else if (idx === 8) setTab("settings");
                        else if (idx === 9) setTab("page_home");
                        else setTab("settings");
                      }}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#f8f9fb] px-4 py-4 text-left text-lg font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f7d18a] bg-[#fffaf1] text-[#d68a15]">
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}



        {/* PRODUCTS */}
        {tab === "products" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Product Catalog</h2>
                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                  <Package size={14} className="text-amber-500" /> Managing {products.length} high-performance sports surfaces
                </p>
              </div>
              <button
                onClick={() => openModal("product")}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-bold transition shadow-xl shadow-slate-900/10 active:scale-95"
              >
                <Plus size={18} /> New Product
              </button>
            </div>

            <div className="relative mb-8 group">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search by name, category, or subcategory..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products
                .filter(p => !productSearch || [p.name, p.category, p.subCategory?.name].some(v => v?.toLowerCase().includes(productSearch.toLowerCase())))
                .map(p => (
                <div key={p.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col">
                  {/* Image/Header area */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package size={48} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {p.isFeatured && <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-amber-400/20">Featured</span>}
                      {p.isNew && <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">New</span>}
                    </div>
                  </div>

                  {/* Body area */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{p.category}</span>
                      {p.subCategory?.name && (
                        <>
                          <ChevronDown size={10} className="text-slate-300 -rotate-90" />
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{p.subCategory.name}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-amber-600 transition-colors uppercase">{p.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{p.description}</p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <ImageIcon size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {p.imagesJson ? JSON.parse(p.imagesJson).length : 1} Images
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Settings size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {p.specs ? JSON.parse(p.specs).length : 0} Specs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions area */}
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                    <button
                      onClick={() => openModal("product", p)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors active:scale-95"
                    >
                      <Pencil size={14} className="text-slate-400" /> Edit Details
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-2.5 text-red-500 border border-transparent hover:border-red-100 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Package size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No products in catalog</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Start by adding your first sports surface solution to showcase to your clients.</p>
                <button onClick={() => openModal("product")} className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-3 rounded-2xl font-bold transition">Add Now</button>
              </div>
            )}
          </div>
        )}

        {/* CATEGORY & STRUCTURE HUB */}
        {tab === "categories" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">Logical Category Tree</h2>
                 <p className="text-sm text-slate-500 font-medium">Define surface families and their underlying sub-types</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => openModal("subcategory")} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition">
                   <Plus size={16} /> New Sub-Type
                 </button>
                 <button onClick={() => openModal("category")} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-lg shadow-amber-500/10">
                   <Plus size={16} /> Add Main Category
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Category Sidebar List */}
              <div className="lg:col-span-4 space-y-4">
                 <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 h-fit">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Main Families</h4>
                    <div className="space-y-2">
                       {categories.map(c => (
                         <div key={c.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                                  {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover" /> : <Palette size={16} className="text-slate-400" />}
                               </div>
                               <span className="font-bold text-slate-700 text-sm">{c.label}</span>
                            </div>
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => openModal("category", c)} className="p-2 text-slate-400 hover:text-amber-600"><Pencil size={14} /></button>
                               <button onClick={() => deleteCategory(c.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Sub-Category Tree View */}
              <div className="lg:col-span-8">
                 <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Hierarchy & Sub-Categories</h4>
                       <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase italic border border-slate-100">Drag & Drop soon</div>
                    </div>
                    
                    <div className="space-y-8">
                       {categories.map(cat => (
                         <div key={cat.id} className="relative pl-8 border-l-2 border-slate-50 translate-x-2">
                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm shadow-amber-500/20"></div>
                            <h5 className="font-black text-slate-800 text-xs uppercase tracking-tighter mb-4 flex items-center gap-2">
                               {cat.label} 
                               <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-2 rounded-full lowercase tracking-normal">Parent</span>
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                               {subCategories.filter(sc => sc.categoryId === cat.id).map(sc => (
                                 <div key={sc.id} className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-amber-200 group transition-all">
                                    <div className="flex items-center gap-3">
                                       <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-amber-400 transition-colors"></div>
                                       <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">{sc.name}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                       <button onClick={() => openModal("subcategory", sc)} className="p-2 text-slate-300 hover:text-amber-600 transition-colors"><Pencil size={12} /></button>
                                       <button onClick={() => deleteSubCategory(sc.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                    </div>
                                 </div>
                               ))}
                               {subCategories.filter(sc => sc.categoryId === cat.id).length === 0 && (
                                  <div className="col-span-full py-4 text-center border border-dashed border-slate-100 rounded-2xl text-[10px] text-slate-400 font-bold uppercase tracking-widest">No types defined yet</div>
                               )}
                            </div>
                         </div>
                       ))}
                       {categories.length === 0 && (
                         <div className="py-20 text-center">
                            <Package size={48} className="mx-auto text-slate-100 mb-4" />
                            <p className="text-slate-400 text-sm font-medium">Create a category to get started with the structure hub.</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}



        {/* PROJECTS */}
        {tab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">Projects ({projects.length})</h2>
              <button onClick={() => openModal("project")} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                <Plus size={16} /> Add Project
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-cover" onError={e => (e.currentTarget.style.display = "none")} />}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{p.city}, {p.state} · {p.year}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.surface} · {p.area}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openModal("project", p)} className="flex items-center gap-1.5 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"><Pencil size={12} /> Edit</button>
                      <button onClick={() => deleteProject(p.id)} className="flex items-center gap-1.5 text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <div className="col-span-3 text-center py-16 text-slate-400">No projects yet.</div>}
            </div>
          </div>
        )}

        {/* TESTIMONIALS */}
        {tab === "testimonials" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">Testimonials</h2>
              <button onClick={() => openModal("testimonial")} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                <Plus size={16} /> Add Testimonial
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">{t.avatar || t.name[0]}</div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.institution}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 italic">"{t.quote}"</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openModal("testimonial", t)} className="flex items-center gap-1.5 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"><Pencil size={12} /> Edit</button>
                    <button onClick={() => deleteTestimonial(t.id)} className="flex items-center gap-1.5 text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REQUESTS */}
        {tab === "requests" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800">Requests</h2>
              <p className="mt-2 text-sm text-slate-500">Review quote requests and contact inquiries submitted through the website.</p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRequestView("quotes")}
                className={`rounded-2xl border p-5 text-left transition ${requestView === "quotes" ? "border-amber-300 bg-amber-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Quote Requests</div>
                <div className="mt-2 text-3xl font-black text-slate-800">{quoteRequests.length}</div>
              </button>
              <button
                type="button"
                onClick={() => setRequestView("contacts")}
                className={`rounded-2xl border p-5 text-left transition ${requestView === "contacts" ? "border-amber-300 bg-amber-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Contact Requests</div>
                <div className="mt-2 text-3xl font-black text-slate-800">{contactRequests.length}</div>
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
                  {requestView === "quotes" ? "Quote Requests" : "Contact Requests"}
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {visibleRequests.map(request => (
                  <article key={request.id} className="p-5 transition hover:bg-slate-50/60">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-base font-bold text-slate-800">{request.name}</h4>
                          <select
                            value={request.status}
                            onChange={event => updateRequestStatus(request.id, event.target.value)}
                            className={`rounded-full border-0 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider focus:ring-2 focus:ring-amber-300 ${request.status === "pending" ? "bg-amber-100 text-amber-700" : request.status === "rejected" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                            aria-label={`Update status for ${request.name}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                          <a href={`mailto:${request.email}`} className="hover:text-amber-600">{request.email}</a>
                          {request.phone && <a href={`tel:${request.phone}`} className="hover:text-amber-600">{request.phone}</a>}
                          {request.city && <span>{request.city}</span>}
                          <span>{new Date(request.createdAt).toLocaleString()}</span>
                        </div>
                        {request.surface && <div className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-600">{request.surface}</div>}
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{request.message}</p>
                      </div>
                    </div>
                  </article>
                ))}
                {visibleRequests.length === 0 && (
                  <div className="px-5 py-16 text-center text-sm text-slate-400">No {requestView === "quotes" ? "quote" : "contact"} requests found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-4">User Management</h2>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3">Name</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3">Email</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3">Role</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3">Status</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3 text-sm font-medium text-slate-800">{u.name || "—"}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">{u.email || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.emailVerified ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {u.emailVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="px-5 py-3 flex justify-end">
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No users found.</td></tr>}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-6">Site Settings</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Site Name" name="siteName" value={settings.siteName} onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))} required />
                <Field label="Logo URL" name="logoUrl" value={settings.logoUrl || ""} onChange={e => setSettings(s => ({ ...s, logoUrl: e.target.value }))} />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><Palette size={14} /> Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.primaryColor} onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                      <input type="text" value={settings.primaryColor} onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))} className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.secondaryColor} onChange={e => setSettings(s => ({ ...s, secondaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                      <input type="text" value={settings.secondaryColor} onChange={e => setSettings(s => ({ ...s, secondaryColor: e.target.value }))} className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><Type size={14} /> Typography</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Heading Font" name="fontHeading" value={settings.fontHeading} onChange={e => setSettings(s => ({ ...s, fontHeading: e.target.value }))} />
                  <Field label="Body Font" name="fontBody" value={settings.fontBody} onChange={e => setSettings(s => ({ ...s, fontBody: e.target.value }))} />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><LayoutDashboard size={14} /> Layout Visibility</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition">
                    <input type="checkbox" checked={!!settings.showCategoryBar} onChange={e => setSettings(s => ({ ...s, showCategoryBar: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
                    <span className="text-slate-700">Category Ribbon</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition">
                    <input type="checkbox" checked={!!settings.showTicker} onChange={e => setSettings(s => ({ ...s, showTicker: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
                    <span className="text-slate-700">Announcement Ticker bar</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><LayoutDashboard size={14} /> CTA Bottom Banner</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="CTA Title" name="ctaTitle" value={settings.ctaTitle || ""} onChange={e => setSettings(s => ({ ...s, ctaTitle: e.target.value }))} />
                  <Field label="Button Text" name="ctaButton" value={settings.ctaButton || ""} onChange={e => setSettings(s => ({ ...s, ctaButton: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="CTA Subtitle" name="ctaSubtitle" value={settings.ctaSubtitle || ""} onChange={e => setSettings(s => ({ ...s, ctaSubtitle: e.target.value }))} />
                  <Field label="Redirect Link" name="ctaLink" value={settings.ctaLink || ""} onChange={e => setSettings(s => ({ ...s, ctaLink: e.target.value }))} />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><LayoutDashboard size={14} /> Stat Counters & Certifications (JSON Array format)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Stats Json (value/label)" name="statsJson" value={settings.statsJson || "[]"} onChange={e => setSettings(s => ({ ...s, statsJson: e.target.value }))} textarea />
                  <Field label="Certifications Json (title/imageUrl)" name="certsJson" value={settings.certsJson || "[]"} onChange={e => setSettings(s => ({ ...s, certsJson: e.target.value }))} textarea />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><ImageIcon size={14} /> Home Hero & Brand Copy</h3>
                <div className="space-y-4">
                  <Field label="Home Hero Tag" name="homeHeroTag" value={settings.homeHeroTag || ""} onChange={e => setSettings(s => ({ ...s, homeHeroTag: e.target.value }))} />
                  <Field label="Home Hero Title" name="homeHeroTitle" value={settings.homeHeroTitle || ""} onChange={e => setSettings(s => ({ ...s, homeHeroTitle: e.target.value }))} />
                  <Field label="Home Hero Subtitle" name="homeHeroSubtitle" value={settings.homeHeroSubtitle || ""} onChange={e => setSettings(s => ({ ...s, homeHeroSubtitle: e.target.value }))} textarea />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Primary CTA Text" name="homeHeroPrimaryButtonText" value={settings.homeHeroPrimaryButtonText || ""} onChange={e => setSettings(s => ({ ...s, homeHeroPrimaryButtonText: e.target.value }))} />
                    <Field label="Primary CTA Link" name="homeHeroPrimaryButtonLink" value={settings.homeHeroPrimaryButtonLink || ""} onChange={e => setSettings(s => ({ ...s, homeHeroPrimaryButtonLink: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Secondary CTA Text" name="homeHeroSecondaryButtonText" value={settings.homeHeroSecondaryButtonText || ""} onChange={e => setSettings(s => ({ ...s, homeHeroSecondaryButtonText: e.target.value }))} />
                    <Field label="Secondary CTA Link" name="homeHeroSecondaryButtonLink" value={settings.homeHeroSecondaryButtonLink || ""} onChange={e => setSettings(s => ({ ...s, homeHeroSecondaryButtonLink: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><Link2 size={14} /> Contact Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email" name="contactEmail" value={settings.contactEmail || ""} onChange={e => setSettings(s => ({ ...s, contactEmail: e.target.value }))} />
                  <Field label="Phone" name="contactPhone" value={settings.contactPhone || ""} onChange={e => setSettings(s => ({ ...s, contactPhone: e.target.value }))} />
                </div>
                <Field label="Address" name="address" value={settings.address || ""} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} textarea />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><Globe size={14} /> Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Facebook" name="facebookLink" value={settings.facebookLink || ""} onChange={e => setSettings(s => ({ ...s, facebookLink: e.target.value }))} placeholder="https://facebook.com/..." />
                  <Field label="Twitter (X)" name="twitterLink" value={settings.twitterLink || ""} onChange={e => setSettings(s => ({ ...s, twitterLink: e.target.value }))} placeholder="https://twitter.com/..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="Instagram" name="instagramLink" value={settings.instagramLink || ""} onChange={e => setSettings(s => ({ ...s, instagramLink: e.target.value }))} placeholder="https://instagram.com/..." />
                  <Field label="LinkedIn" name="linkedinLink" value={settings.linkedinLink || ""} onChange={e => setSettings(s => ({ ...s, linkedinLink: e.target.value }))} placeholder="https://linkedin.com/..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="YouTube" name="youtubeLink" value={settings.youtubeLink || ""} onChange={e => setSettings(s => ({ ...s, youtubeLink: e.target.value }))} placeholder="https://youtube.com/..." />
                  <Field label="Pinterest" name="pinterestLink" value={settings.pinterestLink || ""} onChange={e => setSettings(s => ({ ...s, pinterestLink: e.target.value }))} placeholder="https://pinterest.com/..." />
                </div>
              </div>

              <button onClick={saveSettings} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>
        )}
        {tab === "collaborations" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Partners & Collaborations</h2>
                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                  <Handshake size={14} className="text-amber-500" /> Manage global and category-specific partnerships
                </p>
              </div>
              <button
                onClick={() => openModal("collaboration")}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-bold transition shadow-xl shadow-slate-900/10"
              >
                <Plus size={18} /> New Partner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collaborations.map(c => (
                <div key={c.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col p-5">
                  <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-6 mb-4 overflow-hidden relative">
                     <img src={c.imageUrl} alt={c.name} className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110" />
                     {c.isGlobal && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow-lg shadow-emerald-500/20 z-10">Global</div>
                     )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tighter">{c.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400">#{c.order}</span>
                    </div>
                    {c.category?.label && <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">{c.category.label}</p>}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{c.description || "No description provided."}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex gap-2">
                    <button onClick={() => openModal("collaboration", c)} className="flex-1 text-[10px] font-bold border border-slate-200 py-2 rounded-lg hover:bg-slate-50 transition uppercase tracking-widest">Edit</button>
                    <button onClick={() => deleteCollaboration(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {collaborations.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <Handshake size={48} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">No collaborations found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Add partners and brands you collaborate with to show them on your inner pages.</p>
                    <button onClick={() => openModal("collaboration")} className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Add Partner Logo</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENT HUB OVERVIEW */}
        {tab === "overview" && stats.productCount === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
             <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                <Package size={40} className="text-amber-500" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Empty Catalog</h3>
             <p className="text-slate-500 text-center max-w-sm mb-8">You haven't added any products or projects yet. Start by populating your database.</p>
             <button onClick={() => setTab("products")} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold transition shadow-xl shadow-slate-900/10">Go to Products</button>
          </div>
        )}


      {/* ========= MODALS ========= */}

      {modal?.type === "hero" && (
        <Modal title={formData.id ? "Edit Hero Section" : "Add Hero Section"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Page" name="page" value={formData.page || ""} onChange={handleFormChange} required />
            <Field label="Title" name="title" value={formData.title || ""} onChange={handleFormChange} required />
            <Field label="Subtitle" name="subtitle" value={formData.subtitle || ""} onChange={handleFormChange} textarea />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <ImageUpload label="Hero Media Image" value={formData.imageUrl || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl: v }))} />
               <ImageUpload label="Hero Background Video" value={formData.videoUrl || ""} onChange={(v) => setFormData(p => ({ ...p, videoUrl: v }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="CTA Text" name="ctaText" value={formData.ctaText || ""} onChange={handleFormChange} />
              <Field label="CTA Link" name="ctaLink" value={formData.ctaLink || ""} onChange={handleFormChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Text Color</label>
              <input type="color" name="textColor" value={formData.textColor || "#ffffff"} onChange={handleFormChange} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
            </div>
            <button onClick={saveHero} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
              <Save size={16} /> Save Hero
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "page_editor" && (
         <Modal title={`Configuring: ${modal.data.label}`} onClose={() => setModal(null)}>
           <div className="space-y-6">
              
              {/* Common Hero Fields (Title/Sub/Image) */}
              <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><ImageIcon size={18} /></div>
                    <h4 className="font-black text-sm text-slate-800 uppercase tracking-tighter">Hero Banner Content</h4>
                  </div>
                  
                  {formData._modelType === "category" ? (
                      <>
                        <Field label="Banner Title" name="label" value={formData.label || ""} onChange={handleFormChange} required />
                        <Field label="Short Banner Text" name="description" value={formData.description || ""} onChange={handleFormChange} textarea />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <ImageUpload label="Hero Background Image" value={formData.imageUrl || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl: v }))} />
                           <ImageUpload label="Hero Background Video" value={formData.videoUrl || ""} onChange={(v) => setFormData(p => ({ ...p, videoUrl: v }))} />
                        </div>
                        <div className="pt-2">
                           <Field label="Top Badge/Tag" name="heroTag" value={formData.heroTag || ""} onChange={handleFormChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <Field label="Button 1 Text" name="ctaText" value={formData.ctaText || ""} onChange={handleFormChange} />
                           <Field label="Button 1 Link" name="ctaLink" value={formData.ctaLink || ""} onChange={handleFormChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <Field label="Button 2 Text" name="cta2Text" value={formData.cta2Text || ""} onChange={handleFormChange} />
                           <Field label="Button 2 Link" name="cta2Link" value={formData.cta2Link || ""} onChange={handleFormChange} />
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Palette size={18} /></div>
                             <h4 className="font-black text-sm text-slate-800 uppercase tracking-tighter">Page Theming & Colors</h4>
                           </div>
                           <div>
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 px-1">Page Background Color</label>
                             <div className="flex items-center gap-2">
                                <input type="color" name="backgroundColor" value={formData.backgroundColor || "#0f172a"} onChange={handleFormChange} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                                <input type="text" name="backgroundColor" value={formData.backgroundColor || "#0f172a"} onChange={handleFormChange} className="flex-1 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-mono" />
                             </div>
                             <p className="text-[10px] text-slate-400 mt-1 pl-1">Edit the access color option for specific blocks and background.</p>
                           </div>
                        </div>
                      </>
                  ) : formData._modelType === "settings" && modal.data.slug === "about" ? (
                      <>
                        <Field label="Story Title (Home Hero)" name="aboutOriginTitle" value={formData.aboutOriginTitle || ""} onChange={handleFormChange} />
                        <Field label="The Origin (Narrative)" name="aboutOriginText" value={formData.aboutOriginText || ""} onChange={handleFormChange} textarea />
                        <ImageUpload label="About Page Image" value={formData.aboutImageUrl || ""} onChange={(value) => setFormData((current) => ({ ...current, aboutImageUrl: value }))} />
                      </>
                  ) : formData._modelType === "settings" && modal.data.slug === "contact" ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <Field label="Email" name="contactEmail" value={formData.contactEmail || ""} onChange={handleFormChange} />
                           <Field label="Phone" name="contactPhone" value={formData.contactPhone || ""} onChange={handleFormChange} />
                        </div>
                        <Field label="Office Address" name="address" value={formData.address || ""} onChange={handleFormChange} textarea />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <Field label="Office Hours" name="officeHours" value={formData.officeHours || ""} onChange={handleFormChange} />
                           <Field label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber || ""} onChange={handleFormChange} />
                        </div>
                      </>
                  ) : (
                      <>
                        <Field label="Banner Title" name="title" value={formData.title || ""} onChange={handleFormChange} required />
                        <Field label="Subtitle" name="subtitle" value={formData.subtitle || ""} onChange={handleFormChange} textarea />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <ImageUpload label="Hero Background Image" value={formData.imageUrl || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl: v }))} />
                           <ImageUpload label="Hero Background Video" value={formData.videoUrl || ""} onChange={(v) => setFormData(p => ({ ...p, videoUrl: v }))} />
                        </div>
                        <div className="pt-2">
                           <Field label="Top Badge/Tag" name="heroTag" value={formData.heroTag || ""} onChange={handleFormChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <Field label="Button 1 Text" name="ctaText" value={formData.ctaText || ""} onChange={handleFormChange} />
                           <Field label="Button 1 Link" name="ctaLink" value={formData.ctaLink || ""} onChange={handleFormChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <Field label="Button 2 Text" name="cta2Text" value={formData.cta2Text || ""} onChange={handleFormChange} />
                           <Field label="Button 2 Link" name="cta2Link" value={formData.cta2Link || ""} onChange={handleFormChange} />
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Palette size={18} /></div>
                             <h4 className="font-black text-sm text-slate-800 uppercase tracking-tighter">Page Theming & Colors</h4>
                           </div>
                           <div>
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 px-1">Page Background Color</label>
                             <div className="flex items-center gap-2">
                                <input type="color" name="backgroundColor" value={formData.backgroundColor || "#0f172a"} onChange={handleFormChange} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                                <input type="text" name="backgroundColor" value={formData.backgroundColor || "#0f172a"} onChange={handleFormChange} className="flex-1 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-mono" />
                             </div>
                             <p className="text-[10px] text-slate-400 mt-1 pl-1">Edit the access color option for specific blocks and background.</p>
                           </div>
                           <div>
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 px-1">Hero Text Color</label>
                             <div className="flex items-center gap-2">
                                <input type="color" name="textColor" value={formData.textColor || "#ffffff"} onChange={handleFormChange} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                                <input type="text" name="textColor" value={formData.textColor || "#ffffff"} onChange={handleFormChange} className="flex-1 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-mono" />
                             </div>
                           </div>
                        </div>
                      </>
                  )}
              </div>

              {/* Category Specific: Collaboration Blocks and Subcategories */}
              {formData._modelType === "category" && (
                  <>
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Handshake size={18} /></div>
                              <h4 className="font-black text-sm text-slate-800 uppercase tracking-tighter">Collaboration Block</h4>
                          </div>
                      </div>
                      <Field label="Collab Heading" name="collabTitle" value={formData.collabTitle || ""} onChange={handleFormChange} />
                      <Field label="Collab Subtitle" name="collabSubtitle" value={formData.collabSubtitle || ""} onChange={handleFormChange} />
                      <Field label="Collab Description" name="collabDescription" value={formData.collabDescription || ""} onChange={handleFormChange} textarea />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="CTA Button Text" name="collabCtaText" value={formData.collabCtaText || ""} onChange={handleFormChange} />
                          <Field label="CTA Button Link" name="collabCtaLink" value={formData.collabCtaLink || ""} onChange={handleFormChange} />
                      </div>
                    </div>

                    {formData.id && (
                      <div className="pt-6 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Package size={18} /></div>
                                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tighter">Sub-Categories</h4>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); openModal("subcategory", { categoryId: formData.id }); }} className="text-[10px] bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">Add New</button>
                        </div>
                        <div className="space-y-2">
                            {subCategories.filter(sc => sc.categoryId === formData.id).map(sc => (
                                <div key={sc.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-sm font-bold text-slate-700">{sc.name}</span>
                                    <button onClick={(e) => { e.preventDefault(); openModal("subcategory", sc); }} className="text-amber-500 hover:text-amber-600 text-xs font-bold uppercase tracking-widest">Edit</button>
                                </div>
                            ))}
                            {subCategories.filter(sc => sc.categoryId === formData.id).length === 0 && <p className="text-[10px] bg-slate-50 p-4 rounded-xl text-center text-slate-400 font-bold uppercase tracking-widest">No subcategories defined.</p>}
                        </div>
                      </div>
                    )}

                    {formData.id && (
                      <div className="pt-6 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Handshake size={18} /></div>
                                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tighter">Active Collaborations</h4>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); openModal("collaboration", { categoryId: formData.id }); }} className="text-[10px] bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">Add New</button>
                        </div>
                        <div className="space-y-2">
                            {collaborations.filter(c => c.categoryId === formData.id).map(c => (
                                <div key={c.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-slate-50 p-1 rounded-md border border-slate-100 flex items-center justify-center overflow-hidden"><img src={c.imageUrl} className="max-w-full max-h-full object-contain" /></div>
                                      <span className="text-sm font-bold text-slate-700">{c.name}</span>
                                    </div>
                                    <button onClick={(e) => { e.preventDefault(); openModal("collaboration", c); }} className="text-amber-500 hover:text-amber-600 text-xs font-bold uppercase tracking-widest">Edit</button>
                                </div>
                            ))}
                            {collaborations.filter(c => c.categoryId === formData.id).length === 0 && <p className="text-[10px] bg-slate-50 p-4 rounded-xl text-center text-slate-400 font-bold uppercase tracking-widest">No category-specific collaborations.</p>}
                        </div>
                      </div>
                    )}
                  </>
              )}

              <button onClick={savePageContent} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-blue-500/10">
                <Save size={16} /> Sync to Live Website
              </button>
           </div>
         </Modal>
       )}

      {modal?.type === "collaboration" && (
        <Modal title={formData.id ? "Edit Collaboration" : "Add Collaboration"} onClose={() => setModal(null)}>
          <div className="space-y-4 pb-4">
            <Field label="Partner Name" name="name" value={formData.name || ""} onChange={handleFormChange} required />
            <ImageUpload label="Partner Logo" value={formData.imageUrl || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl: v }))} />
            <Field label="Partner Website (Optional)" name="href" value={formData.href || ""} onChange={handleFormChange} />
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 px-1">Linked Category (Optional)</label>
              <select 
                name="categoryId" 
                value={formData.categoryId || ""} 
                onChange={handleFormChange} 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-medium"
              >
                <option value="">Global / No Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                <input type="checkbox" name="isGlobal" checked={!!formData.isGlobal} onChange={handleFormChange} className="w-4 h-4 accent-amber-500 rounded" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Global Visibility</span>
                  <span className="text-[10px] text-slate-500 font-medium">Shows on all relevant partner sections</span>
                </div>
            </label>
            <Field label="Display Order" name="order" value={formData.order || 0} onChange={handleFormChange} type="number" />
            
            <button onClick={saveCollaboration} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-slate-900/10">
              <Save size={16} className="text-amber-500" /> {formData.id ? "UPDATE PARTNER" : "ADD PARTNER"}
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "homepage" && (
        <Modal title={formData.id ? "Edit Grid Card" : "Add Grid Card"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Card Title" name="label" value={formData.label || ""} onChange={handleFormChange} required />
            <Field label="Short Description" name="description" value={formData.description || ""} onChange={handleFormChange} textarea />
            <ImageUpload label="Display Image" value={formData.imageUrl || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl: v }))} />
            <Field label="Link (href)" name="href" value={formData.href || ""} onChange={handleFormChange} />
            <Field label="Display Order" name="order" value={formData.order || 0} onChange={handleFormChange} type="number" />
            <button onClick={saveHomepageGridItem} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
              <Save size={16} /> Save Card
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "nav" && (
        <Modal title={formData.id ? "Edit Menu Item" : "Add Menu Item"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Label" name="label" value={formData.label || ""} onChange={handleFormChange} required />
            <Field label="Link (href)" name="href" value={formData.href || ""} onChange={handleFormChange} required />
            <Field label="Order" name="order" value={formData.order || 0} onChange={handleFormChange} type="number" />
            <button onClick={saveNav} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
              <Save size={16} /> Save
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "category" && (
        <Modal title={formData.id ? "Edit Navbar Category" : "Add Navbar Category"} onClose={() => setModal(null)}>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basic Info</span>
                <Field label="Category Name" name="label" value={formData.label || ""} onChange={handleFormChange} required />
                <Field label="Description" name="description" value={formData.description || ""} onChange={handleFormChange} textarea />
                <ImageUpload label="Header Background Image" value={formData.imageUrl || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl: v }))} />
                <Field label="Routing Page URL" name="href" value={formData.href || ""} onChange={handleFormChange} />
                <ImageUpload label="Page Custom Logo (Leave blank for global)" value={formData.logoUrl || ""} onChange={(v) => setFormData(p => ({ ...p, logoUrl: v }))} />
                <Field label="Display Order" name="order" value={formData.order || 0} onChange={handleFormChange} type="number" />
            </div>

            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 space-y-4 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <Star size={10} /> Collaboration Block Settings
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <Field label="Block Label (e.g. Partner With Us)" name="collabTitle" value={formData.collabTitle || ""} onChange={handleFormChange} />
                   <Field label="CTA Button Text" name="collabCtaText" value={formData.collabCtaText || ""} onChange={handleFormChange} />
                </div>
                <Field label="Main Header" name="collabSubtitle" value={formData.collabSubtitle || ""} onChange={handleFormChange} />
                <Field label="Short Description" name="collabDescription" value={formData.collabDescription || ""} onChange={handleFormChange} textarea />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1.5">Block Background</label>
                    <div className="flex items-center gap-2">
                       <input type="color" value={formData.collabBackgroundColor || "#0f172a"} onChange={e => setFormData(p => ({ ...p, collabBackgroundColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-amber-200 cursor-pointer" />
                       <input type="text" value={formData.collabBackgroundColor || "#0f172a"} onChange={handleFormChange} name="collabBackgroundColor" className="flex-1 border border-amber-200 rounded-xl px-3 py-2 text-sm font-mono bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1.5">Block Text Color</label>
                    <div className="flex items-center gap-2">
                       <input type="color" value={formData.collabTextColor || "#ffffff"} onChange={e => setFormData(p => ({ ...p, collabTextColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-amber-200 cursor-pointer" />
                       <input type="text" value={formData.collabTextColor || "#ffffff"} onChange={handleFormChange} name="collabTextColor" className="flex-1 border border-amber-200 rounded-xl px-3 py-2 text-sm font-mono bg-white" />
                    </div>
                  </div>
                </div>
                <Field label="CTA Link (href)" name="collabCtaLink" value={formData.collabCtaLink || ""} onChange={handleFormChange} />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Icons</span>
                <Field label="Navbar Icon SVG" name="iconSvg" value={formData.iconSvg || ""} onChange={handleFormChange} textarea />
                <ImageUpload label="Navbar Icon Image (Fallback)" value={formData.navbarIconUrl || ""} onChange={(v) => setFormData(p => ({ ...p, navbarIconUrl: v }))} />
            </div>

            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <Star size={10} /> 3-Image Hero Layout Assets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ImageUpload label="Grid Image 2" value={formData.imageUrl2 || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl2: v }))} />
                    <Field label="Label 2" name="imageLabel2" value={formData.imageLabel2 || ""} onChange={handleFormChange} placeholder="e.g. Experience" />
                  </div>
                  <div className="space-y-2">
                    <ImageUpload label="Grid Image 3" value={formData.imageUrl3 || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl3: v }))} />
                    <Field label="Label 3" name="imageLabel3" value={formData.imageLabel3 || ""} onChange={handleFormChange} placeholder="e.g. Technical" />
                  </div>
                </div>
            </div>
            
            <button onClick={saveCategory} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-amber-500/10">
              <Save size={18} /> SAVE CATEGORY SETTINGS
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "ticker" && (
        <Modal title={formData.id ? "Edit Announcement" : "Add Announcement"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Announcement Text" name="text" value={formData.text || ""} onChange={handleFormChange} required />
            <Field label="Display Order" name="order" value={formData.order || 0} onChange={handleFormChange} type="number" />
            <button onClick={saveTicker} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
              <Save size={16} /> Save Announcement
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "product" && (
        <Modal title={formData.id ? "Edit Product Profile" : "Create New Product"} onClose={() => setModal(null)}>
          <div className="space-y-8 pb-10">
            {/* SECTION: PRIMARY DETAILS */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <LayoutDashboard size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Primary Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Product Name" name="name" value={formData.name || ""} onChange={handleProductNameChange} required />
                <div className="space-y-1.5">
                  <Field label="URL Slug (unique)" name="slug" value={formData.slug || ""} onChange={handleFormChange} required error={!!formData.slug && !formData.id && products.some(p => p.slug === formData.slug)} />
                  {!!formData.slug && !formData.id && products.some(p => p.slug === formData.slug) && (
                    <p className="text-[11px] font-bold text-red-500 px-1">A product with this URL slug already exists - saving will fail. Change it.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 px-1">Category</label>
                  <select 
                    name="category" 
                    value={formData.category || ""} 
                    onChange={handleFormChange} 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-medium"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 px-1">Sub-Category</label>
                  <div className="flex gap-2">
                    <select 
                      name="subCategoryId" 
                      value={formData.subCategoryId || ""} 
                      onChange={handleFormChange} 
                      className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-medium"
                    >
                      <option value="">No Sub Category</option>
                      {subCategories
                        .filter(sc => !formData.category || sc.category?.label === formData.category)
                        .map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)
                      }
                    </select>
                    <button 
                      type="button"
                      onClick={() => openModal("subcategory", { categoryId: categories.find(c => c.label === formData.category)?.id })}
                      className="bg-slate-100 hover:bg-slate-200 p-3 rounded-2xl text-slate-600 transition-colors"
                      title="Add New Sub-category"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
              <Field label="Short Marketing Description" name="description" value={formData.description || ""} onChange={handleFormChange} required textarea />
            </div>

            {/* SECTION: MEDIA & ACTIONS */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <ImageIcon size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Media & Visuals</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUpload label="Main Covering Thumbnail" value={formData.imageUrl || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl: v }))} />
                <Field label="CSS Height Class (Default: h-[400px])" name="heightClass" value={formData.heightClass || "h-[400px]"} onChange={handleFormChange} />
              </div>
              <ImageUpload 
                label="Product Experience Gallery" 
                multiple 
                value={formData.imagesJson ? JSON.parse(formData.imagesJson) : []} 
                onChange={(v) => setFormData(p => ({ ...p, imagesJson: JSON.stringify(v) }))} 
              />
            </div>

            {/* SECTION: DATA STRUCTURES */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Settings size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Technical Data (JSON)</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 px-1">Specifications (Label/Value Pairs)</label>
                <textarea 
                  name="specs" 
                  value={formData.specs || "[]"} 
                  onChange={handleFormChange} 
                  className={`w-full bg-white border rounded-2xl px-4 py-3 text-xs font-mono h-32 focus:outline-none focus:ring-4 transition-all ${formErrors.specs ? "border-red-500 focus:ring-red-500/20 focus:border-red-500 text-red-900 bg-red-50/30" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-400"}`}
                  placeholder='[{"label": "Thickness", "value": "15mm"}, {"label": "Color", "value": "Green"}]'
                />
                <p className="text-[9px] text-slate-400 font-bold mt-1 px-1 uppercase tracking-tighter">* Must use double quotes for both keys and values.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 px-1">"Why Invest" Points (Icon, Title, Desc)</label>
                <textarea 
                  name="whyInvestJson" 
                  value={formData.whyInvestJson || "[]"} 
                  onChange={handleFormChange} 
                  className={`w-full bg-white border rounded-2xl px-4 py-3 text-xs font-mono h-32 focus:outline-none focus:ring-4 transition-all ${formErrors.whyInvestJson ? "border-red-500 focus:ring-red-500/20 focus:border-red-500 text-red-900 bg-red-50/30" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-400"}`}
                  placeholder='[{"icon": "TrendingUp", "title": "High Durability", "desc": "Suitable for heavy traffic"}, {"icon": "Shield", "title": "Safety First", "desc": "Anti-slip surface"}]'
                />
                <p className="text-[9px] text-slate-400 font-bold mt-1 px-1 uppercase tracking-tighter">* Formatting example: {"[{\"icon\": \"Star\", \"title\": \"Premium\", \"desc\": \"Value\"}]"}</p>
              </div>
            </div>

            {/* SECTION: PREMIUM SERVICES */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Star size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Product Detail Page: Rich Content</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Services Title" name="servicesTitle" value={formData.servicesTitle || "Premium Services"} onChange={handleFormChange} />
                <Field label="Premium Benefits (JSON Array: String[])" name="premiumBenefitsJson" value={formData.premiumBenefitsJson || "[]"} onChange={handleFormChange} textarea error={!!formErrors.premiumBenefitsJson} placeholder='["Water Resistant", "UV Protection", "High Grip"]' />
              </div>
              <Field label="Services Subtitle" name="servicesSubtitle" value={formData.servicesSubtitle || ""} onChange={handleFormChange} textarea />
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 px-1">Service Items (JSON: Icon, Title, Desc)</label>
                <textarea 
                  name="servicesJson" 
                  value={formData.servicesJson || "[]"} 
                  onChange={handleFormChange} 
                  className={`w-full bg-white border rounded-2xl px-4 py-3 text-xs font-mono h-32 focus:outline-none focus:ring-4 transition-all ${formErrors.servicesJson ? "border-red-500 focus:ring-red-500/20 focus:border-red-500 text-red-900 bg-red-50/30" : "border-slate-200 focus:ring-amber-500/10 focus:border-amber-400"}`}
                  placeholder='[{"icon": "PenTool", "title": "Consultation", "desc": "Free expert analysis"}, {"icon": "Truck", "title": "Global Shipping", "desc": "Express delivery worldwide"}]'
                />
                <p className="text-[9px] text-slate-400 font-bold mt-1 px-1 uppercase tracking-tighter">* Must use double quotes for both keys and values.</p>
              </div>
            </div>

            {/* SECTION: INNER PAGE ACTIONS & LABELS */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Palette size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inner Page Customization</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Main CTA Text (e.g. Get a Quote)" name="ctaText" value={formData.ctaText || "Get a Quote"} onChange={handleFormChange} />
                <Field label="Main CTA Link" name="ctaLink" value={formData.ctaLink || "/quote"} onChange={handleFormChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Warranty Text Override" name="warrantyText" value={formData.warrantyText || "10+ Year Warranty"} onChange={handleFormChange} />
                <Field label="Standards Text Override" name="standardsText" value={formData.standardsText || "FIFA/FIBA Standards"} onChange={handleFormChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Specs Section Title" name="specsTitle" value={formData.specsTitle || "DIMENSIONS & SPECS"} onChange={handleFormChange} />
                <Field label="Why Invest Section Title" name="whyInvestTitle" value={formData.whyInvestTitle || "WHY INVEST IN"} onChange={handleFormChange} />
              </div>
            </div>

            {/* FLAGS */}
            <div className="flex gap-4 p-5 bg-amber-50 rounded-3xl border border-amber-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isNew" checked={!!formData.isNew} onChange={handleFormChange} className="w-5 h-5 accent-amber-500 rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">New Arrival</span>
                  <span className="text-[10px] text-slate-500 uppercase font-black">Flash Badge</span>
                </div>
              </label>
              <div className="w-[1px] bg-amber-200 my-1"></div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isFeatured" checked={!!formData.isFeatured} onChange={handleFormChange} className="w-5 h-5 accent-amber-500 rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Featured</span>
                  <span className="text-[10px] text-slate-500 uppercase font-black">Priority Placement</span>
                </div>
              </label>
            </div>

            <button 
              onClick={saveProduct} 
              className="group w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 active:scale-95 border-t border-slate-700/50"
            >
              <Save size={20} className="text-amber-500 group-hover:scale-125 transition-transform" /> {formData.id ? "UPDATE PRODUCT" : "PUBLISH PRODUCT"}
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "subcategory" && (
        <Modal title={formData.id ? "Edit SubCategory" : "Add SubCategory"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Sub Category Name" name="name" value={formData.name || ""} onChange={handleFormChange} required />
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Parent Category</label>
              <select name="categoryId" value={formData.categoryId || ""} onChange={handleFormChange} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">Select Parent Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <Field label="Display Order" name="order" value={formData.order || 0} onChange={handleFormChange} type="number" />
            <button onClick={saveSubCategory} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              <Save size={16} /> Save SubCategory
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "project" && (
        <Modal title={formData.id ? "Edit Project" : "Add Project"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Project Name" name="name" value={formData.name || ""} onChange={handleFormChange} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="City" name="city" value={formData.city || ""} onChange={handleFormChange} required />
              <Field label="State" name="state" value={formData.state || ""} onChange={handleFormChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Surface Type" name="surface" value={formData.surface || ""} onChange={handleFormChange} required />
              <Field label="Area (sqm)" name="area" value={formData.area || ""} onChange={handleFormChange} required />
            </div>
            <Field label="Year" name="year" value={formData.year || ""} onChange={handleFormChange} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Duration" name="duration" value={formData.duration || ""} onChange={handleFormChange} placeholder="45 Days to Handover" />
              <Field label="Standard" name="standard" value={formData.standard || ""} onChange={handleFormChange} placeholder="International Pro Grade" />
            </div>
            <ImageUpload label="Project Showcase Image" value={formData.imageUrl || ""} onChange={(v) => setFormData(p => ({ ...p, imageUrl: v }))} />
            <button onClick={saveProject} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
              <Save size={16} /> Save Project
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "testimonial" && (
        <Modal title={formData.id ? "Edit Testimonial" : "Add Testimonial"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Name" name="name" value={formData.name || ""} onChange={handleFormChange} required />
            <Field label="Institution" name="institution" value={formData.institution || ""} onChange={handleFormChange} required />
            <Field label="Quote" name="quote" value={formData.quote || ""} onChange={handleFormChange} required textarea />
            <Field label="Avatar Initials" name="avatar" value={formData.avatar || ""} onChange={handleFormChange} />
            <button onClick={saveTestimonial} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
              <Save size={16} /> Save
            </button>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Are you sure?</h3>
              <p className="text-slate-500 text-sm">{confirmModal.title}</p>
            </div>
            <div className="flex border-t border-slate-100">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition border-r border-slate-100">Cancel</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
        </main>
      </div>
    </div>
  );
}
