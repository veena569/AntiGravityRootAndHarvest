"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setError("Missing email verification parameters.");
      setLoading(false);
      return;
    }

    const doVerify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(true);
        } else {
          setError(data.error || "Verification failed");
        }
      } catch {
        setError("Network error verifying email.");
      } finally {
        setLoading(false);
      }
    };

    doVerify();
  }, [token, email]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-forest/10 p-6 sm:p-8 text-center space-y-6">
        <h1 className="text-2xl font-serif text-forest font-bold">Email Verification</h1>

        {loading && (
          <div className="py-8 space-y-3">
            <RefreshCw className="w-8 h-8 text-forest animate-spin mx-auto" />
            <p className="text-sm text-dark/70">Verifying your email address...</p>
          </div>
        )}

        {!loading && success && (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-semibold text-emerald-900">Your email has been verified!</h2>
            <p className="text-xs text-dark/70">
              Thank you for verifying <strong>{email}</strong>. Your account is active.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 bg-forest hover:bg-forest-light text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Go to Account / Login
              </Link>
            </div>
          </div>
        )}

        {!loading && !success && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-semibold text-red-900">Verification Link Invalid</h2>
            <p className="text-xs text-dark/70">
              {error || "This verification link has expired or has already been used."}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 bg-forest hover:bg-forest-light text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
