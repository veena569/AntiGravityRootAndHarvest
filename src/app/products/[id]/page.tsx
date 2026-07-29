"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus, Star, ChevronDown, ChevronUp, Check, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Product } from "@/data/products";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { BrandBottle } from "@/components/ui/BrandBottle";
import { Button } from "@/components/ui/Button";

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { products, addToCart, wishlist, toggleWishlist } = useApp();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const router = useRouter();
  const defaultSize = product.sizes.find((s: string) => s === "1 L" || s === "1L") || product.sizes[0] || "";
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [selectedBottleType, setSelectedBottleType] = useState("Lightweight Bottle");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const is2L = selectedSize.toLowerCase().includes("2");
  const availableBottleTypes = is2L ? ["Lightweight Bottle"] : ["Lightweight Bottle", "Glass Bottle"];

  useEffect(() => {
    if (selectedSize && is2L) {
      setSelectedBottleType("Lightweight Bottle");
    }
  }, [selectedSize, is2L]);

  const currentPriceRaw = selectedSize ? product.sizePrices[selectedSize] : Object.values(product.sizePrices)[0];
  const currentOriginalPriceRaw = selectedSize 
    ? (product.originalSizePrices?.[selectedSize] || null) 
    : (product.originalSizePrices ? Object.values(product.originalSizePrices)[0] : null);

  let currentPrice = currentPriceRaw;
  let currentOriginalPrice = currentOriginalPriceRaw;

  if (selectedBottleType === "Lightweight Bottle") {
    if (selectedSize === "500 ml") {
      currentPrice = 225;
      currentOriginalPrice = 250;
    } else if (selectedSize === "1 L") {
      currentPrice = Math.max(0, currentPriceRaw - 50);
      currentOriginalPrice = currentOriginalPriceRaw ? Math.max(0, currentOriginalPriceRaw - 50) : null;
    }
  }

  const handleAddToCart = () => {
    if (product.isComingSoon || !selectedSize) return;
    addToCart(product, selectedSize, quantity, selectedBottleType);
    router.push("/cart");
  };

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30 min-h-screen">
      <Navbar />

      <main>
        {/* Navigation Breadcrumb */}
        <div className="pt-32 pb-8 px-6 max-w-7xl mx-auto">
          <Link href="/products" className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-dark/50 hover:text-forest transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Collection
          </Link>
        </div>

        {/* Product Hero Area (Extremely Simple) */}
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 py-20">
          
          {/* Huge Photography */}
          <div className="relative aspect-[4/5] bg-white w-full border border-forest/10 p-8 shadow-sm">
            {product.id.includes("oil") ? (
              <BrandBottle className="w-full h-full absolute inset-0" />
            ) : (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`object-cover p-4 ${product.isComingSoon ? "blur-md opacity-70 grayscale" : ""}`}
                priority
              />
            )}
          </div>

          {/* Core Info & Cart Actions */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-serif text-forest tracking-tight leading-tight uppercase font-semibold">
                {product.name}
              </h1>
              <p className="text-lg text-dark/70 font-light leading-relaxed">
                {product.tagline}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-base text-dark/80 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* If product is coming soon, just show a label, else show cart actions */}
            {product.isComingSoon ? (
              <div className="pt-8 border-t border-forest/10">
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-gold">Launching Soon</p>
              </div>
            ) : (
              <div className="space-y-12 pt-8 border-t border-forest/10">
                
                {/* Size Selection */}
                <div className="space-y-6">
                  <label htmlFor="size-select" className="text-xs uppercase tracking-widest text-forest/50 font-semibold block">Select Size (Mandatory)</label>
                  <div className="relative">
                    <select
                      id="size-select"
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full appearance-none rounded-none border border-forest/20 bg-transparent px-8 py-4 text-sm uppercase tracking-widest text-forest focus:border-forest focus:outline-none transition-colors"
                    >
                      <option value="" disabled>Choose a size</option>
                      {product.sizes.filter(size => ['250ml', '500ml', '1000ml', '250 ml', '500 ml', '1 L', '1L'].includes(size.toLowerCase()) || true).map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50 pointer-events-none" />
                  </div>
                </div>

                {/* Bottle Type Selection */}
                {selectedSize && product.id.includes("oil") && (
                  <div className="space-y-6">
                    <label htmlFor="bottle-select" className="text-xs uppercase tracking-widest text-forest/50 font-semibold block">Select Bottle Type</label>
                    <div className="relative">
                      <select
                        id="bottle-select"
                        value={selectedBottleType}
                        onChange={(e) => setSelectedBottleType(e.target.value)}
                        className="w-full appearance-none rounded-none border border-forest/20 bg-transparent px-8 py-4 text-sm uppercase tracking-widest text-forest focus:border-forest focus:outline-none transition-colors bg-white"
                      >
                        {availableBottleTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Add to Cart Line */}
                <div className="flex flex-col sm:flex-row items-end gap-6">
                  <div className="w-full sm:w-auto">
                    <span className="text-xs uppercase tracking-widest text-forest/50 font-semibold block mb-4">Quantity</span>
                    <div className="flex items-center border border-forest/10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-6 py-4 text-dark/50 hover:text-forest transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-serif text-lg text-black">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-6 py-4 text-dark/50 hover:text-forest transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="text-xs uppercase tracking-widest text-forest/50 font-semibold">Total Price</span>
                      <div className="flex items-baseline gap-2">
                        {currentOriginalPrice && (
                          <span className="font-serif text-lg text-dark/40 line-through">₹{currentOriginalPrice * quantity}</span>
                        )}
                        <span className="font-serif text-2xl text-black font-semibold">₹{currentPrice * quantity}</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={handleAddToCart}
                        disabled={!selectedSize}
                        variant="primary"
                        className="w-full h-14"
                      >
                        {selectedSize ? "Add To Cart" : "Select Size"}
                      </Button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`w-14 h-14 border flex items-center justify-center shrink-0 transition-all ${
                          wishlist?.includes(product.id)
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-forest/20 text-forest hover:bg-forest/5"
                        }`}
                        aria-label="Toggle Wishlist"
                      >
                        <Heart className={`w-5 h-5 ${wishlist?.includes(product.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Minimal Details Grid (Benefits, Nutrition, Storage) */}
        <section className="bg-white py-20 px-6 border-y border-forest/10">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-8">The Benefits</h3>
              <ul className="space-y-4 text-sm text-dark/80 font-light leading-relaxed">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-1.5 h-1.5 bg-forest/30 mt-2 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-8">Nutrition (Per 100g)</h3>
              <ul className="space-y-3 text-sm text-dark/80 font-light w-full">
                {product.nutrition.map((item, i) => (
                  <li key={i} className="flex justify-between border-b border-forest/10 pb-3">
                    <span className="text-dark/60">{item.label}</span>
                    <span className="font-medium text-forest">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-8">Storage</h3>
              <p className="text-sm text-dark/80 font-light leading-relaxed">
                {product.storage}
              </p>
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mt-12 mb-4">Ingredients</h3>
              <p className="text-sm text-dark/80 font-light leading-relaxed">
                {product.ingredients}
              </p>
            </div>

          </div>
        </section>

        {/* Minimal Customer Reviews */}
        <section className="py-20 px-6 bg-brand-bg">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-serif text-forest uppercase tracking-wider font-semibold">Customer Perspectives</h2>
              <div className="flex items-center justify-center gap-3 text-lg font-serif text-forest">
                <Star className="w-5 h-5 fill-gold text-gold" />
                {product.rating} / 5 based on {product.reviewsCount} reviews
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
              {product.reviews.map((r, idx) => (
                <div key={idx} className="space-y-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-gold text-gold' : 'fill-transparent text-dark/20'}`} />
                    ))}
                  </div>
                  <h4 className="text-xl font-serif text-forest leading-tight">"{r.title}"</h4>
                  <p className="text-sm text-dark/70 font-light leading-relaxed">
                    {r.comment}
                  </p>
                  <div className="flex items-center gap-3 pt-4 text-xs uppercase tracking-widest">
                    <span className="font-semibold text-forest">{r.author}</span>
                    {r.verified && <span className="text-gold flex items-center gap-1"><Check className="w-3 h-3" /> Verified</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Minimal FAQ */}
        <section className="py-20 px-6 bg-white border-t border-forest/10">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-serif text-forest uppercase tracking-wider font-semibold">Common Queries</h2>
            </div>
            
            <div className="divide-y divide-forest/10 border-t border-b border-forest/10">
              {product.faqs.map((faq, idx) => (
                <div key={idx} className="py-8">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <span className="text-lg font-serif text-forest pr-8 group-hover:text-gold transition-colors">{faq.q}</span>
                    {activeFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-gold shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-forest/40 group-hover:text-gold transition-colors shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-6 text-sm text-dark/70 font-light leading-relaxed pr-12">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
