"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Menu, X, User, Settings, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NAVIGATION_LINKS } from "@/constants";
import { BRAND } from "@/config/brand";
import { Button } from "@/components/ui/Button";

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
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-brand-bg/90 backdrop-blur-md py-4 shadow-sm border-b border-forest/10"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 text-forest hover:opacity-85"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif tracking-[0.25em] text-forest font-semibold uppercase leading-none">
              Root & Harvest
            </span>
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-gold mt-1 leading-none font-sans font-medium">
              Pure Farm Heritage
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {NAVIGATION_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm tracking-widest uppercase font-medium transition-colors hover:text-gold ${
                    isActive ? "text-gold" : "text-forest"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Icons Bar */}
          <div className="flex items-center space-x-3 md:space-x-6">
            <Link
              href="/admin"
              className="p-2 text-forest hover:text-gold transition-colors"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5" />
            </Link>
            
            <Link
              href="/account"
              className="p-2 text-forest hover:text-gold transition-colors"
              title="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/products?filter=wishlist"
              className="relative p-2 text-forest hover:text-gold transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-brand-bg text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-forest hover:text-gold transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-forest text-brand-bg text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="text-lg tracking-widest uppercase font-medium text-forest hover:text-gold transition-colors flex items-center justify-between"
                  >
                    Admin Panel
                    <Settings className="w-4 h-4 opacity-50" />
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
