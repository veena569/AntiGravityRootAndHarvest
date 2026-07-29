"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { BrandBottle } from "@/components/ui/BrandBottle";

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart } = useApp();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-20 px-6">
        <div className="max-w-[1280px] mx-auto space-y-12">
          
          <div className="flex items-center gap-3">
            <Link href="/products" className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-dark/50 hover:text-forest transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
            
            {/* Cart Items (Left Column) */}
            <div className="w-full lg:w-2/3">
              <h1 className="text-5xl font-serif text-forest tracking-tight mb-16 uppercase font-semibold">
                Your Bag
              </h1>

              {cart.length === 0 ? (
                <div className="py-20 border-t border-forest/10 space-y-8">
                  <p className="text-xl font-serif text-forest">Your bag is currently empty.</p>
                  <Button 
                    href="/products" 
                    variant="outline"
                  >
                    Discover Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="hidden md:grid grid-cols-12 text-[10px] uppercase tracking-[0.2em] font-semibold text-dark/40 pb-4 border-b border-forest/10">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-3 text-center">Quantity</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>

                  <div className="divide-y divide-forest/10 border-b border-forest/10">
                    {cart.map((item, idx) => (
                      <div key={idx} className="py-12 flex flex-col md:grid md:grid-cols-12 gap-8 md:items-center">
                        
                        <div className="md:col-span-6 flex gap-8 items-center">
                          <div className="relative w-24 h-32 md:w-32 md:h-40 bg-white shrink-0 shadow-sm border border-forest/10 p-4 flex items-center justify-center">
                            {item.product.id.includes("oil") ? (
                              <BrandBottle className="w-full h-full absolute inset-0" />
                            ) : (
                              <Image 
                                src={item.product.image} 
                                alt={item.product.name} 
                                fill 
                                className="object-cover p-2"
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl md:text-2xl font-serif text-forest leading-tight">
                              <Link href={`/products/${item.product.id}`} className="hover:text-gold transition-colors">
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-dark/60 font-light flex flex-col gap-1">
                              <span>Size: {item.size}</span>
                              {item.bottleType && <span>Bottle: {item.bottleType}</span>}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.size, item.bottleType)}
                              className="text-xs uppercase tracking-widest text-dark/40 hover:text-red-800 transition-colors pt-4 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-3 flex md:justify-center">
                          <div className="flex items-center border border-forest/10">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity - 1, item.bottleType)}
                              className="px-4 py-3 text-dark/50 hover:text-forest transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-serif text-lg text-forest">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1, item.bottleType)}
                              className="px-4 py-3 text-dark/50 hover:text-forest transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-3 text-right">
                          <span className="text-2xl font-serif text-black">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary (Right Column - Sticky) */}
            {cart.length > 0 && (
              <div className="w-full lg:w-1/3 lg:sticky lg:top-32 space-y-10">
                <div className="bg-white p-10 md:p-12 shadow-sm border border-forest/5 space-y-8">
                  <h2 className="text-xs uppercase tracking-[0.3em] font-semibold text-gold pb-6 border-b border-forest/10">
                    Order Summary
                  </h2>

                  <div className="space-y-6 text-sm font-light">
                    <div className="flex justify-between text-dark/80">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-dark/80">
                      <span>Shipping</span>
                      <span className="text-forest font-medium">Complimentary</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-forest/10 flex justify-between items-end">
                    <span className="text-xs uppercase tracking-widest text-dark/60 font-semibold">Estimated Total</span>
                    <span className="text-3xl font-serif text-black tracking-tight">₹{subtotal}</span>
                  </div>

                  <div className="pt-8 space-y-4">
                    <Button
                      href="/checkout"
                      variant="primary"
                      className="w-full flex items-center justify-center gap-3 h-14"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-dark/40 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Secure Checkout
                    </div>
                  </div>
                </div>

                <div className="px-6 py-8 bg-forest/5 text-center space-y-3">
                  <h4 className="font-serif text-forest text-lg">The Root & Harvest Promise</h4>
                  <p className="text-xs text-dark/70 font-light leading-relaxed">
                    Zero chemicals. Zero preservatives. Cold-extracted natively. If you aren't completely satisfied, we'll make it right.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
