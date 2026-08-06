"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { BrandBottle } from "@/components/ui/BrandBottle";
import { Lock, Heart, ChevronDown, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";

function ProductCard({ product, index, wishlist, toggleWishlist, addToCart }: {
  product: any;
  index: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  addToCart: (product: any, size: string, quantity: number, bottleType?: string) => void;
}) {
  const sizes = product.sizes || Object.keys(product.sizePrices);
  const defaultSize = sizes.find((s: string) => s === "1 L" || s === "1L") || sizes[0] || "";
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [selectedBottleType, setSelectedBottleType] = useState("Lightweight Bottle");

  const is2L = selectedSize.toLowerCase().includes("2");
  const availableBottleTypes = is2L ? ["Lightweight Bottle"] : ["Lightweight Bottle", "Glass Bottle"];

  useEffect(() => {
    if (is2L) {
      setSelectedBottleType("Lightweight Bottle");
    }
  }, [selectedSize, is2L]);

  const price = product.sizePrices[selectedSize] || Object.values(product.sizePrices)[0] || 0;
  const originalPrice = product.originalSizePrices?.[selectedSize] || null;

  let finalPrice = price;
  let finalOriginalPrice = originalPrice;

  if (selectedBottleType === "Lightweight Bottle") {
    if (selectedSize === "500 ml") {
      finalPrice = 225;
      finalOriginalPrice = 250;
    } else if (selectedSize === "1 L") {
      finalPrice = Math.max(0, price - 50);
      finalOriginalPrice = originalPrice ? Math.max(0, originalPrice - 50) : null;
    }
  }

  const totalPrice = finalPrice * quantity;
  const totalOriginalPrice = finalOriginalPrice ? finalOriginalPrice * quantity : null;
  const isOil = product.id.includes("oil");
  const router = useRouter();

  // If the product is groundnut-oil, we add the why-made and how-made slides.
  const productSlides: Array<{ type: string; src?: string; alt?: string }> = [{ type: "main" }];
  if (product.id === "groundnut-oil") {
    productSlides.push({ type: "image", src: "/images/why-made.jpg", alt: "Why Root & Harvest?" });
    productSlides.push({ type: "image", src: "/images/how-made.jpg", alt: "How Is It Made?" });
  }

  const [activeSlide, setActiveSlide] = useState(0);

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSlide((prev) => (prev === 0 ? productSlides.length - 1 : prev - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSlide((prev) => (prev === productSlides.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize, quantity, selectedBottleType);
    router.push("/cart");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
      {/* Image Slider */}
      <div className={`relative aspect-[4/5] w-full bg-white shadow-sm border border-forest/10 p-6 flex items-center justify-center group overflow-hidden ${index % 2 !== 0 ? "lg:order-2" : "lg:order-1"}`}>
        
        {/* Render Current Slide */}
        {productSlides[activeSlide].type === "main" ? (
          isOil ? (
            <BrandBottle className="w-full h-full" />
          ) : (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover p-4"
            />
          )
        ) : (
          <Image
            src={productSlides[activeSlide].src!}
            alt={productSlides[activeSlide].alt!}
            fill
            className="object-contain p-2"
          />
        )}

        {/* Left & Right Arrows (Only if multiple slides exist) */}
        {productSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-forest hover:text-white border border-forest/10 flex items-center justify-center text-forest transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-forest hover:text-white border border-forest/10 flex items-center justify-center text-forest transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {productSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); setActiveSlide(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeSlide === idx ? "bg-forest scale-110" : "bg-forest/20"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className={`space-y-8 max-w-lg ${index % 2 !== 0 ? "lg:order-1 ml-auto text-right" : "lg:order-2 text-left"}`}>
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-serif text-forest leading-tight">
            <Link href={`/products/${product.id}`} className="hover:text-gold transition-colors">
              {product.name}
            </Link>
          </h2>
          <p className="text-lg text-dark/65 font-light leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Size Selection, Quantity, TotalPrice and Buttons below product info */}
        <div className="space-y-6 pt-4 border-t border-forest/10 text-left">
          
          {/* Size Select */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-forest/50 font-semibold block">Select Size</label>
            <div className="relative">
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full appearance-none rounded-none border border-forest/20 bg-transparent px-6 py-3.5 text-xs uppercase tracking-widest text-forest focus:border-forest focus:outline-none transition-colors bg-white"
              >
                {sizes.map((size: string) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/50 pointer-events-none" />
            </div>
          </div>

          {/* Bottle Type Select */}
          {isOil && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-forest/50 font-semibold block">Bottle Type</label>
              <div className="relative">
                <select
                  value={selectedBottleType}
                  onChange={(e) => setSelectedBottleType(e.target.value)}
                  className="w-full appearance-none rounded-none border border-forest/20 bg-transparent px-6 py-3.5 text-xs uppercase tracking-widest text-forest focus:border-forest focus:outline-none transition-colors bg-white"
                >
                  {availableBottleTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/50 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Quantity & Total Price */}
          <div className="flex items-center justify-between gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-forest/50 font-semibold block mb-2">Quantity</span>
              <div className="flex items-center border border-forest/15 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-dark/50 hover:text-forest transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-serif text-sm text-black">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-dark/50 hover:text-forest transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-forest/50 font-semibold block mb-1">Total Price</span>
              <div className="flex items-baseline justify-end gap-2">
                {totalOriginalPrice && (
                  <span className="font-serif text-sm text-dark/40 line-through">₹{totalOriginalPrice}</span>
                )}
                <span className="font-serif text-xl text-black font-semibold">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Actions: Add to Cart and Wishlist Heart */}
          <div className="flex gap-4 pt-2">
            <Button
              onClick={handleAddToCart}
              variant="primary"
              className="flex-1 h-12 text-xs uppercase tracking-widest"
            >
              Add To Cart
            </Button>
            
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-12 h-12 border flex items-center justify-center transition-all ${
                wishlist?.includes(product.id)
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-forest/20 text-forest hover:bg-forest/5"
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist?.includes(product.id) ? "fill-current" : ""}`} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, wishlist, toggleWishlist, addToCart } = useApp();

  const activeProducts = products.filter(p => !p.isComingSoon);
  const comingSoonProducts = products.filter(p => p.isComingSoon);

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30 min-h-screen">
      <Navbar />

      <main className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto space-y-20">

          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Curated Selection</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h1 className="text-5xl font-serif text-forest tracking-tight font-semibold">
              Our Collection
            </h1>
            <p className="text-lg text-dark/65 font-light">
              Purity isn't what we add. It's what we leave out.
            </p>
          </div>

          {/* Active Products */}
          <div className="space-y-32">
            {activeProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
              />
            ))}
          </div>

          {/* ── Coming Soon Divider ── */}
          <div className="flex items-center gap-6 py-4">
            <div className="flex-1 h-[1px] bg-forest/10" />
            <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-gold font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Coming Soon
            </div>
            <div className="flex-1 h-[1px] bg-forest/10" />
          </div>

          {/* Coming Soon Teasers (Omit product names completely) */}
          <div className="space-y-32">
            {comingSoonProducts.map((teaser, index) => {
              const isOil = teaser.id.includes("oil");
              
              // Omit the exact product names, use generalized category names
              const genericName = isOil ? "Wood Pressed Oil" : "Raw Forest Honey";
              const genericTagline = isOil 
                ? "A pure, unrefined addition to our wood pressed oils. Sourced from organic growers." 
                : "Wildflower forest nectar harvested from altitude valleys. Unfiltered and unheated.";

              return (
                <div
                  key={teaser.id}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center opacity-90"
                >
                  {/* Blurred image */}
                  <Link
                    href={`/products/${teaser.id}`}
                    className={`relative block aspect-[4/5] w-full bg-white border border-forest/10 overflow-hidden cursor-pointer group ${index % 2 !== 0 ? "lg:order-2" : "lg:order-1"}`}
                  >
                    <div className="absolute inset-0 p-6 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                      {isOil ? (
                        <BrandBottle className="w-full h-full" />
                      ) : (
                        <Image
                          src={teaser.image}
                          alt="Coming Soon"
                          fill
                          className="object-cover p-6"
                        />
                      )}
                    </div>
                    {/* Blur + overlay */}
                    <div className="absolute inset-0 backdrop-blur-md bg-white/40" />
                    {/* Coming soon badge */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-forest/8 border border-forest/20 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-forest/50" />
                      </div>
                      <div className="text-center">
                        <span className="block px-6 py-3 bg-forest text-white text-xs uppercase tracking-[0.3em] font-bold shadow-lg">
                          Coming Soon
                        </span>
                        <p className="text-xs text-dark/40 mt-2 tracking-wider uppercase">Launching Soon</p>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className={`space-y-6 max-w-lg ${index % 2 !== 0 ? "lg:order-1 ml-auto text-right" : "lg:order-2 text-left"}`}>
                    <div className="space-y-4">
                      {/* Name omitted, replaced with generic type indicator */}
                      <h2 className="text-3xl md:text-5xl font-serif text-forest/50 leading-tight hover:text-gold transition-colors">
                        <Link href={`/products/${teaser.id}`}>
                          {genericName}
                        </Link>
                      </h2>
                      <p className="text-lg text-dark/40 font-light leading-relaxed">
                        {genericTagline}
                      </p>
                    </div>

                    <div className="pt-4">
                      <Link 
                        href={`/products/${teaser.id}`}
                        className="inline-block border border-forest/20 hover:border-forest hover:bg-forest/5 text-forest px-6 py-3 text-xs uppercase tracking-widest font-semibold transition-all"
                      >
                        View Details &amp; Reviews
                      </Link>
                    </div>

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
