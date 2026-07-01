"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Droplet, Sun, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const { products } = useApp();
  const featuredProduct = products.find(p => p.id === "groundnut-oil") || products[0];

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30">
      <Navbar />

      <main className="min-h-screen">
        
        {/* 1. Hero Section */}
        <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Extremely minimal background */}
          <div className="absolute inset-0 bg-brand-bg z-0" />
          
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6 flex flex-col items-center">
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 1, delay: 0.2 }}
              className="text-xs uppercase tracking-[0.4em] text-forest/70 font-semibold mb-6 block"
            >
              Root & Harvest
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif text-forest tracking-tight leading-[1.1] mb-8"
            >
              From Trusted Farms <br className="hidden md:block" />
              <span className="italic font-normal text-gold">To Your Family.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 1, delay: 0.8 }}
              className="text-lg md:text-xl text-dark/70 font-light max-w-2xl leading-relaxed mb-12"
            >
              We combine generations of agricultural values with modern engineering precision to bring transparency and authentic, naturally crafted foods back into every Indian kitchen.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 1, delay: 1.2 }}
            >
              <Link 
                href="/products/groundnut-oil" 
                className="group flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-forest pb-2 border-b border-forest/30 hover:border-forest transition-all"
              >
                Discover Our Harvest
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Hero Image (Abstract/Soft) */}
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute bottom-0 left-0 right-0 h-[30vh] md:h-[40vh] z-0 opacity-40"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent z-10" />
            <Image 
              src="/indian_farm_sunrise_1782932084103.jpg" 
              alt="Indian farm sunrise" 
              fill 
              className="object-cover object-bottom"
              priority
            />
          </motion.div>
        </section>

        {/* 2. Our Story */}
        <section className="py-32 md:py-48 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <FadeIn>
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block mb-6">Our Story</span>
              <h2 className="text-3xl md:text-5xl font-serif text-forest leading-tight mb-8">
                Founded by engineers, <br className="hidden md:block" />raised by farmers.
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-dark/80 font-light leading-relaxed">
                Growing up in agricultural families, we understood the immense care that goes into growing honest food. But as we moved to the city, we realized that the food on our plates had lost its authenticity, obscured by complex supply chains and chemical processing. 
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-lg md:text-xl text-dark/80 font-light leading-relaxed">
                Root & Harvest was born to bridge this gap. We apply engineering precision to traditional wisdom, ensuring that every drop of oil and spoonful of honey is as pure as nature intended—transparently tracked from our trusted farms to your table.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* 3. Our Promise (Minimal Grid) */}
        <section className="py-32 md:py-40 px-6 bg-brand-bg border-y border-forest/10">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-24">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block mb-4">Our Promise</span>
              <h2 className="text-3xl md:text-4xl font-serif text-forest">No compromises. Just honest food.</h2>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 text-center">
              {[
                { icon: Leaf, title: "100% Natural", desc: "No chemicals, no preservatives, no hidden ingredients." },
                { icon: ShieldCheck, title: "Engineered Trust", desc: "Every batch rigorously tested and fully traceable." },
                { icon: Sun, title: "Traditional Methods", desc: "Slow, cold-extraction preserving all native nutrients." }
              ].map((feature, i) => (
                <FadeIn key={i} delay={i * 0.2} className="flex flex-col items-center space-y-6">
                  <div className="w-16 h-16 rounded-full border border-forest/20 flex items-center justify-center text-gold">
                    <feature.icon className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-serif text-forest">{feature.title}</h3>
                  <p className="text-sm text-dark/70 font-light leading-relaxed max-w-[250px]">
                    {feature.desc}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Farm to Family Journey (Large Photography) */}
        <section className="py-32 md:py-48 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <FadeIn className="relative aspect-[4/5] w-full bg-brand-bg">
                <Image 
                  src="/traditional_wood_press_1782932105490.jpg" 
                  alt="Traditional Vagai Wood Press" 
                  fill 
                  className="object-cover"
                />
              </FadeIn>
              
              <div className="space-y-10 lg:pl-12">
                <FadeIn>
                  <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block mb-6">The Journey</span>
                  <h2 className="text-3xl md:text-5xl font-serif text-forest leading-tight mb-8">
                    Crafted with time.
                  </h2>
                  <div className="space-y-6 text-base md:text-lg text-dark/80 font-light leading-relaxed">
                    <p>
                      We don't believe in shortcuts. Our groundnut oil is extracted using the ancient <em>Lakdi Ghani</em> method, a massive wooden mortar and pestle carved from Vagai wood.
                    </p>
                    <p>
                      Operating at a slow 14 revolutions per minute, the process generates almost zero heat. This cold-extraction preserves the fragile antioxidants, vitamins, and the distinctly sweet, nutty aroma of the harvest. 
                    </p>
                    <p>
                      It takes time. It yields less oil. But the quality is undeniable.
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Why Root & Harvest (Typography Focus) */}
        <section className="py-32 md:py-40 bg-forest text-brand-bg text-center px-6 selection:bg-brand-bg/30">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif leading-tight font-light text-white/90">
                "We believe that premium food shouldn't be a luxury—it should be the standard. We are here to restore the dignity of the Indian kitchen."
              </h2>
              <div className="mt-16 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em] text-gold">
                <span>The Founders</span>
                <span className="w-8 h-[1px] bg-gold/50" />
                <span>Root & Harvest</span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 6. Featured Product (Minimalist layout) */}
        <section className="py-32 md:py-48 px-6 bg-brand-bg">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="text-center mb-20">
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block mb-4">The Launch Collection</span>
              <h2 className="text-3xl md:text-4xl font-serif text-forest">Our Signature Harvest</h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeIn className="order-2 md:order-1 space-y-8 md:pr-12 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-serif text-forest">{featuredProduct.name}</h3>
                <p className="text-lg text-dark/70 font-light leading-relaxed">
                  {featuredProduct.tagline}
                </p>
                <div className="pt-8">
                  <Link 
                    href={`/products/${featuredProduct.id}`}
                    className="inline-block px-8 py-4 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </FadeIn>
              
              <FadeIn className="order-1 md:order-2 relative aspect-[3/4] w-full max-w-md mx-auto bg-white shadow-xl">
                <Image 
                  src={featuredProduct.image} 
                  alt={featuredProduct.name} 
                  fill 
                  className="object-cover p-8"
                />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 7. Join Our Journey */}
        <section className="py-32 md:py-40 bg-white border-t border-forest/10 px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-10">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-serif text-forest mb-6">Join the Family.</h2>
              <p className="text-base text-dark/70 font-light leading-relaxed mb-10">
                Subscribe to our journal for stories from the farm, transparency reports, and early access to new harvests.
              </p>
              <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="flex-grow px-6 py-4 border border-forest/20 text-sm focus:outline-none focus:border-gold bg-brand-bg transition-colors"
                  required
                />
                <button 
                  type="submit" 
                  className="px-8 py-4 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </FadeIn>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
