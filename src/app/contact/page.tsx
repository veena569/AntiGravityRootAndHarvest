"use client";

import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 4000);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">
              GET IN TOUCH
            </span>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-forest font-light">
              Connect With Our <span className="italic font-normal text-gold">Farms</span>
            </h1>
            <p className="text-sm md:text-base text-dark/75 font-light">
              Have questions about wood pressing methods, batch numbers, or bulk logistics? Write to us directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            
            {/* Info Cards (Left - 5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white border border-forest/5 p-8 space-y-6 shadow-sm">
                <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">Our Coordinates</h3>
                
                <div className="space-y-6">
                  
                  {/* Email */}
                  <div className="flex items-start gap-4 text-xs font-light text-dark">
                    <div className="w-10 h-10 bg-brand-bg rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-gold" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-forest/60 font-semibold uppercase tracking-wider block">Customer Relations</span>
                      <a href="mailto:hello@rootandharvest.in" className="text-sm font-semibold text-forest hover:text-gold transition-colors">
                        hello@rootandharvest.in
                      </a>
                      <p className="text-[10px] text-dark/50">Response within 1 business day</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4 text-xs font-light text-dark">
                    <div className="w-10 h-10 bg-brand-bg rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-gold" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-forest/60 font-semibold uppercase tracking-wider block">Direct Coordinates</span>
                      <p className="text-sm font-semibold text-forest">+91 98765 43210</p>
                      <p className="text-[10px] text-dark/50">Mon to Sat, 10 AM to 6 PM IST</p>
                    </div>
                  </div>

                  {/* Farm coordinates */}
                  <div className="flex items-start gap-4 text-xs font-light text-dark">
                    <div className="w-10 h-10 bg-brand-bg rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-forest/60 font-semibold uppercase tracking-wider block">Harvest Operations</span>
                      <p className="text-sm font-semibold text-forest">Root & Harvest Co.</p>
                      <p className="text-xs text-dark/70">Saurashtra Agricultural Zone, Junagadh District, Gujarat, India</p>
                      <p className="text-[10px] text-gold font-mono font-medium mt-1">21.5224° N, 70.4578° E</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Simple Farm Map Mock */}
              <div className="bg-white border border-forest/5 p-6 shadow-sm space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Saurashtra Farm Location Map</span>
                <div className="relative aspect-[16/9] w-full bg-brand-bg border border-forest/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#b8903a_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  <div className="z-10 text-center space-y-1">
                    <span className="w-3 h-3 bg-gold rounded-full inline-block animate-ping" />
                    <p className="text-xs font-serif font-bold text-forest uppercase tracking-widest">Root & Harvest Farm Hub</p>
                    <p className="text-[9px] text-dark/60 font-mono">Junagadh Region, Gujarat</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Message form (Right - 7 columns) */}
            <div className="lg:col-span-7 bg-white border border-forest/5 p-8 md:p-12 space-y-6 shadow-sm relative overflow-hidden">
              <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">Send a Dispatch</h3>
              
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-12 h-12 bg-green-50 border border-green-500 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-semibold text-forest">Dispatch Sent Successfully</h4>
                    <p className="text-xs text-dark/70 max-w-xs mx-auto">We have logged your query and our team will trace back answers regarding our harvests shortly.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full text-xs p-3 border border-forest/10 focus:border-gold outline-none bg-brand-bg/20"
                          placeholder="e.g. Aditi Roy"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs p-3 border border-forest/10 focus:border-gold outline-none bg-brand-bg/20"
                          placeholder="aditi@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Dispatch Message</label>
                      <textarea
                        required
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full text-xs p-3 border border-forest/10 focus:border-gold outline-none bg-brand-bg/20 resize-none"
                        placeholder="Detail your request, batch inquiries or feedback..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-forest hover:bg-forest-light text-brand-bg uppercase tracking-widest text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      Send Dispatch Message
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
