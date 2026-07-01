"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp, Product } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export default function ProductsPage() {
  const { products, addToCart } = useApp();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  // Initialize sizes
  useEffect(() => {
    const initialSizes: Record<string, string> = {};
    products.forEach((p) => {
      // Default to 1L or 500ml or first available size
      if (p.sizes.includes("1 L")) {
        initialSizes[p.id] = "1 L";
      } else if (p.sizes.includes("1L")) {
        initialSizes[p.id] = "1L";
      } else {
        initialSizes[p.id] = p.sizes[0];
      }
    });
    setSelectedSizes(initialSizes);
  }, [products]);

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: Product) => {
    if (product.isComingSoon) return;
    
    const size = selectedSizes[product.id] || product.sizes[0];
    addToCart(product, size, 1);
    setAddedMessage(`Added ${product.name} to your bag.`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

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

          {/* Added to Cart Notification Toast */}
          <AnimatePresence>
            {addedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 right-8 z-50 bg-forest text-brand-bg px-8 py-4 flex items-center gap-4 shadow-xl border border-forest/20"
              >
                <Check className="w-5 h-5 text-gold" />
                <span className="text-xs uppercase tracking-widest font-semibold">{addedMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimalist Product List (Vertical flow for extreme simplicity & large images) */}
          <div className="space-y-40">
            {products.map((product, index) => {
              const currentSize = selectedSizes[product.id] || product.sizes[0];
              const currentPrice = product.sizePrices[currentSize] || Object.values(product.sizePrices)[0];
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
                        {/* Size Selector */}
                        <div className={`flex flex-wrap gap-4 ${index % 2 !== 0 ? 'justify-end' : 'justify-start'}`}>
                          {product.sizes.map((size) => {
                            const isSelected = currentSize === size;
                            return (
                              <button
                                key={size}
                                onClick={() => handleSizeChange(product.id, size)}
                                className={`text-xs uppercase tracking-widest px-6 py-3 border transition-colors ${
                                  isSelected
                                    ? "border-forest text-forest bg-forest/5"
                                    : "border-forest/10 text-dark/60 hover:border-forest/40"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>

                        {/* Price and Cart Button */}
                        <div className="space-y-8 pt-6">
                          <div className="text-2xl font-serif text-forest">
                            ₹{currentPrice}
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full max-w-sm px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors"
                          >
                            Add To Cart
                          </button>
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
