"use client";

import React from "react";
import Link from "next/link";
import { Mail, MapPin, ArrowUp } from "lucide-react";

import { NAVIGATION_LINKS, FOOTER_LINKS } from "@/constants";
import { BRAND } from "@/config/brand";

export const Footer: React.FC = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-forest text-brand-bg pt-20 pb-10 border-t border-forest/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        
        {/* Brand Information */}
        <div className="space-y-6">
          <Link href="/" className="inline-block">
            <span className="text-xl font-serif tracking-[0.25em] text-brand-bg font-semibold uppercase leading-none block">
              {BRAND.name}
            </span>
            <span className="text-[8px] uppercase tracking-[0.4em] text-gold mt-1 leading-none font-sans font-medium block">
              {BRAND.tagline}
            </span>
          </Link>
          <p className="text-sm text-brand-bg/75 leading-relaxed font-light">
            {BRAND.mission}
          </p>
          <div className="flex space-x-4 pt-2">
            <a href={BRAND.socials.instagram} className="hover:text-gold transition-colors text-brand-bg" aria-label="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href={BRAND.socials.youtube} className="hover:text-gold transition-colors text-brand-bg" aria-label="YouTube">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.021 0 12 0 12s0 3.979.502 5.837a3.002 3.002 0 0 0 2.11 2.107C4.472 20.455 12 20.455 12 20.455s7.528 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.979 24 12 24 12s0-3.979-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-gold font-semibold">Explore</h4>
          <ul className="space-y-3">
            {FOOTER_LINKS.shop.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-brand-bg/85 hover:text-gold transition-colors font-light">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care / Policies */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-gold font-semibold">Policies</h4>
          <ul className="space-y-3">
            {FOOTER_LINKS.support.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-brand-bg/85 hover:text-gold transition-colors font-light">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Coordinates */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-gold font-semibold">Coordinates</h4>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-gold mt-1 shrink-0" />
              <div>
                <a href={`mailto:${BRAND.contact.email}`} className="text-sm text-brand-bg/85 hover:text-gold transition-colors font-light">
                  {BRAND.contact.email}
                </a>
                <p className="text-[11px] text-brand-bg/50 mt-0.5">Response in 24 hours</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-gold mt-1 shrink-0" />
              <div className="text-sm text-brand-bg/85 leading-relaxed font-light">
                <p className="font-medium text-brand-bg">Root & Harvest Farms</p>
                <p className="text-xs text-brand-bg/75">{BRAND.contact.address}</p>
              </div>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-brand-bg/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-brand-bg/50 font-light">
          © {new Date().getFullYear()} {BRAND.name}. Crafted with honesty. All rights reserved.
        </p>
        <button
          onClick={handleScrollToTop}
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gold hover:text-brand-bg transition-colors"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
export default Footer;
