"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Shield, Cpu, Heart } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  const coreValues = [
    {
      icon: <Cpu className="w-6 h-6 text-gold" />,
      title: "Why We Started",
      desc: "Sometimes, a dream begins when life is already comfortable.\n\nWe had our careers, our responsibilities, and a settled life — but somewhere within us was a desire to create something of our own. Something meaningful. Something that could bring us closer to nature and, at the same time, bring better everyday choices to our families.\n\nThat little thought became a dream.\nAnd that dream became Root & Harvest.\n\nA journey from trusted farms to your family — rooted in care, simplicity and trust. 🌱"
    },
    {
      icon: <Leaf className="w-6 h-6 text-gold" />,
      title: "Why Wood-Pressed Oil",
      desc: "Commercial oil is extracted using extreme heat and chemical solvents, stripping all nutrients. Traditional wood pressing (Lakdi Ghani) pestles rotate slowly under 14 RPM, keeping temperatures below 38°C. This natural process preserves every vital vitamin, antioxidant, and nutrient."
    },
    {
      icon: <Shield className="w-6 h-6 text-gold" />,
      title: "Commitment to Quality",
      desc: "We stand for absolute honesty. Our oils are extracted in small batches, gravity-filtered without chemical processing, and packed without preservatives. What you see is 100% pure, unadulterated farm nourishment."
    }
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-20 md:space-y-32">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">
              OUR BELIEF
            </span>
            <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-forest font-light leading-snug">
              Root & Harvest was born from a simple belief — the food we choose for our family should be <span className="italic font-normal text-gold">pure, honest and trustworthy.</span>
            </h1>
            <p className="text-sm md:text-base text-dark/75 font-light max-w-xl mx-auto">
              Combining our engineering mindset with deep-rooted agricultural values to bring pure nourishment back to the Indian pantry.
            </p>
          </div>

          {/* Detailed Story Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 relative aspect-[4/5] max-w-md mx-auto w-full shadow-lg border border-forest/5 overflow-hidden rounded-sm bg-white">
              <Image
                src="/images/family.jpg"
                alt="Root & Harvest founders family standing in agricultural fields under blue sky"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="lg:col-span-6 space-y-8 text-left leading-relaxed text-dark/85 font-light text-base md:text-lg">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold block">OUR STORY</span>
                <h2 className="text-3xl font-serif text-forest tracking-tight font-semibold">The Journey from Code to Crops</h2>
              </div>
              
              <div className="space-y-6 text-sm md:text-base">
                <p>
                  Founded by two software engineers, Root & Harvest is the intersection of analytical precision and generational farming. Having spent years architecting digital products in Hyderabad, we noticed a critical flaw in the modern food supply chain: processing speed was prioritized over nutritional integrity.
                </p>
                
                <h2 className="text-xl md:text-2xl font-serif font-semibold text-forest uppercase tracking-wider pt-2">It Started in Our Own Kitchen</h2>
                <p>
                  For nearly two years, every trip to our hometown meant bringing back something simple but important — <strong>traditionally made oil for our family.</strong>
                </p>
                <p>
                  We trusted where it came from and how it was made. It quietly became part of our everyday life.
                </p>
                <p>
                  Then one day, <strong>we ran out.</strong>
                </p>
                <p>
                  For the next 15 days, we used locally available refined oil. That small change made us notice what we had taken for granted — the difference in taste, aroma, and how our everyday food felt.
                </p>
                <p>
                  As parents, it made us ask a simple question:
                </p>
                <p className="font-serif text-lg italic text-forest border-l-2 border-gold pl-4 py-1">
                  If oil is part of almost every meal we serve our family, shouldn’t we know exactly what goes into it?
                </p>
                <p>
                  That question took us on a journey — searching for quality groundnuts, understanding traditional wood-pressed methods, and becoming more conscious of what truly reaches our kitchen.
                </p>
                <p>
                  And somewhere along the way, our search became a purpose.
                </p>
                <p className="font-semibold text-forest">
                  Root & Harvest was born not because the world needed another bottle of oil, but because families deserve to know what’s inside the one they use every day.
                </p>
                <p>
                  Carefully chosen. Traditionally made. Something we would proudly serve our own family.
                </p>
                <p className="font-semibold text-gold">
                  Because if it belongs in our kitchen, only then does it belong in yours.
                </p>

                <h3 className="text-lg font-serif font-semibold text-forest uppercase tracking-wider pt-2">Why Wood-Pressed Oil</h3>
                <p>
                  Modern refined oils are processed using petroleum-based solvents and high temperatures (up to 200°C), followed by chemical bleaching. Traditional wood-pressing uses a slow-turning wooden pestle that crushes seeds gently. With speeds under 14 RPM, the temperature never rises, ensuring delicate bioactive compounds and natural Vitamin E remain untouched.
                </p>

                <h3 className="text-lg font-serif font-semibold text-forest uppercase tracking-wider pt-2">Our Commitment to Quality</h3>
                <p>
                  Purity is not a slogan; it is our standard. We source raw ingredients directly from trusted farmers, crush them in seasoned wood pestles, and package the oil with zero artificial additives or refining. Every single bottle contains uncompromised farm goodness you can trust.
                </p>
              </div>
            </div>
          </div>

          {/* Values Cards */}
          <div className="bg-white border border-forest/5 p-8 md:p-12 text-center space-y-12 shadow-sm rounded-sm">
            <div className="space-y-3 max-w-lg mx-auto">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold block">PHILOSOPHY</span>
              <h3 className="text-2xl md:text-3xl font-serif text-forest">The Pillars of Root & Harvest</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {coreValues.map((val, idx) => (
                <div key={idx} className="space-y-4 p-6 bg-brand-bg/10 border border-forest/5 rounded-sm hover:border-gold/30 transition-all">
                  <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center text-forest">
                    {val.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-forest font-serif">{val.title}</h4>
                  <p className="text-xs md:text-sm text-dark/75 leading-relaxed font-light whitespace-pre-line">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Philosophy Quote Card */}
          <div className="relative py-16 md:py-24 bg-forest text-brand-bg text-center overflow-hidden rounded-sm">
            <div className="absolute top-0 right-0 w-[40vw] h-full bg-gradient-to-l from-gold/10 to-transparent pointer-events-none" />
            <div className="max-w-3xl mx-auto px-6 space-y-6 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">Our Promise</span>
              <h3 className="text-2xl md:text-4xl font-serif italic font-light leading-snug">
                "We trace every bottle of Groundnut Oil. From soil quality checks to the wood-pressed speeds of extraction, you will know exactly what goes into your kitchen."
              </h3>
              <div className="pt-4 space-y-1">
                <span className="text-xs uppercase tracking-widest font-semibold block">Root & Harvest Founders</span>
                <span className="text-[10px] text-brand-bg/60">Farming Farmers & Software Architects</span>
              </div>
              <div className="pt-6">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-brand-bg text-forest uppercase tracking-widest text-[10px] font-semibold hover:bg-gold hover:text-forest transition-all"
                >
                  Explore Our Collection
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
