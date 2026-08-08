"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { BrandBottle } from "@/components/ui/BrandBottle";
import { Lock, ChevronDown, Check } from "lucide-react";

function ProductCard({ product }: { product: any }) {
  const { addToCart } = useApp();
  const router = useRouter();
  const sizes = product.sizes || Object.keys(product.sizePrices);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [added, setAdded] = useState(false);

  const price = product.sizePrices[selectedSize] || Object.values(product.sizePrices)[0] || 0;
  const originalPrice = product.originalSizePrices?.[selectedSize] || null;

  let finalPrice = price;
  let finalOriginalPrice = originalPrice;

  if (product.id.includes("oil")) {
    if (selectedSize === "500 ml") {
      finalPrice = 225;
      finalOriginalPrice = 250;
    } else if (selectedSize === "1 L") {
      finalPrice = Math.max(0, price - 50);
      finalOriginalPrice = originalPrice ? Math.max(0, originalPrice - 50) : null;
    }
  }

  const discountPct = finalOriginalPrice && finalOriginalPrice > finalPrice 
    ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, 1, "Lightweight Bottle");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Rounded Image Container */}
        <Link href={`/products/${product.id}`} className="block relative aspect-square w-full bg-white rounded-2xl overflow-hidden border border-forest/10 shadow-xs group-hover:shadow-md transition-all">
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
          />
          {product.category && (
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-forest text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-forest/10">
              {product.category === "Oils" ? "Nutty" : "Heritage"}
            </span>
          )}
        </Link>

        {/* Product Title */}
        <Link 
          href={`/products/${product.id}`}
          className="font-serif text-lg font-bold text-forest hover:underline leading-snug line-clamp-1 block pt-1"
        >
          {product.name}
        </Link>

        {/* Price & Strikethrough Discount Badge */}
        <div className="flex flex-wrap items-center gap-2 font-sans pt-0.5">
          <span className="text-base font-bold text-forest">Rs. {finalPrice}.00</span>
          {finalOriginalPrice && finalOriginalPrice > finalPrice && (
            <>
              <span className="text-xs text-dark/40 line-through">Rs. {finalOriginalPrice}.00</span>
              <span className="text-[10px] font-extrabold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                {discountPct}% OFF
              </span>
            </>
          )}
        </div>

        {/* Size Selection Dropdown */}
        <div className="relative pt-1">
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full appearance-none rounded-xl border border-forest/30 bg-white px-4 py-2.5 text-xs font-medium text-forest focus:outline-none focus:border-forest shadow-xs transition-colors cursor-pointer"
          >
            {sizes.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/50 pointer-events-none" />
        </div>
      </div>

      {/* Full Width Dark Green Add To Cart Button */}
      <div className="pt-4">
        <button
          onClick={handleAddToCart}
          className="w-full py-3 bg-[#123025] hover:bg-[#1E4A3A] text-white text-center text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          {added ? "ADDED TO CART ✓" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}

function ProductsContent() {
  const { products } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cat = searchParams.get("category");

  const categoryFilter = cat 
    ? cat.toLowerCase() === "oils" 
      ? "Oils" 
      : cat.toLowerCase() === "grains" 
        ? "Grains" 
        : null
    : null;

  const oilsActive = products.filter(p => p.category === "Oils" && !p.isComingSoon && (!categoryFilter || p.category === categoryFilter));
  const oilsSoon = products.filter(p => p.category === "Oils" && p.isComingSoon && (!categoryFilter || p.category === categoryFilter));
  
  const grainsActive = products.filter(p => p.category === "Grains" && !p.isComingSoon && (!categoryFilter || p.category === categoryFilter));
  const grainsSoon = products.filter(p => p.category === "Grains" && p.isComingSoon && (!categoryFilter || p.category === categoryFilter));

  const showOils = !categoryFilter || categoryFilter === "Oils";
  const showGrains = !categoryFilter || categoryFilter === "Grains";

  const pageTitle = categoryFilter === "Oils" 
    ? "Wood Pressed Oils" 
    : categoryFilter === "Grains" 
      ? "Traditional Grains" 
      : "Our Collection";

  const pageTagline = categoryFilter === "Oils"
    ? "100% natural, unrefined, single-source cold-pressed Ghani oils."
    : categoryFilter === "Grains"
      ? "Pesticide-free heritage grains, raw groundnuts, and traditional rice."
      : "Purity isn't what we add. It's what we leave out.";

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30 min-h-screen">
      <Navbar />

      <main className="py-16 px-6">
        <div className="max-w-[1280px] mx-auto space-y-16">

          {/* Category Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => router.push("/products?category=oils")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                showOils && !showGrains 
                  ? "bg-[#123025] text-white shadow-md scale-105" 
                  : "bg-[#E5E285] text-forest hover:opacity-90 shadow-xs"
              }`}
            >
              Cold Pressed Oils
            </button>
            <button
              onClick={() => router.push("/products?category=grains")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                showGrains && !showOils 
                  ? "bg-[#123025] text-white shadow-md scale-105" 
                  : "bg-[#E5E285] text-forest hover:opacity-90 shadow-xs"
              }`}
            >
              Traditional Grains
            </button>
            {categoryFilter && (
              <button
                onClick={() => router.push("/products")}
                className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white border border-forest/20 text-forest/60 hover:text-forest transition-all cursor-pointer"
              >
                All Products
              </button>
            )}
          </div>

          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-forest tracking-tight font-semibold uppercase">
              {pageTitle}
            </h1>
            <p className="text-base text-dark/65 font-light">
              {pageTagline}
            </p>
          </div>

          {/* Categories rendering */}
          {showOils && (
            <div className="space-y-12">
              {!categoryFilter && (
                <div className="border-b border-forest/10 pb-4 mb-6">
                  <h2 className="text-2xl font-serif text-forest font-semibold uppercase tracking-wider">Wood Pressed Oils</h2>
                </div>
              )}
              
              {/* Oils Active Products Grid (4 Columns like Image 1) */}
              {oilsActive.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  {oilsActive.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Oils Coming Soon */}
              {oilsSoon.length > 0 && (
                <div className="space-y-8 pt-6">
                  <div className="flex items-center gap-6 py-2">
                    <div className="flex-1 h-[1px] bg-forest/10" />
                    <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-gold font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      Upcoming Oils
                    </div>
                    <div className="flex-1 h-[1px] bg-forest/10" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {oilsSoon.map((teaser) => (
                      <div key={teaser.id} className="bg-white border border-forest/5 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between opacity-80 shadow-xs">
                        <div className="space-y-3">
                          <div className="relative aspect-square w-full bg-white rounded-xl border border-forest/10 flex items-center justify-center p-4">
                            <Image src={teaser.image} alt={teaser.name} fill className="object-contain p-4 blur-[2px]" />
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                              <Lock className="w-5 h-5 text-forest/40" />
                              <span className="bg-forest text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow">Coming Soon</span>
                            </div>
                          </div>
                          <h3 className="text-base font-serif text-forest/50 font-semibold line-clamp-1">{teaser.name}</h3>
                          <p className="text-xs text-dark/40 font-light leading-relaxed font-sans line-clamp-2">{teaser.tagline}</p>
                          <p className="font-serif text-sm text-dark/40 font-semibold pt-1">Launching Soon</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showGrains && (
            <div className={`space-y-12 ${!categoryFilter ? "pt-16 border-t border-forest/10" : ""}`}>
              {!categoryFilter && (
                <div className="border-b border-forest/10 pb-4 mb-6">
                  <h2 className="text-2xl font-serif text-forest font-semibold uppercase tracking-wider">Traditional Grains</h2>
                </div>
              )}
              
              {/* Grains Active Products Grid (4 Columns like Image 1) */}
              {grainsActive.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  {grainsActive.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Grains Coming Soon */}
              {grainsSoon.length > 0 && (
                <div className="space-y-8 pt-6">
                  <div className="flex items-center gap-6 py-2">
                    <div className="flex-1 h-[1px] bg-forest/10" />
                    <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-gold font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      Upcoming Grains
                    </div>
                    <div className="flex-1 h-[1px] bg-forest/10" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {grainsSoon.map((teaser) => (
                      <div key={teaser.id} className="bg-white border border-forest/5 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between opacity-80 shadow-xs">
                        <div className="space-y-3">
                          <div className="relative aspect-square w-full bg-white rounded-xl border border-forest/10 flex items-center justify-center p-4">
                            <Image src={teaser.image} alt={teaser.name} fill className="object-contain p-4 blur-[2px]" />
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                              <Lock className="w-5 h-5 text-forest/40" />
                              <span className="bg-forest text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow">Coming Soon</span>
                            </div>
                          </div>
                          <h3 className="text-base font-serif text-forest/50 font-semibold line-clamp-1">{teaser.name}</h3>
                          <p className="text-xs text-dark/40 font-light leading-relaxed font-sans line-clamp-2">{teaser.tagline}</p>
                          <p className="font-serif text-sm text-dark/40 font-semibold pt-1">Launching Soon</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="bg-brand-bg min-h-screen flex items-center justify-center"><p className="text-forest tracking-widest text-xs uppercase font-semibold">Loading Collection...</p></div>}>
      <ProductsContent />
    </Suspense>
  );
}
