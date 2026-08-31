"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, MapPin, Phone, Send, Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => {
          setSent(false);
        }, 5000);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to send message. Please try again later.");
      }
    } catch (err) {
      console.error("[CONTACT_SUBMIT_FAILED]", err);
      alert("Network error sending message. Please try again.");
    } finally {
      setSending(false);
    }
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
              Connect With <span className="italic font-normal text-gold">Us</span>
            </h1>
            <p className="text-sm md:text-base text-dark/75 font-light">
              Have questions about wood pressing methods, batch numbers, or bulk logistics? Write or call us directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            
            {/* Info Cards (Left - 5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white border border-forest/5 p-8 space-y-6 shadow-sm rounded-sm">
                <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">We're Here to Help</h3>
                
                <div className="space-y-6">
                  
                  {/* Email */}
                  <div className="flex items-start gap-4 text-xs font-light text-dark">
                    <div className="w-10 h-10 bg-[#EA4335]/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#EA4335]" />
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
                    <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[#007AFF]" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-forest/60 font-semibold uppercase tracking-wider block">Direct Phone</span>
                      <a href="tel:+919121603832" className="text-sm font-semibold text-forest hover:text-gold transition-colors">
                        +91 9121603832
                      </a>
                      <p className="text-[10px] text-dark/50">Mon to Sat, 10 AM to 6 PM IST</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start gap-4 text-xs font-light text-dark">
                    <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.023-5.091-2.885-6.957C16.593 1.991 14.121.968 11.999.968c-5.442 0-9.866 4.415-9.87 9.831-.001 1.776.475 3.51 1.376 5.061l-.972 3.548 3.65-.957zm11.524-5.32c-.312-.156-1.85-.912-2.137-1.016-.288-.105-.497-.156-.706.156-.209.312-.811 1.016-.993 1.22-.182.205-.364.229-.676.073-.312-.156-1.318-.485-2.51-1.548-.928-.827-1.553-1.85-1.735-2.16-.182-.312-.02-.481.136-.636.14-.139.312-.364.469-.547.156-.182.209-.312.312-.52.104-.209.052-.391-.026-.547-.078-.156-.706-1.7-.967-2.327-.254-.61-.513-.526-.706-.536-.183-.01-.392-.01-.6-.01-.209 0-.547.079-.834.39-.287.313-1.096 1.07-1.096 2.61 0 1.54 1.12 3.027 1.277 3.235.157.208 2.203 3.364 5.336 4.717.745.322 1.327.514 1.782.658.749.238 1.432.205 1.971.125.6-.09 1.849-.756 2.11-1.448.261-.692.261-1.285.183-1.412-.078-.128-.287-.208-.6-.364z"/>
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <span className="text-forest/60 font-semibold uppercase tracking-wider block">WhatsApp Connect</span>
                      <a 
                        href="https://wa.me/919121603832"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-widest font-semibold transition-colors"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-start gap-4 text-xs font-light text-dark">
                    <div className="w-10 h-10 bg-[#E1306C]/10 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#E1306C] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <span className="text-forest/60 font-semibold uppercase tracking-wider block">Instagram Connect</span>
                      <a 
                        href="https://www.instagram.com/rootandharvest.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-forest hover:text-gold transition-colors block"
                      >
                        @rootandharvest.in
                      </a>
                      <p className="text-[10px] text-dark/50">Follow us for updates & stories</p>
                    </div>
                  </div>

                  {/* Business address */}
                  <div className="flex items-start gap-4 text-xs font-light text-dark">
                    <div className="w-10 h-10 bg-[#E11D48]/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#E11D48]" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-forest/60 font-semibold uppercase tracking-wider block">Business Address</span>
                      <p className="text-sm font-semibold text-forest">Root & Harvest.in</p>
                      <p className="text-xs text-dark/70">Central Park Phase -1, Serilingmapally, Hyderabad, Telangana 500019</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Scan to Connect QR Codes Card */}
              <div className="bg-white border border-forest/5 p-8 space-y-6 shadow-sm rounded-sm">
                <h3 className="text-sm font-serif text-forest font-semibold border-b border-forest/5 pb-3">Scan to Connect</h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* Instagram QR */}
                  <div className="text-center space-y-3">
                    <a 
                      href="https://www.instagram.com/rootandharvest.in/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block border border-forest/10 p-2 bg-brand-bg/20 rounded-sm relative aspect-square w-full max-w-[140px] mx-auto overflow-hidden group cursor-pointer"
                    >
                      <Image 
                        src="/images/instagram-qr.jpg" 
                        alt="Instagram QR Code" 
                        width={140} 
                        height={140}
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-forest/70 font-semibold block">Instagram</span>
                      <a 
                        href="https://www.instagram.com/rootandharvest.in/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-forest hover:text-gold transition-colors block mt-1"
                      >
                        @rootandharvest.in
                      </a>
                    </div>
                  </div>

                  {/* YouTube QR */}
                  <div className="text-center space-y-3">
                    <a 
                      href="https://www.youtube.com/@rootandharvest" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block border border-forest/10 p-2 bg-brand-bg/20 rounded-sm relative aspect-square w-full max-w-[140px] mx-auto overflow-hidden group font-sans cursor-pointer"
                    >
                      <Image 
                        src="/images/youtube-qr.jpg" 
                        alt="YouTube QR Code" 
                        width={140} 
                        height={140}
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-forest/70 font-semibold block">YouTube Channel</span>
                      <a 
                        href="https://www.youtube.com/@rootandharvest" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-forest hover:text-gold transition-colors block mt-1"
                      >
                        Watch our process
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple Location Map Mock */}
              <div className="bg-white border border-forest/5 p-6 shadow-sm space-y-3 rounded-sm">
                <span className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Office Location Map</span>
                <div className="relative aspect-[16/9] w-full bg-brand-bg border border-forest/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#b8903a_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  <div className="z-10 text-center space-y-1">
                    <span className="w-3 h-3 bg-gold rounded-full inline-block animate-ping" />
                    <p className="text-xs font-serif font-bold text-forest uppercase tracking-widest">Root & Harvest.in</p>
                    <p className="text-[9px] text-dark/60 font-mono">Serilingmapally, Hyderabad</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Message form (Right - 7 columns) */}
            <div className="lg:col-span-7 bg-white border border-forest/5 p-8 md:p-12 space-y-6 shadow-sm rounded-sm relative overflow-hidden">
              <h3 className="text-lg font-serif text-forest font-semibold border-b border-forest/5 pb-3">Send a Message</h3>
              
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
                    <h4 className="text-base font-semibold text-forest">Message Sent Successfully</h4>
                    <p className="text-xs text-dark/70 max-w-xs mx-auto">We have logged your query and our team will get back to you shortly.</p>
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
                      <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Message</label>
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
                      disabled={sending}
                      className="w-full py-4 bg-forest hover:bg-forest-light text-brand-bg uppercase tracking-widest text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? "Sending Message..." : "Send Message"}
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
