"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/components/layout/AuthProvider";

export default function LoginPage() {
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setStep("otp");
      setTimer(30);
      setOtp(["", "", "", "", "", ""]);
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

    const success = await login(phone, code);
    if (success) {
      const callback = searchParams.get("callbackUrl") || "/cart";
      router.push(callback);
    } else {
      setError("Invalid or expired OTP");
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-bg text-dark font-sans font-light min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-32 px-6">
        <div className="w-full max-w-md space-y-12">
          
          <div className="text-center space-y-6">
            <span className="text-xs uppercase tracking-[0.4em] text-gold font-semibold">Account</span>
            <h1 className="text-4xl font-serif text-forest tracking-tight">
              {step === "phone" ? "Welcome Back" : "Verify Number"}
            </h1>
          </div>

          <div className="bg-white p-8 md:p-12 shadow-sm border border-forest/5 relative">
            
            {error && (
              <div className="mb-8 text-xs text-red-600 bg-red-50 p-4 border border-red-100 text-center">
                {error}
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-dark/50 font-semibold">Mobile Number</label>
                  <input 
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit number"
                    className="w-full p-4 text-sm border border-forest/20 focus:border-forest outline-none bg-brand-bg/50 transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {loading ? "Sending OTP..." : "Continue"}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-8 text-center">
                <p className="text-sm text-dark/70">
                  Enter the 6-digit code sent to <br/>
                  <span className="font-semibold text-forest">{phone}</span>
                </p>

                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-mono border border-forest/20 focus:border-forest outline-none bg-brand-bg/50"
                    />
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || otp.join("").length < 6}
                  className="w-full px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>

                <div className="pt-4">
                  {timer > 0 ? (
                    <p className="text-[10px] uppercase tracking-widest text-dark/50">
                      Resend code in <span className="font-semibold text-forest">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[10px] uppercase tracking-widest font-semibold text-forest hover:text-gold transition-colors"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {step === "otp" && (
            <div className="text-center">
              <button 
                onClick={() => setStep("phone")}
                className="text-[10px] uppercase tracking-widest text-dark/50 hover:text-gold transition-colors font-semibold"
              >
                Change mobile number
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
