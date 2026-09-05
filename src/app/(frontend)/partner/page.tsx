"use client";

import { useState } from "react";
import { Handshake, Send, CheckCircle2, Globe, TrendingUp, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";

const PARTNERSHIP_TYPES = [
  "Distributor / Reseller",
  "Installation Contractor",
  "Material Supplier",
  "Technology / Equipment Partner",
  "Franchise / Dealer",
  "Other",
];

export default function PartnerPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    partnershipType: PARTNERSHIP_TYPES[0],
    message: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fullMessage = `
PARTNERSHIP APPLICATION
Company/Organization: ${formData.companyName}
Partnership Type: ${formData.partnershipType}
Location: ${formData.city}
Additional Details: ${formData.message || "N/A"}
      `.trim();

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          surface: formData.partnershipType,
          message: fullMessage,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const text = await res.text();
        setError(text || "Failed to submit application.");
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
              page="partner"
              defaultTag="Grow With Us"
              defaultTitle={<>Become a <span className="text-ag-primary">Partner</span></>}
              defaultSubtitle="Join the SportSurf network of distributors, contractors, and technology partners across India."
            />
            <div className="flex items-center gap-3 px-4 py-2 bg-ag-bg-alt border border-ag-border rounded-lg">
              <Handshake size={18} className="text-ag-primary" />
              <span className="text-[10px] font-bold text-ag-text uppercase tracking-widest">Elite Network</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="partner-form"
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
                        <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Company / Organization Name</label>
                        <input
                          required
                          name="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Acme Sports Infra Pvt. Ltd."
                          className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Partnership Type</label>
                        <select
                          name="partnershipType"
                          value={formData.partnershipType}
                          onChange={handleChange}
                          className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all appearance-none"
                        >
                          {PARTNERSHIP_TYPES.map((type) => (
                            <option key={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Contact Person Name</label>
                        <input
                          required
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Rahul Sharma"
                          className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">City / Region</label>
                        <input
                          required
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City, State"
                          className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                          placeholder="rahul@biz.com"
                          className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Tell us about your business</label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your experience, current business, coverage area, and why you'd like to partner with us..."
                        className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-full py-6 text-sm uppercase tracking-widest shadow-xl shadow-ag-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? <Handshake className="animate-spin" size={18} /> : <Send size={18} />}
                      {loading ? "Submitting Application..." : "Submit Application"}
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
                    <h2 className="font-heading font-black text-ag-text text-3xl uppercase tracking-tighter">Application Received</h2>
                    <p className="font-body text-ag-text-muted text-base max-w-sm mx-auto">
                      Thank you for your interest in partnering with SportSurf. Our partnerships team will review your application and reach out within 3-5 working days.
                    </p>
                    <button onClick={() => setIsSubmitted(false)} className="btn btn-outline px-10 py-3 text-xs uppercase tracking-widest">
                      Submit Another Application
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <div className="retail-card p-8 border-ag-primary/20 bg-ag-bg-alt">
                <h3 className="font-body font-black text-ag-text text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Handshake size={20} className="text-ag-primary" />
                  Why Partner With Us
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: Globe, text: "Access to a pan-India project pipeline" },
                    { icon: TrendingUp, text: "Volume-based pricing & margins" },
                    { icon: ShieldCheck, text: "Certified training & technical support" },
                    { icon: CheckCircle2, text: "Co-branded marketing opportunities" },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <item.icon size={14} className="text-ag-primary mt-0.5 shrink-0" />
                      <span className="text-[11px] font-bold text-ag-text-muted uppercase tracking-wider">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
