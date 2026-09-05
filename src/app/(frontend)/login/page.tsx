"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-12     bg-ag-bg min-h-screen  pb-32"> {/* Reduced pt from 64 to 32 */}
      <div className="container-retail">
        <div className="max-w-md mx-auto">
          <div className="mb-10">
            <PageHeader
              page="login"
              defaultTag="Access Portal"
              defaultTitle={<>Welcome <span className="text-ag-primary">Back</span></>}
              defaultSubtitle="Log in to manage your projects and service requests."
              align="center"
              titleClassName="font-heading font-extrabold text-4xl text-ag-text uppercase tracking-tight mt-2"
              wrapperClassName=""
              subtitleClassName="font-body text-ag-text-muted mt-4 text-sm"
            />
          </div>

          <div className="retail-card p-8 md:p-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-4 mb-6 text-center text-xs font-bold font-body">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
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
                    placeholder="name@business.com"
                    className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-6 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-body font-bold text-ag-text text-[11px] uppercase tracking-widest">Password</label>
                  <Link href="/forgot-password"  className="text-[10px] font-bold text-ag-primary hover:underline">
                    FORGOT PASSWORD?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ag-text-muted">
                    <Lock size={18} />
                  </div>
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-ag-bg-alt border border-ag-border rounded-lg py-4 pl-12 pr-12 text-ag-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-ag-primary/10 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ag-text-muted hover:text-ag-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button disabled={loading} type="submit" className="btn btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-lg shadow-ag-primary/20 flex items-center justify-center gap-2">
                <LogIn size={18} />
                {loading ? "Logging In..." : "Secure Login"}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-ag-border text-center">
              <p className="font-body text-ag-text-muted text-[11px] font-bold uppercase tracking-widest">
                Don't have an account?{" "}
                <Link href="/register" className="text-ag-primary hover:underline ml-1">
                  CREATE AN ACCOUNT
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
