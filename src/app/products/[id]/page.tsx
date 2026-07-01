"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Minus, Star, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useApp, Product } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { products, addToCart } = useApp();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const [selectedSize, setSelectedSize] = useState(product.sizes.includes("1 L") ? "1 L" : product.sizes.includes("1L") ? "1L" : product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const currentPrice = product.sizePrices[selectedSize] || Object.values(product.sizePrices)[0];

  const handleAddToCart = () => {
    if (product.isComingSoon) return;
    addToCart(product, selectedSize, quantity);
    setAddedMessage(`Added ${quantity}x ${product.name} (${selectedSize}) to bag.`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30 min-h-screen">
      <Navbar />

      {/* Added Notification */}
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

      <main>
        {/* Navigation Breadcrumb */}
        <div className="pt-32 pb-8 px-6 max-w-7xl mx-auto">
          <Link href="/products" className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-dark/50 hover:text-forest transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Collection
          </Link>
        </div>

        {/* Product Hero Area (Extremely Simple) */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 pb-32">
          
          {/* Huge Photography */}
          <div className="relative aspect-[4/5] bg-white w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-cover p-4 ${product.isComingSoon ? "blur-md opacity-70 grayscale" : ""}`}
              priority
            />
          </div>

          {/* Core Info & Cart Actions */}
          <div className="flex flex-col justify-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-forest tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-lg md:text-xl text-dark/70 font-light leading-relaxed">
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
                  <span className="text-xs uppercase tracking-widest text-forest/50 font-semibold block">Select Size</span>
                  <div className="flex flex-wrap gap-4">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`text-sm uppercase tracking-widest px-8 py-4 border transition-colors ${
                            isSelected
                              ? "border-forest text-forest bg-forest/5"
                              : "border-forest/10 text-dark/50 hover:border-forest/40"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                      <span className="w-12 text-center font-serif text-lg text-forest">{quantity}</span>
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
                      <span className="font-serif text-2xl text-forest">₹{currentPrice * quantity}</span>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="w-full px-8 py-5 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Minimal Details Grid (Benefits, Nutrition, Storage, Traceability) */}
        <section className="bg-white py-32 px-6 border-y border-forest/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-8">
            
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

            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-8">Traceability</h3>
              <ul className="space-y-4 text-sm text-dark/80 font-light">
                <li className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-dark/40">Pressed On</span>
                  <span className="font-medium text-forest">{product.pressedOn}</span>
                </li>
                <li className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-dark/40">Packed On</span>
                  <span className="font-medium text-forest">{product.packedOn}</span>
                </li>
                <li className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-dark/40">Best Before</span>
                  <span className="font-medium text-forest">{product.bestBefore}</span>
                </li>
                <li className="flex flex-col space-y-1 pt-4">
                  <span className="text-[10px] uppercase tracking-widest text-dark/40">Batch No.</span>
                  <span className="font-mono text-forest bg-forest/5 px-2 py-1 inline-block w-fit mt-1">{product.batchNumber}</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* Minimal Customer Reviews */}
        <section className="py-32 px-6 bg-brand-bg">
          <div className="max-w-4xl mx-auto space-y-24">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-serif text-forest">Customer Perspectives</h2>
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
        <section className="py-32 px-6 bg-white border-t border-forest/10">
          <div className="max-w-3xl mx-auto space-y-16">
            <div className="text-center">
              <h2 className="text-3xl font-serif text-forest">Common Queries</h2>
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
