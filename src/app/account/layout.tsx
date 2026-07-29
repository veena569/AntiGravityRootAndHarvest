"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/components/layout/AuthProvider";

const TABS = [
  { name: "Profile", path: "/account/profile" },
  { name: "My Orders", path: "/account/orders" },
  { name: "Saved Addresses", path: "/account/addresses" },
  { name: "Wishlist", path: "/account/wishlist" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center text-forest text-sm font-medium">
        Loading account...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-brand-bg text-dark font-sans font-light min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-forest tracking-tight">
              My Account
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Sidebar Navigation */}
            <nav className="hidden md:flex flex-col space-y-6">
              {TABS.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`text-sm uppercase tracking-widest font-semibold transition-all border-l-2 pl-3 ${
                      isActive 
                        ? "border-forest text-forest bg-forest/5 py-1.5 pr-2" 
                        : "border-transparent text-dark/40 hover:text-forest/70 hover:border-forest/30 py-1.5"
                    }`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
              <button 
                onClick={logout}
                className="text-sm uppercase tracking-widest font-semibold text-red-900/60 hover:text-red-950 transition-colors text-left pt-6 pl-3 border-t border-forest/10"
              >
                Logout
              </button>
            </nav>

            {/* Mobile Navigation (Horizontal Scroll) */}
            <nav className="md:hidden flex overflow-x-auto space-x-6 pb-2 border-b border-forest/10 scrollbar-hide">
              {TABS.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`whitespace-nowrap text-xs uppercase tracking-widest font-semibold transition-all pb-2 border-b-2 ${
                      isActive 
                        ? "border-forest text-forest" 
                        : "border-transparent text-dark/40"
                    }`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </nav>

            {/* Content Area */}
            <div className="md:col-span-3">
              {children}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
