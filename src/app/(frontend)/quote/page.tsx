"use client";

import { useState, useEffect } from "react";
import { Calculator, MapPin, Ruler, FileText, Send, CheckCircle2, Mail, Phone, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/ui/PageHeader";

export default function QuotePage() {
  const { data: session } = useSession();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    surface: "Synthetic Football Turf",
    surfaceOther: "",
    area: "",
    urgency: "Planning Phase (3+ Months)",
    message: ""
  });

  // Pre-fill from the logged-in account so submitted quotes always link back to the profile
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || session.user?.name || "",
        email: session.user?.email || prev.email,
      }));
    }
  }, [session]);

  const PROJECT_CATEGORIES = [
    "Synthetic Football Turf",
    "Athletic Running Track",
    "Multi-Sport Indoor Court",
    "Tennis/Basketball Acrylic",
    "Box Cricket / Multi-Utility",
    "Swimming Pool / Aquatic Facility",
    "Badminton / Table Tennis Court",
    "Budget / School Playground Surface",
    "Sports Academy Infrastructure",
    "Kids' Play Zone / Soft Play Area",
    "Adventure / Obstacle Course",
    "Climbing Wall / Challenge Course",
    "Talent Scout / Training Facility",
    "Other",
  ];

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fullMessage = `
PROPOSAL REQUEST:
Area Size: ${formData.area} Sq. Ft.
Urgency: ${formData.urgency}
Location: ${formData.city}
Additional Details: ${formData.message}
      `.trim();

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          surface: formData.surface === "Other" ? (formData.surfaceOther || "Other") : formData.surface,
          message: fullMessage
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const text = await res.text();
        setError(text || "Failed to submit quote request.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-12 bg-ag-bg min-h-screen pb-32">
      <div className="container-retail">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <PageHeader
              page="quote"
              defaultTag="Precision Estimates"
              defaultTitle={<>Get a <span className="text-ag-primary">Quote</span></>}
              defaultSubtitle="Receive a detailed technical and commercial proposal for your sports facility."
            />
            <div className="flex items-center gap-3 px-4 py-2 bg-ag-bg-alt border border-ag-border rounded-lg">
               <Calculator size={18} className="text-ag-primary" />
               <span className="text-[10px] font-bold text-ag-text uppercase tracking-widest">Instant Assessment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form 
                    key="quote-form"
                    onSubmit={handleSubmit}
                    className="retail-card p-8 md:p-10 space-y-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-4 mb-6 text-sm text-center font-bold font-body">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Project Category</label>
                         <select
                           name="surface"
                           value={formData.surface}
                           onChange={handleChange}
                           className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all appearance-none"
                         >
                           {PROJECT_CATEGORIES.map((cat) => (
                             <option key={cat}>{cat}</option>
                           ))}
                         </select>
                         {formData.surface === "Other" && (
                           <input
                             required
                             name="surfaceOther"
                             type="text"
                             value={formData.surfaceOther}
                             onChange={handleChange}
                             placeholder="Please specify your project category"
                             className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all mt-2"
                           />
                         )}
                      </div>

                      <div className="space-y-2">
                        <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Proposed Area (Sq. Ft.)</label>
                        <div className="relative">
                          <input 
                            required
                            name="area"
                            type="number" 
                            value={formData.area}
                            onChange={handleChange}
                            placeholder="e.g. 5000"
                            className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                             <Ruler size={16} className="text-ag-text-muted" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Project Location</label>
                        <div className="relative">
                          <input 
                            required
                            name="city"
                            type="text" 
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City, State"
                            className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                             <MapPin size={16} className="text-ag-text-muted" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Urgency Level</label>
                        <select 
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleChange}
                          className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all appearance-none"
                        >
                          <option>Planning Phase (3+ Months)</option>
                          <option>Immediate (Within 1 Month)</option>
                          <option>Tender Process</option>
                          <option>Repair/Maintenance only</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Full Name</label>
                          <input 
                            required
                            name="name"
                            type="text" 
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Rahul Sharma" 
                            className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Phone</label>
                          <input 
                            required
                            name="phone"
                            type="tel" 
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91" 
                            className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Work Email</label>
                          <input
                            required
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={!!session?.user?.email}
                            placeholder="rahul@biz.com"
                            className={`w-full border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 ${session?.user?.email ? "bg-ag-bg-alt/60 cursor-not-allowed" : "bg-ag-bg-alt"}`}
                          />
                          {session?.user?.email && (
                            <p className="text-[10px] text-ag-text-muted font-medium ml-1">Locked to your account email so this quote appears in your profile.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Additional Project Details</label>
                      <textarea 
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about sub-base conditions, site access, or specific brand requirements..."
                        className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all resize-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn btn-primary w-full py-6 text-sm uppercase tracking-widest shadow-xl shadow-ag-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? <Calculator className="animate-spin" size={18} /> : <Send size={18} />}
                      {loading ? "Generating Assessment..." : "Generate Official Quote"}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    className="retail-card p-12 text-center space-y-6"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <CheckCircle2 size={64} className="text-ag-primary mx-auto" />
                    <h2 className="font-heading font-black text-ag-text text-3xl uppercase tracking-tighter">Proposal Request Logged</h2>
                    <p className="font-body text-ag-text-muted text-base max-w-sm mx-auto">
                      Our engineering division is reviewing your data. A preliminary technical document will be sent to your email within 4 working hours.
                    </p>
                    <button onClick={() => setIsSubmitted(false)} className="btn btn-outline px-10 py-3 text-xs uppercase tracking-widest">
                       Submit Different Scope
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1 space-y-8">
               <div className="retail-card p-8 border-ag-primary/20 bg-ag-bg-alt">
                  <h3 className="font-body font-black text-ag-text text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
                     <FileText size={20} className="text-ag-primary" />
                     Inclusions
                  </h3>
                  <ul className="space-y-4">
                     {[
                       "Itemized Material Costs",
                       "Technical Cross-Sections",
                       "Logistics & Civil Estimates",
                       "Warranty Documentation",
                       "Project Timeline Map"
                     ].map((item, i) => (
                       <li key={i} className="flex gap-3 items-start">
                          <CheckCircle2 size={14} className="text-ag-primary mt-0.5" />
                          <span className="text-[11px] font-bold text-ag-text-muted uppercase tracking-wider">{item}</span>
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="retail-card p-8 bg-ag-primary text-white space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                     <Calculator size={24} />
                  </div>
                  <h4 className="font-heading font-bold text-xl uppercase leading-none">Why detailed metrics matter?</h4>
                  <p className="font-body text-white/80 text-xs leading-relaxed">
                     Providing accurate area dimensions allows our experts to specify the correct sub-base requirements, often saving up to 15% on civil construction costs.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
