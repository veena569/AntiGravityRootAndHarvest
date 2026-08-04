"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, ShieldCheck, Truck, CheckCircle2, Factory, Heart, Microscope, Star, Users, X } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { BrandBottle } from "@/components/ui/BrandBottle";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Review } from "@/components/ui";

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
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMediaUrl(data.mediaUrl);
        setMediaType(data.mediaType);
      } else {
        setErrorMsg(data.error || "Failed to upload file.");
      }
    } catch (err) {
      console.error("[FILE_UPLOAD_FAILED]", err);
      setErrorMsg("Failed to upload file due to network error.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl("");
    setMediaType("");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, mediaUrl, mediaType }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Thank you! Your review has been submitted and published successfully.");
        setComment("");
        setRating(5);
        setMediaUrl("");
        setMediaType("");
        // Refresh reviews
        const updatedRes = await fetch("/api/reviews");
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setReviews(updatedData.reviews || []);
        }
        setTimeout(() => {
          setShowReviewModal(false);
          setSuccessMsg("");
        }, 3000);
      } else {
        setErrorMsg(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("[SUBMIT_REVIEW_FAILED]", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full selection:bg-gold/20 font-sans bg-brand-bg text-dark overflow-x-hidden font-light">
      <Navbar />

      {/* ============================================================
          1. HERO — Warm cream split layout (not dark)
          ============================================================ */}
      <section className="relative w-full min-h-[92vh] flex items-center overflow-hidden bg-[#F2EDE4]">

        {/* Warm grain texture overlay */}
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")"}} />

        {/* Forest green left accent strip */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-forest/0 via-forest to-forest/0" />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 py-16 lg:py-0 min-h-[92vh]">

          {/* Left copy block */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8 lg:pr-12">

            {/* Eyebrow */}
            <div className="animate-fade-in-up flex items-center gap-3">
              <span className="w-8 h-[1px] bg-gold" />
              <span className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">
                Premium Farm Heritage
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up animation-delay-100 font-serif text-forest leading-[1.1] tracking-tight">
              <span className="block text-5xl md:text-6xl xl:text-7xl font-bold">Return to</span>
              <span className="block text-5xl md:text-6xl xl:text-7xl shimmer-gold font-bold mt-1">Purity.</span>
              <span className="block text-3xl md:text-4xl xl:text-5xl text-forest/50 font-light italic mt-3">Rooted in Trust.</span>
            </h1>

            {/* Body */}
            <p className="animate-fade-in-up animation-delay-200 text-lg text-dark/60 max-w-[440px] leading-relaxed font-light">
              Every bottle begins with carefully selected seeds and traditional wood pressing — bringing pure nourishment from our family to yours.
            </p>

            {/* Trust pills */}
            <div className="animate-fade-in-up animation-delay-300 flex flex-wrap gap-2">
              {["100% Natural", "No Chemicals", "Cold Pressed"].map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-xs tracking-widest uppercase font-semibold text-forest border border-forest/20 rounded-full bg-forest/5">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="animate-fade-in-up animation-delay-400 flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 bg-forest hover:bg-forest-light text-white font-bold uppercase tracking-widest text-sm h-14 px-8 transition-all duration-300 shadow-[0_8px_32px_rgba(30,61,43,0.25)] hover:shadow-[0_12px_40px_rgba(30,61,43,0.4)]"
              >
                Shop Our Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#our-story"
                className="inline-flex items-center justify-center gap-2 text-forest hover:text-forest-light border border-forest/30 hover:border-forest font-medium uppercase tracking-widest text-sm h-14 px-8 transition-all duration-300"
              >
                Our Story
              </Link>
            </div>

            {/* Spacing alignment placeholder */}
            <div className="pt-2" />
          </div>

          {/* Right: Bottle image */}
          <div className="w-full lg:w-1/2 flex items-center justify-center relative">
            {/* Decorative soft rings */}
            <div className="absolute w-[360px] h-[360px] md:w-[460px] md:h-[460px] rounded-full border border-forest/10 animate-float-slow" />
            <div className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full border border-gold/15" />
            {/* Soft background glow */}
            <div className="absolute w-[300px] h-[300px] rounded-full bg-gold/8 blur-3xl" />

            {/* Bottle container */}
            <div className="relative z-10 w-[240px] h-[380px] md:w-[300px] md:h-[460px] animate-float">
              <BrandBottle className="w-full h-full" />
            </div>

            {/* Floating accent: natural badge */}
            <div className="absolute top-[8%] right-[8%] animate-float animation-delay-200 z-20">
              <div className="w-16 h-16 rounded-full bg-forest/8 border border-forest/20 flex flex-col items-center justify-center backdrop-blur-sm p-2">
                <Leaf className="w-5 h-5 text-forest mb-0.5" />
                <span className="text-forest text-[8px] font-bold tracking-wider text-center leading-none">100%<br/>NATURAL</span>
              </div>
            </div>

            {/* Floating accent: wood pressed */}
            <div className="absolute bottom-[18%] right-[2%] animate-float animation-delay-400 z-20">
              <div className="bg-white border border-forest/10 px-3 py-2 shadow-md">
                <p className="text-forest text-xs font-bold tracking-wider uppercase">Wood Pressed</p>
                <p className="text-gold text-[10px] tracking-widest mt-0.5">Traditional Ghani</p>
              </div>
            </div>

            {/* Floating accent: cold pressed */}
            <div className="absolute top-[30%] left-[2%] animate-float animation-delay-300 z-20">
              <div className="bg-white border border-forest/10 px-3 py-2 shadow-md">
                <p className="text-forest text-xs font-bold tracking-wider uppercase">Cold Pressed</p>
                <p className="text-gold text-[10px] tracking-widest mt-0.5">Below 38°C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none" />
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

            {/* Right: Timeline */}
            <RevealSection className="relative pl-8">
              <div className="absolute left-0 top-4 bottom-4 w-[1px] bg-gradient-to-b from-gold via-forest/30 to-transparent" />
              <div className="space-y-10">
                {[
                  { dot: "bg-gold", title: "Roots", sub: "Deeply connected to agricultural heritage and traditional Indian farming methods." },
                  { dot: "bg-forest", title: "Partnership", sub: "Partnering directly with farmers across Andhra Pradesh and Telangana to bring pure ingredients to your family." },
                  { dot: "bg-forest", title: "Precision", sub: "Engineering standards applied to natural cold-press extraction under 14 RPM." },
                  { dot: "bg-forest", title: "Purity", sub: "Additive-free, exactly as nature intended. Nothing added." },
                  { dot: "bg-forest", title: "Your Family", sub: "Delivering trust in a bottle — from our trusted farms to your kitchen." },
                ].map((step, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    <div className={`absolute w-3 h-3 ${step.dot} rounded-full -left-[6px] top-1.5 border-2 border-white shadow-sm group-hover:scale-125 transition-transform`} />
                    <h3 className="text-sm font-serif text-forest font-semibold uppercase tracking-widest">{step.title}</h3>
                    <p className="text-sm text-dark/55 mt-1 leading-relaxed">{step.sub}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. TESTIMONIALS - Reviews Grid and Write Review
          ============================================================ */}
      <section className="py-20 bg-[#F8F5EF] relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12">
          {/* Centered header, write button, and star rating */}
          <div className="text-center flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto border-b border-forest/10 pb-10">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-[1px] bg-gold" />
                <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-semibold">Customer Voices</span>
                <span className="w-4 h-[1px] bg-gold" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-forest tracking-tight">What Our Customers Say</h2>
              <p className="text-sm text-dark/60 max-w-lg mx-auto leading-relaxed font-sans">
                Real feedback from verified buyers. Your reviews help us maintain our commitment to unrefined, wood-pressed purity.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-10 py-4 bg-forest hover:bg-forest-light text-white uppercase tracking-widest text-xs font-semibold transition-all duration-300 shadow-md"
              >
                Write a Review
              </button>
              
              {/* 5 Stars below the button */}
              <div className="flex items-center gap-1 text-gold pt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-current text-gold" />
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          {loadingReviews ? (
            <div className="text-center py-12 text-sm text-dark/50">Loading customer reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-sm text-dark/50">No reviews yet. Be the first to share your experience!</div>
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
                  mediaUrl={r.mediaUrl}
                  mediaType={r.mediaType}
                />
              ))}
            </div>
          )}
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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-tight">
            Taste the purity your<br />
            <span className="shimmer-gold">family deserves.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto leading-relaxed">
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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-dark/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-forest/10 p-8 max-w-md w-full shadow-2xl relative space-y-6 rounded-sm">
            <button 
              onClick={() => {
                setShowReviewModal(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="absolute top-4 right-4 text-dark/40 hover:text-forest transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {!user ? (
              <div className="text-center space-y-4 py-4">
                <h3 className="text-xl font-serif text-forest">Login Required</h3>
                <p className="text-sm text-dark/75">Please log in to your account to verify your purchase and write a review.</p>
                <div className="pt-2">
                  <Link 
                    href="/login?callbackUrl=/"
                    className="inline-block px-6 py-3 bg-forest hover:bg-forest-light text-white text-xs uppercase tracking-widest font-semibold transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <h3 className="text-xl font-serif text-forest border-b border-forest/5 pb-2">Share Your Experience</h3>
                <p className="text-xs text-dark/60">Your review will be marked with a <span className="text-forest font-semibold">Verified Buyer</span> badge once submitted.</p>
                
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 text-xs p-3 border border-red-200">
                    {errorMsg}
                  </div>
                )}
                
                {successMsg && (
                  <div className="bg-green-50 text-forest text-xs p-3 border border-green-200">
                    {successMsg}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        className="text-gold focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${val <= rating ? "fill-current" : "fill-transparent opacity-30"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Your Comment</label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-xs p-3 border border-forest/10 focus:border-gold outline-none bg-brand-bg/20 resize-none"
                    placeholder="What did you think of our cold pressed oils?"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Attach Photo or Video</label>
                  
                  {mediaUrl ? (
                    <div className="relative border border-forest/10 p-2 rounded bg-brand-bg/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {mediaType === "video" ? (
                          <div className="w-12 h-12 bg-black rounded flex items-center justify-center text-[10px] text-white animate-pulse">Video</div>
                        ) : (
                          <img src={mediaUrl} alt="Thumbnail" className="w-12 h-12 object-cover rounded" />
                        )}
                        <span className="text-[10px] text-dark/70 truncate max-w-[180px]">Attachment ready</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemoveMedia}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id="review-media-upload"
                      />
                      <label
                        htmlFor="review-media-upload"
                        className={`w-full py-2.5 px-4 border border-dashed border-forest/20 hover:border-forest/50 bg-brand-bg/10 flex items-center justify-center gap-2 cursor-pointer text-xs text-dark/75 transition-all ${
                          uploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {uploading ? "Uploading media..." : "Choose File (Image/Video)"}
                      </label>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-3 bg-forest hover:bg-forest-light text-white uppercase tracking-widest text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {submitLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
