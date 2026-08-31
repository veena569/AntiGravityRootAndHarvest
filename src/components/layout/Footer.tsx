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
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 pt-2">
          
          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Shop</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-brand-bg/80 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">About</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-brand-bg/80 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Help</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-brand-bg/80 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Legal</h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs text-brand-bg/80 hover:text-gold transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Social</h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.social.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-bg/80 hover:text-gold transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
          </div>
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
