"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24 text-left">
        <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
          
          <div className="space-y-2 border-b border-forest/10 pb-6">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">USER CHARTER</span>
            <h1 className="text-4xl font-serif text-forest font-light">Terms & Conditions</h1>
            <p className="text-[10px] text-dark/50">Last updated: June 30, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-dark/85 font-light leading-relaxed">
            <p>
              Welcome to **ROOT & HARVEST**. By accessing our web pages, purchasing our food products and wood-pressed oils, and using our digital services, you agree to comply with and be bound by the following terms.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">1. Product Information &amp; Disclaimers</h3>
            <p>
              ROOT &amp; HARVEST products are 100% natural, unrefined, and subject to natural organic variations in color, aroma, and sedimentation. The information provided on our website regarding wood pressed oils, traditional grains, health indices, and recipes is for general dietary awareness and should not replace professional medical consultation.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">2. Pricing &amp; Payments</h3>
            <p>
              All prices listed on the site are in Indian Rupees (INR), inclusive of GST, and exclusive of shipping costs (unless eligible for promotional free delivery). We reserve the right to adjust pricing based on raw agricultural crop availability without prior notice.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">3. Intellectual Property</h3>
            <p>
              All typography designs, branding assets, images, and content displayed are properties of Root & Harvest Co. Unauthorized duplication is strictly prohibited.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">4. Governing Law</h3>
            <p>
              These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of your purchase shall be subject to the exclusive jurisdiction of the courts in Hyderabad, India.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
