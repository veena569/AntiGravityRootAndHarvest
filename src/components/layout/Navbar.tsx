"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Menu, X, User, ArrowRight, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NAVIGATION_LINKS } from "@/constants";
import { BRAND } from "@/config/brand";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";

export const Navbar: React.FC = () => {
  const { cart, wishlist } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Announcement Banner */}
      <div className="w-full bg-forest text-gold text-[9px] uppercase tracking-[0.25em] py-2 px-4 text-center font-bold z-50">
        10% OFF &amp; FREE SHIPPING FOR THE FIRST 100 ORDERS IN HYDERABAD
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 h-20 flex items-center bg-brand-bg/95 backdrop-blur-md border-b border-forest/10 shadow-sm`}
      >
        <div className="w-full max-w-[1280px] mx-auto px-3.5 md:px-12 flex items-center justify-between relative">
          
          {/* Left: Mobile Toggle & Logo */}
          <div className="flex items-center gap-2 md:gap-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-1.5 text-forest hover:opacity-85"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <BrandLogo />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2">
            {NAVIGATION_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs tracking-[0.25em] uppercase font-bold transition-colors hover:text-gold ${
                    isActive ? "text-gold" : "text-forest"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Icons Bar */}
          <div className="flex items-center space-x-1 md:space-x-4">
            {/* Search Icon */}
            <Link
              href="/products"
              className="p-1.5 md:p-2 text-forest hover:text-gold transition-colors"
              title="Search Products"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/account"
              className="p-1.5 md:p-2 text-forest hover:text-gold transition-colors"
              title="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/products?filter=wishlist"
              className="relative p-1.5 md:p-2 text-forest hover:text-gold transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-brand-bg text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-1.5 md:p-2 text-forest hover:text-gold transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-forest text-brand-bg text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-[320px] bg-brand-bg p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-12">
                  <span className="text-lg font-serif tracking-widest text-forest font-semibold uppercase">
                    Root & Harvest
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-forest hover:opacity-85"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-6">
                  {NAVIGATION_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg tracking-widest uppercase font-medium text-forest hover:text-gold transition-colors flex items-center justify-between"
                    >
                      {link.name}
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </Link>
                  ))}
                  <div className="h-[1px] bg-forest/10 my-4" />
                  <Link
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="text-lg tracking-widest uppercase font-medium text-forest hover:text-gold transition-colors flex items-center justify-between"
                  >
                    My Account
                    <User className="w-4 h-4 opacity-50" />
                  </Link>
                </nav>
              </div>

              <div className="text-xs text-forest/60">
                <p>Root & Harvest D2C India</p>
                <p className="mt-1">hello@rootandharvest.in</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;
