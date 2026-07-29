"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowUp, Camera, ArrowRight } from "lucide-react";
import { FOOTER_LINKS } from "@/constants";
import { BRAND } from "@/config/brand";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the email to an API
    alert("Thank you for subscribing to our journal.");
    setEmail("");
  };

  return (
    <footer className="bg-forest-dark text-brand-bg pt-24 pb-12 border-t border-forest/10 font-sans font-light">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
        
        {/* Newsletter & Brand */}
        <div className="lg:col-span-5 space-y-12">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-serif tracking-[0.2em] text-brand-bg uppercase leading-none block">
              {BRAND.name}
            </span>
          </Link>
          
          <div className="space-y-6">
            <h4 className="text-xl font-serif text-gold italic">Join Our Journal</h4>
            <p className="text-sm text-brand-bg/60 leading-relaxed max-w-sm">
              Subscribe to receive stories from our farms, exclusive early access to small-batch releases, and insights into natural living.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex border-b border-brand-bg/20 pb-2 max-w-sm group focus-within:border-gold transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-brand-bg/30 text-brand-bg"
              />
              <button type="submit" className="text-gold hover:text-white transition-colors p-1" aria-label="Subscribe">
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-8 pt-2">
          
          {/* Shop */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-brand-bg/40 font-semibold">Explore</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-bg/70 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support / Policies */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-brand-bg/40 font-semibold">Policies</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-bg/70 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-6 col-span-2 sm:col-span-1">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-brand-bg/40 font-semibold">Connect</h4>
            <ul className="space-y-4">
              <li>
                <a href={`mailto:${BRAND.contact.email}`} className="text-sm text-brand-bg/70 hover:text-gold transition-colors flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-bg/40" />
                  Email Us
                </a>
              </li>
              <li>
                <a href={BRAND.socials.instagram} className="text-sm text-brand-bg/70 hover:text-gold transition-colors flex items-center gap-3">
                  <Camera className="w-4 h-4 text-brand-bg/40" />
                  Instagram
                </a>
              </li>
              <li>
                <a href={BRAND.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-bg/70 hover:text-gold transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4 text-brand-bg/40 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 mt-24 pt-8 border-t border-brand-bg/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[11px] text-brand-bg/40 uppercase tracking-widest">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
        <button
          onClick={handleScrollToTop}
          className="flex items-center space-x-2 text-[11px] uppercase tracking-[0.2em] text-brand-bg/40 hover:text-gold transition-colors"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
export default Footer;
