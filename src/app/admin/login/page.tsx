"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/components/layout/AuthProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to authenticate");
      
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
    router.push("/admin/dashboard");
    return null;
  }

  return (
    <div className="bg-brand-bg text-dark font-sans font-light min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-32 px-6">
        <div className="w-full max-w-md space-y-12">
          
          <div className="text-center space-y-6">
            <div className="flex justify-center text-forest">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-xs uppercase tracking-[0.4em] text-gold font-semibold">Admin</span>
            <h1 className="text-3xl font-serif text-forest tracking-tight">
              Root & Harvest Console
            </h1>
          </div>

          <div className="bg-white p-8 md:p-12 shadow-sm border border-forest/5 relative">
            <form onSubmit={handleAdminLogin} className="space-y-8">
              
              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-4 border border-red-100 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Administrator Email</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? "Authenticating..." : "Access Console"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>

            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
