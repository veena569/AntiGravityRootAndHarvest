"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ReturnsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24 text-left">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
          
          <div className="space-y-2 border-b border-forest/10 pb-6">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">REFUND RULES</span>
            <h1 className="text-4xl font-serif text-forest font-light">Returns & Refunds Policy</h1>
            <p className="text-[10px] text-dark/50">Last updated: June 30, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-dark/85 font-light leading-relaxed">
            <p>
              Because our products are raw, fresh edible oil batches and wildflower harvests containing zero chemical preservatives, they are classified as **non-returnable** food products under standard FSSAI guidelines.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">1. Damages & Defect Cases</h3>
            <p>
              If you receive a defective bottle, transit leakage, or incorrect batch variant, we provide a complete replacement or refund. Report the issue within 24 hours of receipt with a photo attachment to{" "}
              <a href="mailto:hello@rootandharvest.in" className="font-semibold text-forest hover:text-gold transition-colors">
                hello@rootandharvest.in
              </a>
              .
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">2. Processing of Refunds</h3>
            <p>
              Approved refunds are credited back to the original payment source (UPI account, credit/debit card, or bank account used during Razorpay checkout) within **5 to 7 banking business days**, depending on banking gateways.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">3. Cancellation of Orders</h3>
            <p>
              You can cancel your order within 3 hours of placement, before it is processed for packaging and labeled. Cancel requests sent after dispatch are not eligible for refunds.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
