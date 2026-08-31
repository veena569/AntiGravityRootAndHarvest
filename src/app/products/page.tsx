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
import { Lock, ChevronDown, Check, Star } from "lucide-react";

function ProductCard({ product }: { product: any }) {
  const prices = Object.values(product.sizePrices) as number[];
  const lowestPrice = Math.min(...prices);

  return (
    <Link 
      href={`/products/${product.id}`}
      className="flex flex-col justify-between group bg-white rounded-2xl border border-forest/10 p-4 shadow-xs hover:shadow-md hover:border-forest/30 transition-all duration-300"
    >
      <div className="space-y-3">
        {/* Enlarged Product Image Container */}
        <div className="relative aspect-[4/5] w-full min-h-[300px] sm:min-h-[340px] bg-brand-bg/30 rounded-xl overflow-hidden p-2 flex items-center justify-center">
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
          />
          {product.category && (
            <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-forest text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs border border-forest/10">
              {product.category === "Oils" ? "Cold Pressed" : "Farm Fresh"}
            </span>
          )}
        </div>

        {/* Star Rating & Review Count */}
        <div className="flex items-center gap-1.5 pt-1 text-gold text-xs font-semibold">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
            ))}
          </div>
          <span className="text-dark/50 text-[11px]">({product.reviewsCount || 104})</span>
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-xl font-bold text-forest group-hover:text-gold transition-colors leading-snug line-clamp-1">
          {product.name}
        </h3>

        {/* Subtitle / Tagline */}
        <p className="text-xs text-dark/60 font-light line-clamp-1">
          {product.tagline}
        </p>

        {/* Price Display (225 Onwards) */}
        <div className="flex items-center gap-2 pt-1 font-serif">
          <span className="text-lg font-bold text-forest">Rs. {lowestPrice}.00</span>
          <span className="text-xs text-gold font-extrabold uppercase tracking-wider">onwards</span>
        </div>
      </div>
    </Link>
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
    ? "WOOD PRESSED OILS" 
    : categoryFilter === "Grains" 
      ? "TRADITIONAL GRAINS & RICE" 
      : "OUR COLLECTION";

  const pageTagline = categoryFilter === "Oils"
    ? "Traditional wooden Ghani extracted oils, keeping natural nutrients pristine."
    : categoryFilter === "Grains"
      ? "Wholesome staples, thoughtfully sourced for everyday cooking."
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
