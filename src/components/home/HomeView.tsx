"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Truck,
  Factory,
  Sparkles,
  Star,
  Droplet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Review } from "@/components/ui";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useApp } from "@/context/AppContext";
import { GoogleReviewButton } from "@/components/ui/GoogleReviewButton";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`section-reveal ${className}`}>{children}</div>;
}

export function HomeView() {
  const { addToCart, cart } = useApp();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    const inCart = cart.some((item) => item.product.id === product.id);
    if (inCart) {
      router.push("/cart");
      return;
    }
    const defaultSize = product.sizes[0];
    addToCart(product, defaultSize, 1);
  };

  const bestsellerIds = [
    "groundnut-oil",
    "sesame-oil",
    "groundnuts",
    "jaisriram-unpolished-rice",
  ];
  const bestsellers = bestsellerIds
    .map((id) => INITIAL_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as any[];

  const homeFaqs = [
    {
      q: "What is wood pressed (Lakdi Ghani) oil?",
      a: "Wood pressing is an authentic, traditional Indian cold-extraction method. Selected oilseeds are gently crushed inside a wooden mortar (Vagai wood) by a slowly rotating wooden pestle operating below 14 RPM. No high heat, chemicals, or bleaching agents are used, keeping natural nutrients, natural Vitamin E, and authentic aroma intact.",
    },
    {
      q: "Where do you source your groundnuts, sesame seeds, and grains?",
      a: "We source our seeds and heritage grains directly from trusted family farms in Telangana, Andhra Pradesh, and Saurashtra (Gujarat). We maintain direct farmer relationships and inspect raw seeds before cold pressing.",
    },
    {
      q: "Do you deliver all across India?",
      a: "Yes! Root & Harvest delivers pan-India with secure transit packaging. In Hyderabad and nearby areas, we offer priority dispatch and free shipping on eligible orders.",
    },
    {
      q: "How should Root & Harvest wood-pressed oils be stored?",
      a: "Store the bottles in a cool, dry place away from direct sunlight. Because our oils are 100% natural and unrefined without artificial stabilizers, a small amount of natural seed sediment may settle at the bottom — this is the authentic hallmark of pure wood pressing.",
    },
    {
      q: "How can I leave a review for Root & Harvest on Google?",
      a: "You can click any of the 'Review us on Google ❤️' buttons across our website, or search for 'Root & Harvest Hyderabad' on Google Maps to leave a star rating and feedback.",
    },
  ];

  return (
    <div className="flex flex-col w-full selection:bg-gold/20 font-sans bg-brand-bg text-dark overflow-x-hidden font-light">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-[#F8F5EF] overflow-hidden min-h-[70vh] lg:min-h-[80vh] flex items-center border-b border-forest/5">
        <h1 className="sr-only">
          Root &amp; Harvest | Pure Wood Pressed Oils &amp; Traditional Indian Grains
        </h1>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(200,161,74,0.08),transparent_50%)] pointer-events-none" />

        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 md:space-y-8 flex flex-col justify-center text-left">
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
              Wood-pressed oils and wholesome heritage foods, sourced with care from trusted farms to your family table. Made in small batches, just the way nature intended.
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

            <div className="pt-6 border-t border-forest/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] tracking-wider text-forest/60 font-bold uppercase">
              <span className="flex items-center gap-1.5">◆ Wood Pressed</span>
              <span className="flex items-center gap-1.5">◆ Unrefined</span>
              <span className="flex items-center gap-1.5">◆ No Additives</span>
              <span className="flex items-center gap-1.5">◆ Small Batch</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative w-full h-[360px] sm:h-[450px] lg:h-[550px] rounded-sm overflow-hidden shadow-xl border border-forest/5 bg-white">
            <Image
              src="/images/groundnut-oil-farm.jpg"
              alt="Root & Harvest Wood Pressed Oils and Farm Purity"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-[6s] hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/20 via-transparent to-transparent mix-blend-multiply pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="border-b border-forest/10 bg-white py-8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {[
            { icon: <Droplet className="w-5 h-5 text-gold" />, title: "WOOD PRESSED", desc: "Traditional extraction below 14 RPM" },
            { icon: <ShieldCheck className="w-5 h-5 text-gold" />, title: "UNREFINED", desc: "Preserving vital nutrients" },
            { icon: <Leaf className="w-5 h-5 text-gold" />, title: "NO ADDITIVES", desc: "Pure and chemical-free" },
            { icon: <Sparkles className="w-5 h-5 text-gold" />, title: "SMALL BATCH", desc: "Fresh from farm to family" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-[#F8F5EF] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xs font-serif font-bold text-forest uppercase tracking-wider">{item.title}</h3>
                <p className="text-[10px] text-dark/50">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BESTSELLERS SECTION */}
      <section className="py-24 bg-brand-bg relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-forest/10 pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold block mb-2">
                FARM DIRECT
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-forest font-bold uppercase tracking-tight">
                Featured Essentials
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs uppercase tracking-widest text-forest font-semibold hover:text-gold transition-colors flex items-center gap-1.5"
            >
              View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => {
              const defaultSize = product.sizes[0];
              const price = product.sizePrices[defaultSize] || 0;
              const inCart = cart.some((item) => item.product.id === product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white border border-forest/10 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group"
                >
                  <Link href={`/products/${product.id}`} className="block space-y-4">
                    <div className="relative aspect-square w-full bg-[#F8F5EF] overflow-hidden rounded-xs">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">
                        {product.category}
                      </span>
                      <h3 className="text-base font-serif font-bold text-forest group-hover:text-gold transition-colors leading-tight mt-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-dark/60 mt-1 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    </div>
                  </Link>

                  <div className="pt-4 border-t border-forest/10 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-dark/40 uppercase block">Starting from</span>
                      <span className="text-lg font-serif font-bold text-forest">₹{price}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors cursor-pointer ${
                        inCart
                          ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                          : "bg-forest hover:bg-forest-light text-white"
                      }`}
                    >
                      {inCart ? "Go To Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WHY ROOT & HARVEST */}
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
              { icon: <Factory className="w-6 h-6" />, title: "WOOD PRESSED", desc: "Traditional wooden ghani extraction below 14 RPM." },
              { icon: <Leaf className="w-6 h-6" />, title: "NATURAL & UNREFINED", desc: "Minimal processing, preserving native nutrients and colors." },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "NO CHEMICAL REFINING", desc: "Zero solvents, mineral oils, or artificial preservatives." },
              { icon: <Truck className="w-6 h-6" />, title: "FARM TO FAMILY", desc: "Sourced directly from trusted family farms across India." },
              { icon: <Sparkles className="w-6 h-6" />, title: "SMALL BATCH", desc: "Made in limited quantities with attention to freshness." },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white border border-forest/5 p-8 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:border-gold/20 transition-all duration-300 relative group"
              >
                <div className="w-12 h-12 rounded-full bg-[#F8F5EF] flex items-center justify-center text-forest mb-6 group-hover:bg-forest group-hover:text-white transition-colors duration-300">
                  {card.icon}
                </div>
                <h3 className="text-sm font-serif text-forest font-bold tracking-wider uppercase mb-3 leading-tight">
                  {card.title}
                </h3>
                <p className="text-[10px] text-dark/50 leading-relaxed font-sans font-medium">
                  {card.desc}
                </p>
              </div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* 5. BRAND STORY */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-forest/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
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
                  Root & Harvest was founded by software engineers who grew up deeply connected to agriculture. As we built our careers, we noticed that modern daily staples had traded raw nutritional purity for factory processing.
                </p>
                <p>
                  We asked ourselves: <em>if oil is part of almost every meal served to our family, shouldn’t we know exactly how it is made?</em> That pursuit led to Root & Harvest — cold pressing authentic seeds slowly in traditional wooden Ghanis so every drop is pure and nourishing.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center bg-forest hover:bg-forest-light text-white text-xs uppercase tracking-[0.2em] font-bold h-14 px-8 transition-colors"
                >
                  READ OUR STORY
                </Link>
                <GoogleReviewButton variant="outline" size="lg" text="Review us on Google ❤️" />
              </div>
            </RevealSection>

            <RevealSection className="lg:col-span-5 relative aspect-[4/5] w-full rounded-sm overflow-hidden shadow-xl border border-forest/5">
              <Image
                src="/images/family.jpg"
                alt="Root & Harvest Founders Family in Agriculture Field"
                fill
                className="object-cover"
              />
            </RevealSection>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS & GOOGLE REVIEW INTEGRATION */}
      <section className="py-24 bg-[#F8F5EF] relative overflow-hidden border-t border-forest/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12">
          <div className="text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto border-b border-forest/10 pb-10">
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-[1px] bg-gold" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-bold">
                Loved by Families
              </span>
              <span className="w-4 h-[1px] bg-gold" />
            </div>
            <h2 className="text-4xl font-serif text-forest tracking-tight uppercase font-bold">
              Customer Voices
            </h2>
            <p className="text-sm text-dark/60 max-w-lg mx-auto leading-relaxed font-sans">
              Real feedback from verified buyers. Your honest reviews help fellow families choose clean, pure food.
            </p>

            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="flex items-center gap-1 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-current text-gold" />
                ))}
              </div>
              <GoogleReviewButton variant="primary" size="md" text="Review us on Google ❤️" />
            </div>
          </div>

          {loadingReviews ? (
            <div className="text-center py-12 text-sm text-dark/50 font-sans font-medium">
              Loading customer reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-sm text-dark/50 font-sans font-medium space-y-4">
              <p>No website reviews yet. Be the first to share your experience!</p>
              <GoogleReviewButton variant="gold" size="md" text="Review us on Google ❤️" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((r) => (
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

          <div className="text-center pt-6">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-forest font-bold hover:text-gold transition-colors"
            >
              View All Customer Reviews & Submit Feedback <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-forest/10">
        <div className="max-w-[860px] mx-auto px-6 md:px-12 space-y-12 text-left">
          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold block">
              Clear &amp; Transparent
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-forest font-bold uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-dark/60 font-sans">
              Learn more about our wood-pressing methods, sourcing, and delivery.
            </p>
          </div>

          <div className="space-y-4">
            {homeFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-forest/10 bg-brand-bg/20 rounded-xs overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 flex items-center justify-between text-left gap-4 hover:bg-forest/5 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm md:text-base font-serif font-bold text-forest">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gold shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-forest/50 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs md:text-sm text-dark/75 leading-relaxed font-light border-t border-forest/5 bg-white/70">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-forest font-bold hover:text-gold transition-colors"
            >
              Explore Full Help &amp; FAQ Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section className="py-24 bg-forest relative overflow-hidden">
        <div className="max-w-[860px] mx-auto px-6 text-center space-y-8">
          <span className="text-xs tracking-[0.3em] uppercase text-gold font-bold block">
            Direct From Trusted Farms
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-tight uppercase font-bold">
            Taste the purity your<br />
            <span className="italic font-normal text-gold lowercase">family</span> deserves.
          </h2>
          <p className="text-white/70 text-base max-w-md mx-auto leading-relaxed font-sans font-light">
            Bring home authentic wood-pressed oils and heritage grains, thoughtfully crafted for everyday Indian cooking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/products?category=oils"
              className="inline-flex items-center justify-center bg-gold hover:bg-gold-light text-forest font-bold uppercase tracking-[0.2em] text-xs h-14 px-10 transition-colors shadow-lg"
            >
              SHOP WOOD PRESSED OILS
            </Link>
            <GoogleReviewButton variant="outline" size="lg" text="Review us on Google ❤️" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
