"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, CheckCircle2, UserPlus, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";

export default function RegisterPage() {
  const router = useRouter();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState("Individual Developer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Info, 2: OTP Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep(2); // Move to OTP entry step
      } else {
        const text = await res.text();
        setError(text || "Failed to send verification code.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Final Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp: otp.trim() }),
      });

      if (res.ok) {
        // Redirect to Login on success
        router.push("/login?registered=true");
      } else {
        const text = await res.text();
        setError(text || "Invalid or expired verification code.");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-12     bg-ag-bg min-h-screen  pb-32"> {/* Reduced pt from 64 to 32 for better alignment */}
      <div className="container-retail">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            {step === 1 ? (
              <PageHeader
                page="registration"
                defaultTag="New Partnerships"
                defaultTitle={<>Create an <span className="text-ag-primary">Account</span></>}
                defaultSubtitle="Join India's most advanced sports infrastructure network."
                align="center"
                titleClassName="font-heading font-extrabold text-4xl text-ag-text uppercase tracking-tight mt-2"
                wrapperClassName=""
                subtitleClassName="font-body text-ag-text-muted mt-4 text-sm"
              />
            ) : (
              <>
                <span className="text-ag-primary font-extrabold text-[11px] uppercase tracking-widest">New Partnerships</span>
                <h1 className="font-heading font-extrabold text-4xl text-ag-text uppercase tracking-tight mt-2">
                  Verify Your <span className="text-ag-primary">Email</span>
                </h1>
                <p className="font-body text-ag-text-muted mt-4 text-sm">
                  {`We've sent a 6-digit verification code to ${email}`}
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-4 mb-6 text-sm text-center font-body">
              {error}
            </div>
          )}

          <div className="retail-card p-8 md:p-12">
            {step === 1 ? (
              <form className="space-y-8" onSubmit={handleSendOtp}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-muted">
                        <User size={18} />
                      </div>
                      <input 
                        required
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Work Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-muted">
                        <Mail size={18} />
                      </div>
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@institution.com"
                        className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-muted">
                        <Phone size={18} />
                      </div>
                      <input 
                        required
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">User Segment</label>
                    <select 
                      value={segment}
                      onChange={(e) => setSegment(e.target.value)}
                      className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 px-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all appearance-none"
                    >
                      <option>Individual Developer</option>
                      <option>Institutional/School</option>
                      <option>Corporate Real Estate</option>
                      <option>Sports Academy Owner</option>
                      <option>Government Body</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-muted">
                        <Lock size={18} />
                      </div>
                      <input 
                        required
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-muted">
                        <Lock size={18} />
                      </div>
                      <input 
                        required
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-ag-bg-alt/50 rounded-lg border border-ag-border">
                   <input type="checkbox" id="terms" className="mt-1 accent-ag-primary" required />
                   <label htmlFor="terms" className="text-[10px] font-bold text-ag-text-muted leading-relaxed uppercase tracking-widest">
                      I agree to the <span className="text-ag-primary cursor-pointer hover:underline">Antigravity Terms of Service</span> and acknowledge the Privacy Policy.
                   </label>
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-lg shadow-ag-primary/20 flex items-center justify-center gap-2">
                  <UserPlus size={18} />
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>
            ) : (
              // Step 2: Enter OTP Code layout
              <form className="space-y-8" onSubmit={handleVerifyAndRegister}>
                <div className="space-y-2">
                  <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest ml-1 text-center block">Enter 6-digit Code</label>
                  <div className="relative max-w-xs mx-auto">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-muted">
                      <ShieldCheck size={18} />
                    </div>
                    <input 
                      required
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-6 text-center text-xl font-bold tracking-[0.2em] text-ag-text focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                    />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-lg shadow-ag-primary/20 flex items-center justify-center gap-2">
                   <CheckCircle2 size={18} />
                   {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <div className="text-center">
                  <button type="button" onClick={() => setStep(1)} className="text-[11px] font-bold text-ag-text-muted hover:text-ag-primary underline tracking-widest">
                    BACK TO INFORMATION
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-8 border-t border-ag-border text-center">
              <p className="font-body text-ag-text-muted text-[11px] font-bold uppercase tracking-widest">
                Already have an account?{" "}
                <Link href="/login" className="text-ag-primary hover:underline ml-1">
                  SIGN IN HERE
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
