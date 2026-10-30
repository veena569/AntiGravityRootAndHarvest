"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Mail, RefreshCw, UserPlus, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/layout/AuthProvider";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { loginWithPassword, registerWithPassword } = useAuth();

  const [tab, setTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail || !loginEmail.includes("@")) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (!loginPassword) {
      setLoginError("Please enter your password.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await loginWithPassword(loginEmail, loginPassword);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setLoginError(res.error || "Incorrect email or password");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim()) {
      setRegError("Please enter your full name.");
      return;
    }
    if (!regEmail || !regEmail.includes("@")) {
      setRegError("Please enter a valid email address.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Password must be at least 8 characters long.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    setRegLoading(true);
    try {
      const res = await registerWithPassword({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone || undefined,
      });

      if (res.success) {
        router.push(redirectUrl);
      } else {
        setRegError(res.error || "Failed to create account.");
      }
    } catch {
      setRegError("Network error. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center space-y-2 mb-6">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl sm:text-3xl text-forest tracking-wider uppercase font-semibold">
              Root &amp; Harvest
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-dark/70">
            Pure, Wood-Pressed Oils &amp; Harvest-Fresh Staples
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 shadow-md rounded-xl border border-forest/10 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-forest/10">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setLoginError("");
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                tab === "login"
                  ? "border-forest text-forest"
                  : "border-transparent text-dark/50 hover:text-dark/80"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setRegError("");
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
                tab === "register"
                  ? "border-forest text-forest"
                  : "border-transparent text-dark/50 hover:text-dark/80"
              }`}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded">
                    {loginError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-dark/70 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-forest/20 rounded-lg focus:border-forest focus:ring-2 focus:ring-forest/10 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-dark/70 block">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-gold hover:text-forest underline underline-offset-2"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-forest/20 rounded-lg focus:border-forest focus:ring-2 focus:ring-forest/10 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-forest hover:bg-forest-light text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
              >
                {regError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded">
                    {regError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-dark/70 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-forest/20 rounded-lg focus:border-forest focus:ring-2 focus:ring-forest/10 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-dark/70 block">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-forest/20 rounded-lg focus:border-forest focus:ring-2 focus:ring-forest/10 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-dark/70 block">
                    Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-forest/20 rounded-lg focus:border-forest focus:ring-2 focus:ring-forest/10 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-dark/70 block">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min 8 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-forest/20 rounded-lg focus:border-forest focus:ring-2 focus:ring-forest/10 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-dark/70 block">
                      Confirm *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-forest/20 rounded-lg focus:border-forest focus:ring-2 focus:ring-forest/10 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-forest hover:bg-forest-light text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {regLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="text-center pt-2 border-t border-forest/10">
            <Link
              href="/cart"
              className="text-xs text-forest/70 hover:text-forest transition-colors inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
