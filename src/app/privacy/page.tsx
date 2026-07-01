"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24 text-left">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
          
          <div className="space-y-2 border-b border-forest/10 pb-6">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">LEGAL PROTOCOLS</span>
            <h1 className="text-4xl font-serif text-forest font-light">Privacy Policy</h1>
            <p className="text-[10px] text-dark/50">Last updated: June 30, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-dark/85 font-light leading-relaxed">
            <p>
              At **ROOT & HARVEST** (represented by Root & Harvest Co.), we respect the absolute privacy of our consumers. We collect only the data required to securely process and deliver our premium farm food harvests to your family.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">1. Information Collection</h3>
            <p>
              We collect identity markers (Name, Phone Number, Shipping Address, Billing Address, and Email) directly from you during cart checkout. This data is handled strictly within secure SSL/TLS channels.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">2. Payment Security</h3>
            <p>
              ROOT & HARVEST does not store your credit card numbers, CVVs, net banking credentials, or UPI PINs. All financial interactions are routed securely through our integrated payments partner, **Razorpay Software Private Limited**. Your transaction is protected under PCIDSS compliance.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">3. Usage of Data</h3>
            <p>
              Your contact details are used solely to send batch traceability reports, order status updates, delivery coordinates, and customer support communications. We do not sell or lease consumer data databases to third-party marketing companies.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">4. Cookies & Trackers</h3>
            <p>
              We use lightweight technical cookies to maintain session states (like items in your Shopping Bag and items on your Wishlist) in your browser. Disabling cookies will impact e-commerce operations.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">5. Contact Support</h3>
            <p>
              For legal queries or to request deletion of your account address registry, contact our compliance officer at{" "}
              <a href="mailto:hello@rootandharvest.in" className="font-semibold text-forest hover:text-gold transition-colors">
                hello@rootandharvest.in
              </a>
              .
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
