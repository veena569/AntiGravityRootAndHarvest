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
      title: "Scientific Precision",
      desc: "We bring the analytical rigor of software engineers to agriculture. Every batch is cataloged, chemical-analyzed, and traces back to the specific farmer."
    },
    {
      icon: <Leaf className="w-6 h-6 text-gold" />,
      title: "Generational Agriculture",
      desc: "Our roots are in the soil. We respect traditional Indian farming practices, soil rejuvenation, and slow-pressed oil extraction methods."
    },
    {
      icon: <Shield className="w-6 h-6 text-gold" />,
      title: "Absolute Honesty",
      desc: "No hidden chemicals, refining processes, or synthetic colorizers. What is listed on the bottle is exactly what you put in your family's body."
    }
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-20 md:space-y-32">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">
              OUR HERITAGE
            </span>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-forest font-light">
              Generations of Farming. <span className="italic font-normal text-gold">Engineered to Perfection.</span>
            </h1>
            <p className="text-sm md:text-base text-dark/75 font-light">
              We are two software engineers who traded compile-time checks for soil health audits, bringing transparency back to the Indian pantry.
            </p>
          </div>

          {/* Split Section - The Story of Two Engineers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 relative aspect-[3/4] max-w-md mx-auto w-full shadow-lg border border-forest/5 overflow-hidden">
              <Image
                src="/images/groundnut-oil-farm.jpg"
                alt="Agricultural Soil and Sunlight"
                fill
                className="object-cover animate-pulse"
              />
            </div>
            
            <div className="lg:col-span-6 space-y-6 text-left leading-relaxed text-dark/85 font-light text-base md:text-lg">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold block">THE GENESIS</span>
              <h2 className="text-3xl font-serif text-forest tracking-tight font-semibold">From Code to Crops</h2>
              <p>
                Our founders, Abhinav Patel and Devendra Patel, spent years building scalable software products in Bangalore. But both shared a deeper bond: they were raised by parents who farmed peanuts and mustard in rural Gujarat and Rajasthan.
              </p>
              <p>
                Every visit back home reminded them of the stark contrast between the fresh, fragrant, raw unrefined oils from their parent's stone Ghani and the pale, odor-free, chemically-bleached refined oils available in modern urban supermarkets.
              </p>
              <p className="font-medium text-forest">
                We realized that modern supply chains traded consumer health for shelf-life and high margins. 
              </p>
              <p>
                In 2025, we resigned from our technology positions and set up Root & Harvest. Our goal was simple: to combine generations of agricultural values with software-grade quality audits and deliver pure, honest foods directly to Indian homes.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white border border-forest/5 p-12 text-center space-y-12">
            <div className="space-y-3 max-w-lg mx-auto">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold block">PHILOSOPHY</span>
              <h3 className="text-2xl md:text-3xl font-serif text-forest">Our Core Operating System</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {coreValues.map((val, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center">
                    {val.icon}
                  </div>
                  <h4 className="text-base font-semibold text-forest font-serif">{val.title}</h4>
                  <p className="text-xs md:text-sm text-dark/80 leading-relaxed font-light">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Philosophy Quote Card */}
          <div className="relative py-16 md:py-24 bg-forest text-brand-bg text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-[40vw] h-full bg-gradient-to-l from-gold/10 to-transparent pointer-events-none" />
            <div className="max-w-3xl mx-auto px-6 space-y-6 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">Our Pledge</span>
              <h3 className="text-2xl md:text-4xl font-serif italic font-light leading-snug">
                "We trace every bottle of Groundnut Oil. From soil pH reports of Saurashtra rain-fed peanut farms to the wood pressed speeds of extraction, you will know exactly what is inside."
              </h3>
              <div className="pt-4 space-y-1">
                <span className="text-xs uppercase tracking-widest font-semibold block">Root & Harvest Founders</span>
                <span className="text-[10px] text-brand-bg/60">Farming Sons & Software Architects</span>
              </div>
              <div className="pt-4">
                <Link
                  href="/products/groundnut-oil"
                  className="px-6 py-3 bg-brand-bg text-forest uppercase tracking-widest text-[10px] font-semibold hover:bg-gold hover:text-forest transition-all"
                >
                  Shop Traced Groundnut Oil
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
