"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Truck, CheckCircle2, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

function SecureCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const [countryCode, setCountryCode] = useState("+91");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const fullPhone = `${countryCode} ${phone}`;
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setStep("otp");
      setTimer(30);
      setOtp(["", "", "", "", "", ""]);
      
      // Auto focus first OTP input after a slight delay for DOM update
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);

      // For demo purposes, we alert the OTP
      alert(`[DEMO] Your OTP is: ${data.code}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return;

    setLoading(true);
    setError("");

    const fullPhone = `${countryCode} ${phone}`;
    const success = await login(fullPhone, code);
    if (success) {
      const callback = searchParams.get("callbackUrl") || "/checkout";
      router.push(callback);
    } else {
      setError("Invalid or expired OTP");
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-bg text-dark font-sans font-light min-h-screen flex flex-col selection:bg-gold/20">
      
      {/* Minimal Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-forest/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 text-sm text-forest/70 hover:text-forest transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Cart</span>
          </Link>
          
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-2xl font-serif text-forest tracking-wider">ROOT & HARVEST</h1>
          </Link>

          <div className="flex items-center gap-2 text-forest/50 text-sm">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Secure</span>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN: AUTHENTICATION */}
        <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-24 flex flex-col justify-center relative">
          
          <div className="w-full max-w-md mx-auto space-y-12">
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-16 relative">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-forest/10 -z-10 -translate-y-1/2"></div>
              
              <div className="flex flex-col items-center gap-2 bg-brand-bg px-2">
                <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-forest font-medium">Cart</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 bg-brand-bg px-2">
                <div className="w-6 h-6 rounded-full border border-forest bg-forest flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-forest font-medium">Auth</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 bg-brand-bg px-2">
                <div className="w-6 h-6 rounded-full border border-forest/20 bg-white flex items-center justify-center">
                </div>
                <span className="text-[10px] uppercase tracking-widest text-forest/40 font-medium">Payment</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 bg-brand-bg px-2">
                <div className="w-6 h-6 rounded-full border border-forest/20 bg-white flex items-center justify-center">
                </div>
                <span className="text-[10px] uppercase tracking-widest text-forest/40 font-medium">Confirm</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight">
                Secure Checkout
              </h2>
              <p className="text-sm md:text-base text-dark/70 leading-relaxed max-w-sm">
                Verify your mobile number to securely continue with your order.
              </p>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-forest/5">
              
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-xs text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {step === "phone" ? (
                  <motion.form 
                    key="phone"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSendOtp} 
                    className="space-y-8"
                  >
                    <div className="space-y-3">
                      <label className="text-[11px] uppercase tracking-widest text-dark/60 font-semibold ml-1">Mobile Number</label>
                      <div className="flex gap-3">
                        <select 
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-[100px] p-4 text-sm rounded-xl border border-forest/10 focus:border-forest/30 outline-none bg-brand-bg/50 transition-all cursor-pointer shadow-sm hover:border-forest/20 focus:ring-4 focus:ring-forest/5"
                        >
                          <option value="+91">IN (+91)</option>
                          <option value="+1">US (+1)</option>
                          <option value="+44">UK (+44)</option>
                          <option value="+61">AU (+61)</option>
                        </select>
                        <input 
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit number"
                          className="flex-1 p-4 text-sm rounded-xl border border-forest/10 focus:border-forest/30 outline-none bg-brand-bg/50 transition-all shadow-sm hover:border-forest/20 focus:ring-4 focus:ring-forest/5"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || phone.length < 10}
                      className="w-full px-8 py-5 rounded-xl bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all shadow-lg shadow-forest/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:shadow-none relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {loading ? "Sending Code..." : "Continue"}
                        {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                      </span>
                      {/* Ripple effect placeholder */}
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0 rounded-xl"></div>
                    </button>
                  </motion.form>
                ) : (
                  <motion.form 
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleVerifyOtp} 
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <p className="text-sm text-dark/70 ml-1">
                        Enter the 6-digit code sent to <br/>
                        <span className="font-medium text-forest">{countryCode} {phone}</span>
                        <button 
                          type="button"
                          onClick={() => setStep("phone")}
                          className="ml-3 text-xs text-gold hover:text-forest transition-colors underline underline-offset-4"
                        >
                          Change
                        </button>
                      </p>

                      <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl text-center text-xl font-mono border border-forest/10 focus:border-forest/40 outline-none bg-brand-bg/50 transition-all shadow-sm focus:ring-4 focus:ring-forest/5 focus:bg-white"
                          />
                        ))}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || otp.join("").length < 6}
                      className="w-full px-8 py-5 rounded-xl bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all shadow-lg shadow-forest/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:shadow-none relative overflow-hidden sticky bottom-6 lg:static"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {loading ? "Verifying..." : "Continue to Secure Payment"}
                        {!loading && <Lock className="w-3.5 h-3.5" />}
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0 rounded-xl"></div>
                    </button>

                    <div className="text-center pt-2">
                      {timer > 0 ? (
                        <p className="text-[11px] text-dark/50">
                          Didn't receive the code? Resend OTP in <span className="font-medium text-forest">{timer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[11px] uppercase tracking-widest font-semibold text-forest hover:text-gold transition-colors"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Security Notice */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-forest/5 border border-forest/10">
              <Lock className="w-5 h-5 text-forest shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm text-dark/70">
                <p className="font-medium text-forest">Your information is encrypted and securely protected.</p>
                <p>We never share your mobile number.</p>
              </div>
            </div>

            {/* Trust Badges under Auth */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-4 border-t border-forest/10 text-xs text-dark/60 font-medium">
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-forest/60" /> 256-bit Encryption</div>
              <div className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-forest/60" /> Secure Checkout</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-forest/60" /> Trusted by Families</div>
              <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-forest/60" /> Fast Delivery</div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: TRUST SECTION */}
        <div className="hidden lg:flex w-1/2 bg-forest/5 p-12 xl:p-24 relative overflow-hidden flex-col justify-center">
          {/* Subtle Background Pattern / Illustration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="leaf-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M50 25 C70 5, 95 30, 75 50 C55 70, 30 45, 50 25 Z" fill="currentColor" className="text-forest"/>
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
                "No Artificial Preservatives"
              ].map((benefit, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={benefit} 
                  className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-forest/5 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-dark/80">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-md flex gap-6 items-center relative overflow-hidden group">
              <div className="w-24 h-24 bg-brand-bg rounded-xl relative shrink-0 overflow-hidden border border-forest/10">
                {/* Fallback to CSS block if image is missing */}
                <div className="absolute inset-0 flex items-center justify-center bg-forest/5 text-forest/40">
                  <Image
                    src="/groundnut_oil_bottle_1782932064088.jpg"
                    alt="Premium Product"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-serif text-xl text-forest italic">"Nature’s finest, brought to your family’s table with absolute care."</p>
                <p className="text-xs uppercase tracking-widest text-dark/50 font-semibold">— The Founders</p>
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
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center text-forest text-sm uppercase tracking-widest font-semibold">Loading Secure Checkout...</div>}>
      <SecureCheckoutContent />
    </Suspense>
  );
}
