"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Product } from "@/data/products";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export default function ProductsPage() {
  const { products } = useApp();

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30 min-h-screen">
      <Navbar />

      <main className="pt-32 pb-48 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-forest tracking-tight">
              Our Collection
            </h1>
            <p className="text-base md:text-lg text-dark/70 font-light">
              Purity is not a process. It is the absence of it.
            </p>
          </div>



          {/* Minimalist Product List (Vertical flow for extreme simplicity & large images) */}
          <div className="space-y-40">
            {products.map((product, index) => {
              const currentPrice = Object.values(product.sizePrices)[0];
              const isComingSoon = product.isComingSoon;

              return (
                <div 
                  key={product.id}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
                >
                  {/* Large Photography */}
                  <div className={`relative aspect-[4/5] w-full bg-white shadow-sm ${index % 2 !== 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-cover p-4 transition-all duration-700 ${isComingSoon ? "blur-md opacity-70 grayscale" : ""}`}
                    />
                    {isComingSoon && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                        <span className="px-6 py-3 bg-white text-forest text-xs uppercase tracking-[0.3em] font-bold shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Minimal Content */}
                  <div className={`space-y-12 max-w-lg ${index % 2 !== 0 ? 'lg:order-1 ml-auto text-right' : 'lg:order-2 text-left'}`}>
                    
                    <div className="space-y-6">
                      <h2 className="text-3xl md:text-5xl font-serif text-forest leading-tight">
                        {!isComingSoon ? (
                          <Link href={`/products/${product.id}`} className="hover:text-gold transition-colors">
                            {product.name}
                          </Link>
                        ) : (
                          product.name
                        )}
                      </h2>
                      <p className="text-lg md:text-xl text-dark/70 font-light leading-relaxed">
                        {product.tagline}
                      </p>
                    </div>

                    {!isComingSoon && (
                      <>
                        {/* View Details Button */}
                        <div className="space-y-8 pt-6">
                          <div className="text-2xl font-serif text-forest">
                            From ₹{currentPrice}
                          </div>
                          <Link
                            href={`/products/${product.id}`}
                            className="inline-block w-full max-w-sm px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors text-center"
                          >
                            Select Size & Add To Cart
                          </Link>
                        </div>
                      </>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
