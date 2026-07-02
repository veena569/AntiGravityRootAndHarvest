import React from "react";
import Link from "next/link";
import { BrandBottle } from "@/components/ui/BrandBottle";
import { ArrowRight, Leaf, ShieldCheck, Truck, CheckCircle2, Factory, Heart, Microscope } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { INITIAL_PRODUCTS } from "@/data/products";

export default function HomePage() {
  const products = INITIAL_PRODUCTS;
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col w-full selection:bg-gold/20 font-sans font-light bg-brand-bg text-dark overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row items-center max-w-7xl mx-auto px-6 md:px-12 pt-12 lg:pt-0">
        
        {/* Left: Copy */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8 z-10 py-12 lg:py-0">
          <div className="space-y-4">
            <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold flex items-center gap-4">
              <span className="w-8 h-[1px] bg-gold"></span>
              Premium Farm Heritage
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-forest leading-[1.1] tracking-tight">
              Return to Purity. <br/>
              <span className="italic text-forest/80">Rooted in Trust.</span>
            </h1>
          </div>
          
          <p className="text-lg text-dark/70 max-w-md leading-relaxed">
            Every bottle begins with carefully selected farms and traditional wood pressing, bringing pure nourishment from our family to yours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/products"
              className="px-8 py-4 bg-forest text-white text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 group shadow-lg shadow-forest/20"
            >
              Shop Groundnut Oil
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#our-story"
              className="px-8 py-4 bg-transparent border border-forest/20 text-forest text-xs uppercase tracking-widest font-semibold hover:border-forest hover:bg-forest/5 transition-all flex items-center justify-center text-center"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Right: The Amber Bottle */}
        <div className="w-full lg:w-1/2 h-[500px] lg:h-screen relative flex items-center justify-center">
          {/* Subtle background glow/circle */}
          <div className="absolute w-[80%] h-[80%] bg-gold/5 rounded-full blur-3xl"></div>
          
          {/* The Hero Bottle */}
          <div className="relative w-full h-[120%] lg:scale-[1.2] lg:translate-x-12">
             <BrandBottle className="w-full h-full" />
          </div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="border-y border-forest/10 bg-white/50 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-xs uppercase tracking-widest text-forest font-semibold">
            <span className="flex items-center gap-2"><Leaf className="w-4 h-4 text-gold" /> 100% Natural</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gold" /> No Preservatives</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gold" /> Secure Payments</span>
            <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-gold" /> Fast Delivery</span>
            <span className="flex items-center gap-2"><Factory className="w-4 h-4 text-gold" /> Made in India</span>
            <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-gold" /> Family Trusted</span>
          </div>
        </div>
      </section>

      {/* 3. OUR STORY */}
      <section id="our-story" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2 space-y-8">
            <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Our Heritage</span>
            <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight">Why We Started <br/>Root & Harvest</h2>
            
            <div className="space-y-6 text-dark/70 text-lg leading-relaxed">
              <p>
                Root & Harvest was founded by two software engineers who grew up deeply connected to farming. 
              </p>
              <p>
                As we built our careers in technology, we realized how disconnected modern food production had become from nature. We believe every family deserves food they can implicitly trust.
              </p>
              <p className="font-serif text-xl italic text-forest">
                That belief became Root & Harvest.
              </p>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-forest/5">
            <div className="relative pl-8 border-l border-forest/10 space-y-12 py-4">
              
              <div className="relative">
                <div className="absolute w-3 h-3 bg-gold rounded-full -left-[38.5px] top-1.5 shadow-[0_0_0_4px_rgba(200,161,74,0.2)]"></div>
                <h4 className="text-lg font-serif text-forest font-medium">Roots</h4>
                <p className="text-sm text-dark/60 mt-1">Deeply connected to agricultural heritage.</p>
              </div>

              <div className="relative">
                <div className="absolute w-3 h-3 bg-forest rounded-full -left-[38.5px] top-1.5 shadow-[0_0_0_4px_rgba(30,61,43,0.1)]"></div>
                <h4 className="text-lg font-serif text-forest font-medium">Traditional Farming</h4>
                <p className="text-sm text-dark/60 mt-1">Partnering directly with local farmers.</p>
              </div>

              <div className="relative">
                <div className="absolute w-3 h-3 bg-forest rounded-full -left-[38.5px] top-1.5 shadow-[0_0_0_4px_rgba(30,61,43,0.1)]"></div>
                <h4 className="text-lg font-serif text-forest font-medium">Engineering Precision</h4>
                <p className="text-sm text-dark/60 mt-1">Applying meticulous standards to natural extraction.</p>
              </div>

              <div className="relative">
                <div className="absolute w-3 h-3 bg-forest rounded-full -left-[38.5px] top-1.5 shadow-[0_0_0_4px_rgba(30,61,43,0.1)]"></div>
                <h4 className="text-lg font-serif text-forest font-medium">Uncompromising Quality</h4>
                <p className="text-sm text-dark/60 mt-1">Rigorous testing ensuring absolute purity.</p>
              </div>

              <div className="relative">
                <div className="absolute w-4 h-4 bg-forest rounded-full -left-[40.5px] top-1 flex items-center justify-center shadow-[0_0_0_6px_rgba(30,61,43,0.15)]">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <h4 className="text-lg font-serif text-forest font-medium">Your Family</h4>
                <p className="text-sm text-dark/60 mt-1">Delivering nourishment you can trust.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="py-24 lg:py-32 bg-forest text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Our Promise</span>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-bg tracking-tight">The Root & Harvest Difference</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Factory />, title: "Freshly Wood Pressed", desc: "Extracted at low temperatures using traditional wooden ghani." },
              { icon: <Leaf />, title: "No Chemicals", desc: "Absolutely no solvents, preservatives, or artificial additives." },
              { icon: <CheckCircle2 />, title: "Small Batch Production", desc: "Made in limited quantities to ensure maximum freshness." },
              { icon: <Microscope />, title: "Lab Tested Quality", desc: "Rigorously tested for purity, nutrition, and safety." },
              { icon: <Truck />, title: "Direct From Farmers", desc: "Sourced directly from trusted family farms across India." },
              { icon: <Heart />, title: "Made For Families", desc: "Crafted with the same care we demand for our own children." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-forest-light/30 border border-white/5 p-8 rounded-2xl hover:bg-forest-light/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-brand-bg/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-serif mb-3 text-brand-bg">{feature.title}</h3>
                <p className="text-sm text-brand-bg/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COLLECTIONS / PRODUCTS */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Curated Selection</span>
              <h2 className="text-4xl md:text-5xl font-serif text-forest tracking-tight">Premium Essentials</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold uppercase tracking-widest text-forest hover:text-gold transition-colors flex items-center gap-2 luxury-underline">
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                name={product.name}
                tagline={product.tagline}
                image={product.image}
                price={Object.values(product.sizePrices)[0]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 lg:py-32 bg-brand-bg border-t border-forest/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="space-y-4 mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Family Trusted</span>
            <h2 className="text-4xl font-serif text-forest tracking-tight">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "The purity of the groundnut oil is unmatched. It reminds me of the oil we used to get directly from the village press when I was a child.", author: "Meera R.", location: "Bangalore" },
              { quote: "Finally, a brand that doesn't just market purity but actually delivers it. You can taste the difference in every meal cooked.", author: "Arjun S.", location: "Mumbai" },
              { quote: "Their commitment to transparency and quality is why I trust Root & Harvest for my family's everyday cooking needs.", author: "Priya M.", location: "Delhi" }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-10 rounded-2xl shadow-sm border border-forest/5 flex flex-col justify-between">
                <div className="mb-8">
                  <div className="flex justify-center gap-1 mb-6 text-gold">
                    {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                  </div>
                  <p className="text-dark/80 italic font-serif text-lg leading-relaxed">"{testimonial.quote}"</p>
                </div>
                <div>
                  <p className="font-semibold text-forest uppercase tracking-widest text-xs">{testimonial.author}</p>
                  <p className="text-xs text-dark/40 mt-1">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
