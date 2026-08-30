"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, ShieldCheck, Truck, CheckCircle2, Factory, Heart, Microscope, Star, Users, X, Lock, Droplet, Sparkles } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { BrandBottle } from "@/components/ui/BrandBottle";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Review } from "@/components/ui";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useApp } from "@/context/AppContext";

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
  const { wishlist, addToCart, toggleWishlist } = useApp();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

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

  const handleAddToCart = (product: any) => {
    const defaultSize = product.sizes[0];
    addToCart(product, defaultSize, 1);
    setAddedProduct(`${product.id}-${defaultSize}`);
    setTimeout(() => setAddedProduct(null), 2000);
  };

  const bestsellerIds = ["groundnut-oil", "sesame-oil", "groundnuts", "jaisriram-unpolished-rice"];
  const bestsellers = bestsellerIds.map(id => INITIAL_PRODUCTS.find(p => p.id === id)).filter(Boolean) as any[];

  return (
    <div className="flex flex-col w-full selection:bg-gold/20 font-sans bg-brand-bg text-dark overflow-x-hidden font-light">
      <Navbar />

      {/* ============================================================
          1. HERO SECTION (New Split Layout)
          ============================================================ */}
      <section className="relative w-full bg-[#F8F5EF] overflow-hidden min-h-[70vh] lg:min-h-[80vh] flex items-center border-b border-forest/5">
        <h1 className="sr-only">Root &amp; Harvest | Wood Pressed Oils &amp; Traditional Foods</h1>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(200,161,74,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 flex flex-col justify-center text-left animate-fade-in-up">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold font-bold">
                Wood Pressed Goodness
              </span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-forest tracking-tight leading-[1.08] font-bold uppercase">
              Pure by Nature.<br />
              <span className="italic font-normal lowercase">pressed with</span> Tradition.
            </h2>
            
            <p className="text-dark/65 text-base sm:text-lg max-w-xl leading-relaxed font-sans font-light">
              Wood-pressed oils and wholesome foods, sourced with care from trusted farms to your family table. Made in small batches, just the way nature intended.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/products?category=oils"
                className="inline-flex items-center justify-center bg-forest hover:bg-forest-light text-white text-xs uppercase tracking-[0.2em] font-bold h-14 px-8 transition-colors shadow-md"
              >
                SHOP WOOD PRESSED OILS
              </Link>
              <Link
                href="/products?category=grains"
                className="inline-flex items-center justify-center bg-transparent border border-forest/20 hover:border-forest text-forest text-xs uppercase tracking-[0.2em] font-bold h-14 px-8 transition-colors"
              >
                EXPLORE TRADITIONAL GRAINS
              </Link>
            </div>
            
            {/* Trust Badges Bar */}
            <div className="pt-6 border-t border-forest/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] tracking-wider text-forest/60 font-bold uppercase">
              <span className="flex items-center gap-1.5">◆ Wood Pressed</span>
              <span className="flex items-center gap-1.5">◆ Unrefined</span>
              <span className="flex items-center gap-1.5">◆ No Additives</span>
              <span className="flex items-center gap-1.5">◆ Small Batch</span>
            </div>
          </div>
          
          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 relative w-full h-[360px] sm:h-[450px] lg:h-[550px] rounded-sm overflow-hidden shadow-xl border border-forest/5 bg-white">
            <Image
              src="/images/groundnut-oil-farm.jpg"
              alt="Root & Harvest Farm Purity"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-[6s] hover:scale-103"
            />
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-forest/20 via-transparent to-transparent mix-blend-multiply pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ============================================================
          2. TRUST STRIP
          ============================================================ */}
      <section className="border-b border-forest/10 bg-white py-8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {[
            { icon: <Droplet className="w-5 h-5 text-gold"/>, title: "WOOD PRESSED", desc: "Traditional extraction" },
            { icon: <ShieldCheck className="w-5 h-5 text-gold"/>, title: "UNREFINED", desc: "Nothing unnecessary" },
            { icon: <Leaf className="w-5 h-5 text-gold"/>, title: "NO ADDITIVES", desc: "Pure and honest" },
            { icon: <Sparkles className="w-5 h-5 text-gold"/>, title: "SMALL BATCH", desc: "Made with care" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 text-left w-full max-w-[220px]">
              <div className="w-10 h-10 rounded-full bg-[#F8F5EF] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.2em] font-bold text-forest uppercase leading-none">{item.title}</span>
                <span className="text-[10px] text-dark/50 mt-1.5 font-sans font-medium">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          3. SHOP OUR BESTSELLERS
          ============================================================ */}
      <section className="py-24 bg-[#F8F5EF] relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          <RevealSection className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold">Good Food Starts with Good Ingredients</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight font-bold uppercase leading-tight">
              Our Bestsellers
            </h2>
            <p className="text-sm text-dark/60 font-sans max-w-md mx-auto">
              Traditional foods, thoughtfully sourced and slowly crafted for your everyday kitchen.
            </p>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestsellers.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border border-forest/5 p-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Wishlist Button */}
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 border border-forest/5 text-forest hover:text-gold transition-colors shadow-sm cursor-pointer"
                  title={wishlist.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-gold text-gold" : "text-forest"}`} />
                </button>

                {/* Product Image Link */}
                <Link href={`/products/${product.id}`} className="relative aspect-[3/4] w-full bg-brand-bg/20 flex items-center justify-center p-4 overflow-hidden border border-forest/5 mb-6">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-4 group-hover:scale-102 transition-transform duration-500" 
                  />
                </Link>

                {/* Card Info */}
                <div className="space-y-2 flex-grow flex flex-col">
                  {/* Reviews rating */}
                  <div className="flex items-center gap-1 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-[10px] text-dark/50 font-sans ml-1 font-semibold">({product.reviewsCount})</span>
                  </div>
                  
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-lg font-serif text-forest font-bold tracking-wide uppercase group-hover:text-gold transition-colors leading-tight">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-[11px] text-dark/65 font-sans leading-relaxed line-clamp-2">
                    {product.shortDescription}
                  </p>

                  <p className="font-serif text-base text-forest font-bold mt-auto pt-4">
                    From ₹{product.sizePrices[product.sizes[0]]}.00
                  </p>
                </div>

                {/* CTA Action */}
                <div className="pt-4 mt-auto border-t border-forest/5">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-3 bg-forest hover:bg-forest-light text-white text-center text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
                  >
                    {addedProduct === `${product.id}-${product.sizes[0]}` ? "Added! ✓" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </RevealSection>

          <div className="text-center mt-16">
            <Link 
              href="/products" 
              className="inline-flex items-center justify-center bg-transparent border border-forest hover:bg-forest hover:text-white text-forest text-[11px] uppercase tracking-[0.2em] font-bold h-14 px-10 transition-colors"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. WOOD PRESSED OILS SECTION
          ============================================================ */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-forest/5">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          <RevealSection className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold">Traditional Ghani Extraction</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight font-bold uppercase leading-tight">
              The Goodness of<br />Wood Pressed Oils
            </h2>
            <p className="text-sm text-dark/60 leading-relaxed font-sans max-w-lg mx-auto">
              Slowly pressed using traditional methods to preserve the natural character of the seeds — without chemical refining or unnecessary additives.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              {
                id: "groundnut-oil",
                name: "Wood Pressed Groundnut Oil",
                desc: "100% natural, single-source bold groundnuts slowly wood-pressed. Perfect for everyday Indian deep frying.",
                price: "₹225.00",
                benefits: [
                  "Rich in heart-healthy MUFA",
                  "Naturally loaded with Vitamin E",
                  "High smoke point (~232°C)",
                  "Zero chemical trans fats"
                ]
              },
              {
                id: "sesame-oil",
                name: "Wood Pressed Sesame Oil",
                desc: "Slow-pressed rich sesame oil, unrefined, zero preservatives. Highly aromatic and ideal for nourishing health.",
                price: "₹319.00",
                benefits: [
                  "Rich in sesamol and sesamolin",
                  "Ancient Indian superfood oil",
                  "Ideal for daily oil pulling",
                  "100% unrefined & preservative-free"
                ]
              }
            ].map((oil) => {
              const prod = INITIAL_PRODUCTS.find(p => p.id === oil.id)!;
              return (
                <RevealSection key={oil.id} className="bg-[#F8F5EF] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center border border-forest/5 shadow-sm group">
                  {/* Left: Product Image */}
                  <div className="w-full md:w-1/2 aspect-[3/4] relative bg-white border border-forest/10 p-4 shrink-0 overflow-hidden">
                    <Image 
                      src={prod.image} 
                      alt={oil.name} 
                      fill 
                      className="object-contain p-4 group-hover:scale-102 transition-transform duration-500" 
                    />
                  </div>
                  
                  {/* Right: Info */}
                  <div className="flex flex-col justify-between h-full space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-serif text-forest font-bold uppercase tracking-wide leading-tight">{oil.name}</h3>
                      <p className="text-xs text-dark/65 font-sans leading-relaxed">{oil.desc}</p>
                      
                      {/* Benefits Checkmarks */}
                      <ul className="space-y-2 pt-2">
                        {oil.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-[10px] text-forest font-bold tracking-wide uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-4 border-t border-forest/10">
                      <div>
                        <span className="text-[10px] text-dark/40 uppercase tracking-widest font-semibold block">Starts From</span>
                        <span className="text-xl font-serif text-forest font-bold">{oil.price}</span>
                      </div>
                      <Link 
                        href={`/products/${oil.id}`} 
                        className="inline-flex items-center justify-center bg-forest hover:bg-forest-light text-white text-[10px] uppercase tracking-widest font-bold h-11 px-6 transition-colors"
                      >
                        VIEW DETAILS
                      </Link>
                    </div>
                  </div>
                </RevealSection>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/products?category=oils" 
              className="inline-flex items-center justify-center bg-transparent border border-forest hover:bg-forest hover:text-white text-forest text-[11px] uppercase tracking-[0.2em] font-bold h-14 px-10 transition-colors"
            >
              SHOP ALL OILS
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. WHY ROOT & HARVEST
          ============================================================ */}
      <section className="py-24 bg-[#F8F5EF] relative overflow-hidden border-t border-forest/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          <RevealSection className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold">Uncompromised Purity</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight font-bold uppercase leading-tight">
              Why Root &amp; Harvest?
            </h2>
            <p className="text-sm text-dark/60 font-sans max-w-md mx-auto">
              Our core principles guide every single batch we extract, bottle, and deliver.
            </p>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: <Factory className="w-6 h-6" />,
                title: "WOOD PRESSED",
                desc: "Traditional wooden ghani extraction below 14 RPM."
              },
              {
                icon: <Leaf className="w-6 h-6" />,
                title: "NATURAL & UNREFINED",
                desc: "Minimal processing, preserving native nutrients and colors."
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "NO CHEMICAL REFINING",
                desc: "Zero solvents, mineral oils, or artificial preservatives."
              },
              {
                icon: <Truck className="w-6 h-6" />,
                title: "FARM TO FAMILY",
                desc: "Sourced directly from trusted family farms across India."
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "SMALL BATCH",
                desc: "Made in limited quantities with attention to freshness."
              }
            ].map((card, idx) => (
              <div 
                key={idx}
                className="bg-white border border-forest/5 p-8 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:border-gold/20 transition-all duration-300 relative group"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <div className="w-12 h-12 rounded-full bg-[#F8F5EF] flex items-center justify-center text-forest mb-6 group-hover:bg-forest group-hover:text-white transition-colors duration-300">
                  {card.icon}
                </div>
                <h3 className="text-sm font-serif text-forest font-bold tracking-wider uppercase mb-3 leading-tight">{card.title}</h3>
                <p className="text-[10px] text-dark/50 leading-relaxed font-sans font-medium">{card.desc}</p>
              </div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ============================================================
          6. OUR STORY
          ============================================================ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Column: Story content */}
            <RevealSection className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-[1px] bg-gold" />
                  <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold">Our Heritage</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight leading-tight font-bold uppercase">
                  FROM OUR ROOTS<br /><span className="italic font-normal lowercase">to your</span> TABLE
                </h2>
              </div>
              <div className="space-y-5 text-dark/65 text-base leading-relaxed font-sans font-light">
                <p>
                  Root & Harvest was founded by two software engineers who grew up deeply connected to farming. As we built our careers in technology, we saw how disconnected modern, daily food had become from nature.
                </p>
                <p>
                  We watched our families compromise on basic staples without even realizing it — trading raw, unrefined purity for factory-processed convenience. We decided to fix that and reconnect families with trustworthy food.
                </p>
                <blockquote className="font-serif text-xl italic text-forest border-l-2 border-gold pl-4 font-normal py-1">
                  "Every family deserves food they can implicitly trust, crafted with the same integrity we demand for our own kitchens."
                </blockquote>
              </div>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center bg-forest hover:bg-forest-light text-white text-xs uppercase tracking-[0.2em] font-bold h-14 px-8 transition-colors"
                >
                  READ OUR STORY
                </Link>
              </div>
            </RevealSection>

            {/* Right Column: Family visual */}
            <RevealSection className="lg:col-span-5 relative aspect-[4/5] w-full rounded-sm overflow-hidden shadow-xl border border-forest/5">
              <Image 
                src="/images/family.jpg" 
                alt="Root & Harvest Founders Farm" 
                fill 
                className="object-cover transition-transform duration-500 hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/10 to-transparent pointer-events-none" />
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. FARM TO FAMILY JOURNEY
          ============================================================ */}
      <section className="py-24 bg-[#F8F5EF] relative overflow-hidden border-t border-forest/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 text-center">
          
          <RevealSection className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold">The Purity Pipeline</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight font-bold uppercase leading-tight">
              Farm to Family Journey
            </h2>
            <p className="text-sm text-dark/60 font-sans max-w-md mx-auto">
              How we harvest, press, filter, and deliver uncompromised goodness directly to your home.
            </p>
          </RevealSection>

          <RevealSection className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6 items-start">
            {/* Desktop Timeline connector */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-[1px] bg-forest/10 z-0" />

            {[
              { num: "01", step: "FARM", title: "Sustainable Sourcing", desc: "Premium seeds grown on trusted, chemical-free family farms." },
              { num: "02", step: "CAREFUL SOURCING", title: "Hand Selection", desc: "Sun-drying and manually sorting seeds for absolute quality." },
              { num: "03", step: "TRADITIONAL PROCESS", title: "Wooden Ghani Press", desc: "Slow pressing under 14 RPM in Vagai wood to protect nutrients." },
              { num: "04", step: "QUALITY CHECK", title: "Natural Filtering", desc: "Sediment filtered through gravity and certified for pristine purity." },
              { num: "05", step: "YOUR FAMILY", title: "Direct Delivery", desc: "Fresh small batches shipped directly to your door, traceably." }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center space-y-4 lg:space-y-6 group">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-forest/10 flex items-center justify-center font-serif text-sm font-bold text-forest group-hover:border-gold group-hover:bg-forest group-hover:text-white transition-all duration-300 shadow-sm">
                  {item.num}
                </div>
                
                <div className="space-y-2 max-w-[200px] text-center">
                  <span className="text-[10px] tracking-[0.25em] font-bold text-gold uppercase block leading-none">{item.step}</span>
                  <h4 className="text-base font-serif font-bold text-forest uppercase leading-tight">{item.title}</h4>
                  <p className="text-[10px] text-dark/50 leading-relaxed font-sans font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ============================================================
          8. OUR PROMISE (Brand Infographic)
          ============================================================ */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-forest/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          
          <RevealSection className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold">Our Pledge</span>
              <span className="w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight font-bold uppercase leading-tight">
              Our Promise
            </h2>
            <p className="text-sm text-dark/60 font-sans max-w-md mx-auto">
              Our extraction, quality checks, and delivery methods are transparent and lab-certified.
            </p>
          </RevealSection>

          <RevealSection className="w-full flex flex-col items-center">
            <div className="relative w-full aspect-[1.85] border-4 border-forest shadow-md overflow-hidden bg-white rounded-md max-w-[1100px]">
              <Image
                src="/images/brand-story-banner-v2.png"
                alt="Root & Harvest Brand Story Infographic"
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1100px"
              />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ============================================================
          9. CUSTOMER REVIEWS ("LOVED BY FAMILIES")
          ============================================================ */}
      <section className="py-24 bg-[#F8F5EF] relative overflow-hidden border-t border-forest/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12">
          
          <div className="text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto border-b border-forest/10 pb-10">
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-[1px] bg-gold" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-bold">Loved by Families</span>
              <span className="w-4 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl font-serif text-forest tracking-tight uppercase font-bold">Customer Voices</h2>
            <p className="text-sm text-dark/60 max-w-lg mx-auto leading-relaxed font-sans">
              Real feedback from verified buyers. Your reviews help us maintain our commitment to unrefined, wood-pressed purity.
            </p>
            
            <div className="flex items-center gap-1 text-gold pt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-current text-gold" />
              ))}
            </div>
          </div>

          {loadingReviews ? (
            <div className="text-center py-12 text-sm text-dark/50 font-sans font-medium">Loading customer reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-sm text-dark/50 font-sans font-medium">No reviews yet. Be the first to share your experience!</div>
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
          10. FINAL CTA BANNER
          ============================================================ */}
      <section className="py-28 bg-forest relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(200,161,74,0.12),transparent_65%)] pointer-events-none" />
        <div className="absolute left-0 right-0 top-6 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute left-0 right-0 bottom-6 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <RevealSection className="relative max-w-[860px] mx-auto px-6 text-center space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-[1px] bg-gold/40" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold">Limited Batches</span>
            <div className="w-12 h-[1px] bg-gold/40" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-tight uppercase font-bold">
            Taste the purity your<br />
            <span className="shimmer-gold">family deserves.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto leading-relaxed font-sans font-light">
            Bring home traditional goodness, thoughtfully made for everyday cooking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/products?category=oils"
              className="inline-flex items-center justify-center bg-gold hover:bg-gold-light text-forest font-bold uppercase tracking-[0.2em] text-xs h-14 px-10 transition-colors shadow-lg"
            >
              SHOP WOOD PRESSED OILS
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-transparent border border-white/20 hover:border-white text-white font-bold uppercase tracking-[0.2em] text-xs h-14 px-10 transition-colors"
            >
              EXPLORE ALL PRODUCTS
            </Link>
          </div>
        </RevealSection>
      </section>

      <Footer />
    </div>
  );
}
