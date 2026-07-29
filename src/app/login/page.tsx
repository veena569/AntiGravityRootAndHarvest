"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Truck, CheckCircle2, ChevronRight, User, Phone, RefreshCw, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/layout/AuthProvider";

function SecureCheckoutContent() {
  const { login, loginWithEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Authentication Step
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");

  // Inputs state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Firebase auth state objects
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Resend OTP timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Safely initialize Invisible reCAPTCHA on Mount for Firebase Phone Auth
  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaVerifier && loginMethod === "phone") {
      try {
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA verification passed
          },
          "expired-callback": () => {
            setError("reCAPTCHA session expired. Please send OTP again.");
          },
        });
        setRecaptchaVerifier(verifier);
      } catch (err: any) {
        console.error("reCAPTCHA init error:", err);
      }
    }
    // Cleanup on unmount
    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {}
      }
    };
  }, [recaptchaVerifier, loginMethod]);

  // Step 1a: Send Firebase SMS Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      if (!auth || !auth.app) {
        throw new Error("Firebase configuration is missing or incomplete. Please check your .env file.");
      }
      if (!recaptchaVerifier) {
        throw new Error("Security verification (reCAPTCHA) is not ready. Refresh and try again.");
      }

      // Hardcode Indian Phone Number Prefix (+91)
      const formattedPhone = `+91${cleanPhone.slice(-10)}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
      setResendTimer(30);
    } catch (err: any) {
      console.error("[FIREBASE_SEND_OTP_ERROR]", err);
      let userMessage = `Failed to send OTP. Error: ${err.message || err.code || "Unknown error"}`;
      if (err.code === "auth/invalid-phone-number") {
        userMessage = "The phone number entered is invalid. Please make sure it is a valid 10-digit number.";
      } else if (err.code === "auth/too-many-requests") {
        userMessage = "Too many verification requests. Please wait a few minutes and try again.";
      }
      setError(userMessage);

      // Re-initialize recaptcha on failure
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {}
        setRecaptchaVerifier(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1b: Send Email OTP Code
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setResendTimer(30);
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (err: any) {
      setError("An error occurred. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Unified send handler
  const handleSendCode = (e: React.FormEvent) => {
    if (loginMethod === "phone") {
      handleSendOtp(e);
    } else {
      handleSendEmailOtp(e);
    }
  };

  // Step 2a: Confirm Firebase OTP SMS & Create DB session
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanOtp = otpCode.replace(/\D/g, "");
    if (cleanOtp.length < 6) {
      setError("Please enter the 6-digit OTP code");
      return;
    }

    if (!confirmationResult) {
      setError("Session expired. Please request a new OTP.");
      setStep("input");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await confirmationResult.confirm(cleanOtp);
      const idToken = await userCredential.user.getIdToken();
      const formattedPhone = `+91${phone.replace(/\D/g, "").slice(-10)}`;
      const loginSuccess = await login(formattedPhone, idToken, name.trim());

      if (loginSuccess) {
        try {
          localStorage.setItem(
            "rh_guest",
            JSON.stringify({
              name: name.trim(),
              phone: formattedPhone,
            })
          );
        } catch {}

        const callbackUrl = searchParams.get("callbackUrl") || "/account/profile";
        router.push(callbackUrl);
      } else {
        setError("Failed to initialize session database records. Try again.");
      }
    } catch (err: any) {
      console.error("[FIREBASE_VERIFY_OTP_ERROR]", err);
      let userMessage = "Incorrect or expired verification code. Please check and try again.";
      if (err.code === "auth/invalid-verification-code") {
        userMessage = "The OTP code entered is incorrect.";
      } else if (err.code === "auth/code-expired") {
        userMessage = "This OTP has expired. Please click resend to get a new code.";
      }
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2b: Confirm Email OTP & Create DB session
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanOtp = otpCode.replace(/\D/g, "");
    if (cleanOtp.length < 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const loginSuccess = await loginWithEmail(trimmedEmail, cleanOtp, name.trim());

      if (loginSuccess) {
        try {
          localStorage.setItem(
            "rh_guest",
            JSON.stringify({
              name: name.trim(),
              email: trimmedEmail,
            })
          );
        } catch {}

        const callbackUrl = searchParams.get("callbackUrl") || "/account/profile";
        router.push(callbackUrl);
      } else {
        setError("The verification code is incorrect or has expired.");
      }
    } catch (err: any) {
      console.error("[EMAIL_VERIFY_ERROR]", err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Unified verify handler
  const handleVerifyCode = (e: React.FormEvent) => {
    if (loginMethod === "phone") {
      handleVerifyOtp(e);
    } else {
      handleVerifyEmailOtp(e);
    }
  };

  return (
    <div className="bg-brand-bg text-dark font-sans font-light min-h-screen flex flex-col selection:bg-gold/20">
      {/* Invisible reCAPTCHA container required by Firebase Phone Auth */}
      <div id="recaptcha-container" className="invisible absolute"></div>

      {/* Minimal Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-forest/5 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-forest/70 hover:text-forest transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-xl font-serif text-forest tracking-widest uppercase font-semibold">ROOT & HARVEST</h1>
          </Link>

          <div className="flex items-center gap-2 text-forest/50 text-sm">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Secure Session</span>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1280px] mx-auto flex flex-col lg:flex-row">
        {/* LEFT COLUMN: AUTHENTICATION */}
        <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-24 flex flex-col justify-center relative">
          <div className="w-full max-w-md mx-auto space-y-12">
            
            <div className="space-y-4">
              <h2 className="text-5xl font-serif text-forest tracking-tight uppercase font-semibold">
                Sign In
              </h2>
              <p className="text-sm md:text-base text-dark/70 leading-relaxed max-w-sm">
                {step === "input"
                  ? "Verify your identity using your phone number or email address."
                  : `Enter the 6-digit code sent to your ${loginMethod === "phone" ? "mobile phone" : "email address"}.`}
              </p>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-none shadow-sm border border-forest/10">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 text-xs text-red-600 bg-red-50 p-4 rounded-none border border-red-100 text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Login Method Tabs */}
              {step === "input" && (
                <div className="grid grid-cols-2 gap-2 mb-8 border-b border-forest/10 pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("phone");
                      setError("");
                    }}
                    className={`flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
                      loginMethod === "phone"
                        ? "border-forest text-forest"
                        : "border-transparent text-dark/40 hover:text-dark/60"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Phone Number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("email");
                      setError("");
                    }}
                    className={`flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
                      loginMethod === "email"
                        ? "border-forest text-forest"
                        : "border-transparent text-dark/40 hover:text-dark/60"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email Address
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === "input" ? (
                  <motion.form
                    key="input-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSendCode}
                    className="space-y-6"
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-dark/60 font-semibold flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full p-4 text-sm rounded-none border border-forest/10 focus:border-forest/40 outline-none bg-brand-bg/50 transition-all shadow-sm hover:border-forest/20 focus:ring-4 focus:ring-forest/5"
                      />
                    </div>

                    {/* Phone Input */}
                    {loginMethod === "phone" ? (
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-dark/60 font-semibold flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> Mobile Number
                        </label>
                        <div className="flex gap-3">
                          <div className="w-[80px] p-4 text-sm rounded-none border border-forest/10 bg-brand-bg/30 text-dark/50 flex items-center justify-center select-none shadow-sm">
                            +91
                          </div>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="10-digit number"
                            maxLength={10}
                            className="flex-1 p-4 text-sm rounded-none border border-forest/10 focus:border-forest/30 outline-none bg-brand-bg/50 transition-all shadow-sm hover:border-forest/20 focus:ring-4 focus:ring-forest/5"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Email Input */
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-dark/60 font-semibold flex items-center gap-1.5">
                          <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. rahul@example.com"
                          className="w-full p-4 text-sm rounded-none border border-forest/10 focus:border-forest/40 outline-none bg-brand-bg/50 transition-all shadow-sm hover:border-forest/20 focus:ring-4 focus:ring-forest/5"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="w-full h-14 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send Verification Code
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-[11px] text-center text-dark/40 leading-relaxed">
                      By continuing, you agree to our Terms. A secure one-time verification code will be sent.
                    </p>
                  </motion.form>
                ) : (
                  <motion.form
                    key="otp-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleVerifyCode}
                    className="space-y-6"
                  >
                    {/* OTP input field */}
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-dark/60 font-semibold flex items-center justify-between">
                        <span>Enter 6-Digit Code</span>
                        <button
                          type="button"
                          onClick={() => {
                            setStep("input");
                            setOtpCode("");
                          }}
                          className="text-gold hover:underline lowercase tracking-normal"
                        >
                          change details
                        </button>
                      </label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full p-4 text-center text-2xl font-mono tracking-[0.3em] rounded-none border border-forest/10 focus:border-forest/40 outline-none bg-brand-bg/50 transition-all shadow-sm focus:ring-4 focus:ring-forest/5"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || otpCode.length < 6}
                      className="w-full h-14 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verifying Code...
                        </>
                      ) : (
                        <>
                          Verify &amp; Continue
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    {/* Resend Actions */}
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-dark/45">
                          Resend code in <span className="font-semibold text-forest">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleSendCode}
                          className="text-xs font-semibold uppercase tracking-widest text-forest hover:text-gold transition-colors flex items-center gap-1.5 mx-auto animate-pulse"
                        >
                          <RefreshCw className="w-3 h-3" /> Resend Code
                        </button>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Security Notice */}
            <div className="flex gap-4 items-start p-4 rounded-none bg-forest/5 border border-forest/10">
              <Lock className="w-5 h-5 text-forest shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm text-dark/70">
                <p className="font-medium text-forest">Your information is encrypted and securely protected.</p>
                <p>We never share your personal contact details.</p>
              </div>
            </div>

            {/* Trust Badges under Auth */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-4 border-t border-forest/10 text-xs text-dark/60 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest/60" /> 256-bit Encryption
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-forest/60" /> Secure Sessions
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest/60" /> Trusted by Families
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-forest/60" /> Fast Delivery
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TRUST SECTION */}
        <div className="hidden lg:flex w-1/2 bg-forest/5 p-12 xl:p-24 relative overflow-hidden flex-col justify-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="leaf-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M50 25 C70 5, 95 30, 75 50 C55 70, 30 45, 50 25 Z" fill="currentColor" className="text-forest" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 max-w-md mx-auto space-y-12">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.4em] text-gold font-semibold">The Root & Harvest Promise</span>
              <h3 className="text-3xl font-serif text-forest">Why Root & Harvest?</h3>
            </div>

            <div className="space-y-6">
              {[
                "Freshly Wood Pressed",
                "Small Batch Crafted",
                "Secure Payments",
                "Direct From Trusted Farms",
                "No Artificial Preservatives",
              ].map((benefit, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={benefit}
                  className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-none border border-forest/5 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-dark/80">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-none border border-forest/10 shadow-md flex gap-6 items-center relative overflow-hidden group">
              <div className="w-24 h-24 bg-brand-bg rounded-none relative shrink-0 overflow-hidden border border-forest/10">
                <div className="absolute inset-0 flex items-center justify-center bg-forest/5 text-forest/40">
                  <Image
                    src="/groundnut-oil-bottle.png"
                    alt="Premium Product"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-serif text-xl text-forest italic">"Nature’s finest, brought to your family’s table with absolute care."</p>
                <p className="text-xs uppercase tracking-widest text-dark/50 font-semibold">— Veena &amp; Srinivas</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg flex items-center justify-center text-forest text-sm uppercase tracking-widest font-semibold animate-pulse">
          Loading Secure Checkout...
        </div>
      }
    >
      <SecureCheckoutContent />
    </Suspense>
  );
}
