"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, ShieldCheck, Truck, CheckCircle2, Factory, Heart, Microscope, Star, Users, X, Lock } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { BrandBottle } from "@/components/ui/BrandBottle";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Review } from "@/components/ui";
import { INITIAL_PRODUCTS } from "@/data/products";

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`section-reveal ${className}`}>{children}</div>;
}

export default function HomePage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("oils");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("[FETCH_REVIEWS_FAILED]", err);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat === "grains") {
        setSelectedCategory("grains");
        setTimeout(() => {
          const el = document.getElementById("explore-categories");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else if (cat === "oils") {
        setSelectedCategory("oils");
        setTimeout(() => {
          const el = document.getElementById("explore-categories");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="flex flex-col w-full selection:bg-gold/20 font-sans bg-brand-bg text-dark overflow-x-hidden font-light">
      <Navbar />

      {/* ============================================================
          1. HERO — Brand Infographic Banner
          ============================================================ */}
      <section className="relative w-full bg-brand-bg flex flex-col items-center overflow-hidden">
        <h1 className="sr-only">ROOT &amp; HARVEST | Premium Wood Pressed Oils &amp; Farm Fresh Foods</h1>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideFromTop {
            0% {
              transform: translateY(-80px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-from-top {
            animation: slideFromTop 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 pt-8 pb-16 animate-slide-from-top">
          <div className="relative w-full aspect-[3/2] border-4 border-forest shadow-lg overflow-hidden bg-white rounded-md">
            <Image
              src="/images/brand-banner-v2.jpg"
              alt="Root & Harvest Brand Infographic"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          2. TRUST BAR — Animated scrolling marquee
          ============================================================ */}
      <section className="border-y border-forest/10 bg-forest overflow-hidden py-4">
        <div className="flex gap-16 animate-[marquee_22s_linear_infinite] whitespace-nowrap">
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex gap-16 shrink-0">
              {[
                { icon: <Leaf className="w-4 h-4"/>, label: "100% Natural" },
                { icon: <ShieldCheck className="w-4 h-4"/>, label: "No Preservatives" },
                { icon: <CheckCircle2 className="w-4 h-4"/>, label: "Secure Payments" },
                { icon: <Truck className="w-4 h-4"/>, label: "Fast Delivery" },
                { icon: <Factory className="w-4 h-4"/>, label: "Made in India" },
                { icon: <Heart className="w-4 h-4"/>, label: "Family Trusted" },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-gold font-semibold">
                  <span className="text-gold/60">{item.icon}</span>
                  {item.label}
                  <span className="text-gold/30 ml-8">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          3. WHY CHOOSE US — Warm beige, not dark
          ============================================================ */}
      <section className="py-24 bg-[#F8F5EF] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/4 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-forest/3 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-[1280px] mx-auto px-6 md:px-12">
          <RevealSection className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Our Promise</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight">
              The Root & Harvest<br />Difference
            </h2>
            <p className="text-dark/55 text-base max-w-md mx-auto">
              Every drop is a testament to nature's uncompromised purity.
            </p>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Factory className="w-6 h-6"/>, title: "Freshly Wood Pressed", desc: "Extracted at low temperatures using traditional wooden ghani — preserving every nutrient." },
              { icon: <Leaf className="w-6 h-6"/>, title: "No Chemicals", desc: "Absolutely no solvents, preservatives, or artificial additives. Nature's way, always." },
              { icon: <CheckCircle2 className="w-6 h-6"/>, title: "Small Batch", desc: "Made in limited quantities to ensure maximum freshness and uncompromised quality." },
              { icon: <ShieldCheck className="w-6 h-6"/>, title: "100% Transparency", desc: "Complete visibility from farm to bottle with lab-certified purity and batch-level traceability." },
              { icon: <Truck className="w-6 h-6"/>, title: "Direct from Farms", desc: "Sourced directly from trusted family farms across India — no middlemen." },
              { icon: <Heart className="w-6 h-6"/>, title: "Family First", desc: "Crafted with the same love and care we demand for our own children's meals." },
            ].map((feature, idx) => (
              <div key={idx}
                className="group relative bg-white border border-forest/8 p-8 hover:border-gold/30 hover:shadow-lg transition-all duration-400 hover-lift"
              >
                {/* Gold top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-12 h-12 rounded-full bg-forest/6 flex items-center justify-center text-forest mb-6 group-hover:bg-forest group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-serif text-forest font-semibold mb-2 tracking-wide uppercase">{feature.title}</h3>
                <p className="text-sm text-dark/55 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ============================================================
          4. OUR STORY — Warm split layout
          ============================================================ */}
      <section id="our-story" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Story */}
            <RevealSection className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-[1px] bg-gold" />
                  <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Our Heritage</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight leading-tight">
                  Why We Started<br />Root & Harvest
                </h2>
              </div>
              <div className="space-y-5 text-dark/65 text-base leading-relaxed">
                <p>
                  Root & Harvest was founded by two software engineers who grew up deeply connected to farming. As we built our careers in technology, we saw how disconnected modern food had become from nature.
                </p>
                <p>
                  We watched our families compromise on quality without even realizing it — trading purity for convenience. We decided to fix that.
                </p>
                <p className="font-serif text-xl italic text-forest border-l-2 border-gold pl-4">
                  "Every family deserves food they can implicitly trust."
                </p>
              </div>
              <Button href="/products" variant="primary" className="w-fit">
                Explore Our Collection <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </RevealSection>

            {/* Right: Image */}
            <RevealSection className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl lg:ml-auto">
              <Image 
                src="/images/family.jpg" 
                alt="Root & Harvest Family" 
                fill 
                className="object-cover"
              />
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ============================================================
          4.5 CATEGORIES & PRODUCTS GRID
          ============================================================ */}
      <section id="explore-categories" className="py-24 bg-[#F8F5EF] relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          {/* Section Header */}
          <RevealSection className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Our Clean Food Categories</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight font-semibold uppercase">
              Explore Our Farm Offerings
            </h2>
            <p className="text-sm text-dark/60 font-sans">
              Select a category to discover raw, pure, farm-fresh ingredients.
            </p>
          </RevealSection>

          {/* Category Selector Tabs */}
          <RevealSection className="flex justify-center gap-6 mb-16 border-b border-forest/10 pb-4">
            <button
              onClick={() => setSelectedCategory("oils")}
              className={`pb-4 px-6 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all cursor-pointer ${
                selectedCategory === "oils" 
                  ? "border-forest text-forest scale-105" 
                  : "border-transparent text-dark/40 hover:text-forest"
              }`}
            >
              Wood Pressed Oils
            </button>
            <button
              onClick={() => setSelectedCategory("grains")}
              className={`pb-4 px-6 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all cursor-pointer ${
                selectedCategory === "grains" 
                  ? "border-forest text-forest scale-105" 
                  : "border-transparent text-dark/40 hover:text-forest"
              }`}
            >
              Traditional Grains
            </button>
          </RevealSection>

          {/* Render Active Category */}
          <RevealSection>
            {selectedCategory === "oils" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Active Oil: Groundnut Oil */}
                <div className="bg-white border border-forest/5 p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] w-full bg-white border border-forest/10 flex items-center justify-center p-4">
                      <Image src="/images/groundnut-oil-1l.jpg" alt="Wood Pressed Groundnut Oil" fill className="object-contain p-4" />
                    </div>
                    <h3 className="text-xl font-serif text-forest font-semibold mt-4">Wood Pressed Groundnut Oil</h3>
                    <p className="text-xs text-dark/60 font-light leading-relaxed font-sans">
                      100% natural, single-source bold groundnuts slowly wood-pressed. Perfect for everyday Indian deep frying.
                    </p>
                    <p className="font-serif text-lg text-forest font-semibold pt-2">From ₹249.00</p>
                  </div>
                  <div className="pt-6">
                    <Link
                      href="/products/groundnut-oil"
                      className="block w-full py-3 bg-forest hover:bg-forest-light text-white text-center text-xs uppercase tracking-widest font-semibold transition-colors"
                    >
                      View Details &amp; Reviews
                    </Link>
                  </div>
                </div>

                {/* Active Oil: Sesame Oil */}
                <div className="bg-white border border-forest/5 p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] w-full bg-white border border-forest/10 flex items-center justify-center p-4">
                      <Image src="/images/sesame-oil-1l.jpg" alt="Wood Pressed Sesame Oil" fill className="object-contain p-4" />
                    </div>
                    <h3 className="text-xl font-serif text-forest font-semibold mt-4">Wood Pressed Sesame Oil</h3>
                    <p className="text-xs text-dark/60 font-light leading-relaxed font-sans">
                      Slow-pressed rich sesame oil, unrefined, zero preservatives. Highly aromatic and ideal for nourishing health.
                    </p>
                    <p className="font-serif text-lg text-forest font-semibold pt-2">From ₹319.00</p>
                  </div>
                  <div className="pt-6">
                    <Link
                      href="/products/sesame-oil"
                      className="block w-full py-3 bg-forest hover:bg-forest-light text-white text-center text-xs uppercase tracking-widest font-semibold transition-colors"
                    >
                      View Details &amp; Reviews
                    </Link>
                  </div>
                </div>

                {/* Coming Soon Oil: Sunflower Oil */}
                <div className="bg-white border border-forest/5 p-6 relative overflow-hidden flex flex-col justify-between opacity-80">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] w-full bg-white border border-forest/10 flex items-center justify-center p-4">
                      <Image src="/images/sunflower-oil-1l.jpg" alt="Wood Pressed Sunflower Oil" fill className="object-contain p-4 blur-[2px]" />
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                        <Lock className="w-5 h-5 text-forest/40" />
                        <span className="bg-forest text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 shadow">Coming Soon</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-serif text-forest/50 font-semibold mt-4">Wood Pressed Sunflower Oil</h3>
                    <p className="text-xs text-dark/40 font-light leading-relaxed font-sans">
                      Slow-pressed premium seeds, unrefined, lightweight and rich in Vitamin E. Perfect for daily cooking.
                    </p>
                    <p className="font-serif text-lg text-dark/40 font-semibold pt-2">Launching Soon</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Active Grain: Organic Raw Groundnuts */}
                <div className="bg-white border border-forest/5 p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] w-full bg-white border border-forest/10 flex items-center justify-center p-4">
                      <Image src="/images/groundnuts.jpg" alt="Organic Raw Groundnuts" fill className="object-contain p-4" />
                    </div>
                    <h3 className="text-xl font-serif text-forest font-semibold mt-4">Organic Raw Groundnuts</h3>
                    <p className="text-xs text-dark/60 font-light leading-relaxed font-sans">
                      Premium, pesticide-free bold peanuts sourced directly from rain-fed family farms. Hand-shelled and sun-dried.
                    </p>
                    <p className="font-serif text-lg text-forest font-semibold pt-2">From ₹99.00</p>
                  </div>
                  <div className="pt-6">
                    <Link
                      href="/products/groundnuts"
                      className="block w-full py-3 bg-forest hover:bg-forest-light text-white text-center text-xs uppercase tracking-widest font-semibold transition-colors"
                    >
                      View Details &amp; Reviews
                    </Link>
                  </div>
                </div>

                {/* Active Grain: Jai Sriram Unpolished Rice */}
                <div className="bg-white border border-forest/5 p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] w-full bg-white border border-forest/10 flex items-center justify-center p-4">
                      <Image src="/images/jaisriram-unpolished-rice.jpg" alt="Jai Sriram Unpolished Rice" fill className="object-contain p-4" />
                    </div>
                    <h3 className="text-xl font-serif text-forest font-semibold mt-4">Jai Sriram Unpolished Rice</h3>
                    <p className="text-xs text-dark/60 font-light leading-relaxed font-sans">
                      Heritage unpolished Jai Sriram rice variety. High fiber, rich in vitamins, with authentic earthy flavor.
                    </p>
                    <p className="font-serif text-lg text-forest font-semibold pt-2">From ₹95.00</p>
                  </div>
                  <div className="pt-6">
                    <Link
                      href="/products/jaisriram-unpolished-rice"
                      className="block w-full py-3 bg-forest hover:bg-forest-light text-white text-center text-xs uppercase tracking-widest font-semibold transition-colors"
                    >
                      View Details &amp; Reviews
                    </Link>
                  </div>
                </div>

                {/* Active Grain: Jai Sriram Polished Rice */}
                <div className="bg-white border border-forest/5 p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] w-full bg-white border border-forest/10 flex items-center justify-center p-4">
                      <Image src="/images/jaisriram-polished-rice.jpg" alt="Jai Sriram Polished Rice" fill className="object-contain p-4" />
                    </div>
                    <h3 className="text-xl font-serif text-forest font-semibold mt-4">Jai Sriram Polished Rice</h3>
                    <p className="text-xs text-dark/60 font-light leading-relaxed font-sans">
                      Gently polished fine-grain premium rice variety. Sweet natural taste, cooks into light and fluffy grains.
                    </p>
                    <p className="font-serif text-lg text-forest font-semibold pt-2">From ₹88.00</p>
                  </div>
                  <div className="pt-6">
                    <Link
                      href="/products/jaisriram-polished-rice"
                      className="block w-full py-3 bg-forest hover:bg-forest-light text-white text-center text-xs uppercase tracking-widest font-semibold transition-colors"
                    >
                      View Details &amp; Reviews
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </RevealSection>

        </div>
      </section>

      {/* ============================================================
          4.8 BRAND STORY BANNER — Farm Infographic
          ============================================================ */}
      <section className="py-12 bg-[#F8F5EF] flex flex-col items-center border-t border-forest/10">
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
          <div className="relative w-full aspect-[1.85] border-4 border-forest shadow-md overflow-hidden bg-white rounded-md">
            <Image
              src="/images/brand-story-banner-v2.png"
              alt="Root & Harvest Brand Story Infographic"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          5. TESTIMONIALS - Reviews Grid
          ============================================================ */}
      <section className="py-20 bg-white relative overflow-hidden border-t border-forest/5">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12">
          {/* Centered header and star rating */}
          <div className="text-center flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto border-b border-forest/10 pb-10">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-[1px] bg-gold" />
                <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-semibold">Customer Voices</span>
                <span className="w-4 h-[1px] bg-gold" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-forest tracking-tight uppercase">What Our Customers Say</h2>
              <p className="text-sm text-dark/60 max-w-lg mx-auto leading-relaxed font-sans">
                Real feedback from verified buyers. Your reviews help us maintain our commitment to unrefined, wood-pressed purity.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              {/* 5 Stars */}
              <div className="flex items-center gap-1 text-gold pt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-current text-gold" />
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          {loadingReviews ? (
            <div className="text-center py-12 text-sm text-dark/50 font-sans">Loading customer reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-sm text-dark/50 font-sans">No reviews yet. Be the first to share your experience!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <Review
                  key={r.id}
                  author={r.name}
                  rating={r.rating}
                  date={r.createdAt}
                  comment={r.comment}
                  verified={r.isVerified}
                  mediaUrls={r.mediaUrls}
                  mediaTypes={r.mediaTypes}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          5.5 TOP PICKS FOR YOU — In-stock products showcase
          ============================================================ */}
      <section className="py-24 bg-[#F8F5EF] relative overflow-hidden border-t border-forest/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          {/* Section Header */}
          <RevealSection className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Fresh In Stock</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight font-semibold uppercase">
              Top Picks For You
            </h2>
            <p className="text-sm text-dark/60 font-sans">
              Handpicked premium products fresh from our Ghani, currently available in stock.
            </p>
          </RevealSection>

          {/* Products Grid */}
          <RevealSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {INITIAL_PRODUCTS.filter(p => !p.isComingSoon).map((product) => (
              <div 
                key={product.id}
                className="bg-white border border-forest/5 p-6 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] w-full bg-white border border-forest/10 flex items-center justify-center p-4 overflow-hidden">
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                    <span className="text-xs text-dark/50 font-sans ml-1">({product.reviewsCount})</span>
                  </div>
                  <h3 className="text-xl font-serif text-forest font-semibold">{product.name}</h3>
                  <p className="text-xs text-dark/65 font-light leading-relaxed font-sans line-clamp-2">
                    {product.shortDescription}
                  </p>
                  <p className="font-serif text-lg text-forest font-semibold">From ₹{product.sizePrices ? Object.values(product.sizePrices)[0] : "249"}.00</p>
                </div>
                <div className="pt-6">
                  <Link
                    href={`/products/${product.id}`}
                    className="block w-full py-3 bg-forest hover:bg-forest-light text-white text-center text-xs uppercase tracking-widest font-semibold transition-colors"
                  >
                    View Details &amp; Reviews
                  </Link>
                </div>
              </div>
            ))}
          </RevealSection>

        </div>
      </section>

      {/* ============================================================
          6. CTA BANNER — Forest green (not pitch black)
          ============================================================ */}
      <section className="py-24 bg-forest relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(200,161,74,0.12),transparent_65%)] pointer-events-none" />
        <div className="absolute left-0 right-0 top-6 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute left-0 right-0 bottom-6 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <RevealSection className="relative max-w-[860px] mx-auto px-6 text-center space-y-8">
          <div className="flex items-center justify-center gap-3">
            <span className="w-12 h-[1px] bg-gold/40" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Limited Batches</span>
            <span className="w-12 h-[1px] bg-gold/40" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-tight uppercase font-semibold">
            Taste the purity your<br />
            <span className="shimmer-gold">family deserves.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto leading-relaxed font-sans">
            Switch to real, raw, wood-pressed goodness for your kitchen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-forest font-bold uppercase tracking-widest text-sm h-14 px-10 transition-all duration-300 shadow-[0_8px_32px_rgba(200,161,74,0.25)] hover:shadow-[0_12px_40px_rgba(200,161,74,0.4)]"
            >
              Shop Our Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>
        </RevealSection>
      </section>

      <Footer />
    </div>
  );
}
