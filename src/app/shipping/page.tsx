"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ShippingPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24 text-left">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
          
          <div className="space-y-2 border-b border-forest/10 pb-6">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">FULFILLMENT RULES</span>
            <h1 className="text-4xl font-serif text-forest font-light">Shipping & Delivery Policy</h1>
            <p className="text-[10px] text-dark/50">Last updated: June 30, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-dark/85 font-light leading-relaxed">
            <p>
              We prioritize prompt and safe transit of our fresh oil batches. Every package is packed in secure, insulated containers to ensure zero leaks and preservation of nutritional compounds.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">1. Shipping Charges</h3>
            <p>
              ROOT & HARVEST offers **Free Delivery** on all orders shipped across India. We believe transparency should extend to fulfillment; the price listed on the page is the final price you pay.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">2. Processing Time</h3>
            <p>
              Oils are wood pressed in controlled micro-batches. Once an order is placed, packaging and labeling are processed within 24 hours at our farm hub. Dispatches occur Monday through Saturday.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">3. Estimated Delivery Window</h3>
            <p>
              Our express shipping partners deliver to metropolitan areas (Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Pune, Ahmedabad) within **3 to 4 business days**. Delivery to tier-2 and tier-3 cities may require **5 business days**.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">4. Transit Issues & Leakages</h3>
            <p>
              If your package arrives with signs of physical damage or oil leakage, take photographs and report the issue to us within 24 hours of delivery at{" "}
              <a href="mailto:hello@rootandharvest.in" className="font-semibold text-forest hover:text-gold transition-colors">
                hello@rootandharvest.in
              </a>
              . We will dispatch a replacement batch immediately.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
