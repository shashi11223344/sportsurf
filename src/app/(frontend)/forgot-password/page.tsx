"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-12 bg-ag-bg min-h-screen pb-32">
      <div className="container-retail">
        <div className="max-w-md mx-auto">
          {!isSubmitted ? (
            <div className="space-y-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-ag-primary/5 border border-ag-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <KeyRound size={28} className="text-ag-primary" />
                </div>
                <PageHeader
                  page="forgot-password"
                  defaultTag=""
                  defaultTitle={<>Reset <span className="text-ag-primary">Password</span></>}
                  defaultSubtitle="Enter your registered email and we'll send you a secure link to reset your password."
                  align="center"
                  titleClassName="font-heading font-extrabold text-3xl text-ag-text uppercase tracking-tight"
                  wrapperClassName=""
                  subtitleClassName="font-body text-ag-text-muted mt-4 text-sm leading-relaxed"
                />
              </div>

              <div className="retail-card p-8 md:p-10">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-lg p-4 mb-6 text-center text-xs font-bold font-body flex items-center justify-center gap-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-muted">
                        <Mail size={18} />
                      </div>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@institution.com"
                        className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-lg shadow-ag-primary/20"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-ag-border text-center">
                  <Link href="/login" className="inline-flex items-center gap-2 font-body text-ag-text-muted text-[11px] font-bold uppercase tracking-widest hover:text-ag-primary transition-colors">
                    <ArrowLeft size={14} />
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-12">
               <div className="w-20 h-20 bg-ag-primary/10 rounded-full flex items-center justify-center text-ag-primary mx-auto">
                  <CheckCircle2 size={40} />
               </div>
               <h2 className="font-heading font-black text-ag-text text-3xl uppercase tracking-tighter">Check Your Email</h2>
               <p className="font-body text-ag-text-muted max-w-xs mx-auto text-sm leading-relaxed">
                  If an account exists for <strong>{email}</strong>, a reset link has been sent. Please check your inbox and spam folder. The link expires in 1 hour.
               </p>
               <div className="pt-6">
                 <Link href="/login" className="btn btn-outline border-ag-primary text-ag-primary px-8 py-3 uppercase tracking-widest text-xs">
                    Return to Login
                 </Link>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
