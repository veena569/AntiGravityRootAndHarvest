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
              Welcome to **ROOT & HARVEST**. By accessing our web pages, purchasing our unrefined groundnut oils, and using our digital services, you agree to comply with and be bound by the following terms.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">1. Product Information & Disclaimers</h3>
            <p>
              ROOT & HARVEST products are 100% natural, unrefined, and subject to organic variations in color, aroma, and natural sedimentation. The information provided on our website regarding wood pressed oils, health indices, and recipes is for dietary awareness and should not replace medical consultation.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">2. Pricing & Payments</h3>
            <p>
              All prices listed on the site are in Indian Rupees (INR), inclusive of GST, and exclusive of shipping costs (which are currently offered free as a promotional premium signal). We reserve the right to alter size pricing structure depending on agricultural market pricing of groundnut peanuts without prior notice.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">3. Intellectual Property</h3>
            <p>
              All typography designs, branding assets, images, and content displayed are properties of Root & Harvest Co. Unauthorized duplication is strictly prohibited.
            </p>

            <h3 className="text-base font-serif font-semibold text-forest uppercase tracking-wider pt-4">4. Governing Law</h3>
            <p>
              These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of your purchase shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
