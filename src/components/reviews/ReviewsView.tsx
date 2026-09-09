"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Check, MessageSquare, Heart, ShieldCheck, Filter, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { GoogleReviewButton } from "@/components/ui/GoogleReviewButton";
import { INITIAL_PRODUCTS } from "@/data/products";

export function ReviewsView() {
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");
  const [showModal, setShowModal] = useState(false);

  // Submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data = await res.json();
          setDbReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("[FETCH_REVIEWS_FAILED]", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  // Collect initial product reviews as baseline
  const staticReviews = INITIAL_PRODUCTS.flatMap((p) =>
    (p.reviews || []).map((r, i) => ({
      id: `${p.id}-${i}`,
      name: r.author,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.date,
      isVerified: true,
      productName: p.name,
      location: "Verified Household",
    }))
  );

  const allReviews = [...staticReviews, ...dbReviews];

  const filteredReviews =
    activeFilter === "all"
      ? allReviews
      : allReviews.filter((r) => r.rating === activeFilter);

  const totalReviews = allReviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          allReviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
          totalReviews
        ).toFixed(1)
      : "5.0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || comment.trim().length < 5) {
      setErrorMsg("Please write at least a sentence about your experience.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          productId: productId === "general" ? undefined : productId,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setComment("");
        // Refresh reviews
        const updatedRes = await fetch("/api/reviews");
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setDbReviews(updatedData.reviews || []);
        }
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to submit review.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-brand-bg text-dark selection:bg-gold/20 font-light">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16 w-full space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-dark/60 flex items-center gap-2">
          <Link href="/" className="hover:text-forest transition-colors">
            Home
          </Link>
          <span className="text-dark/30">/</span>
          <span className="text-forest font-medium" aria-current="page">
            Customer Reviews
          </span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold font-semibold block">
            GENUINE HOUSEHOLD FEEDBACK
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-forest font-semibold tracking-tight">
            Loved by Conscious Indian Families
          </h1>
          <p className="text-sm md:text-base text-dark/70 font-light leading-relaxed">
            Every drop of our wood-pressed oil is extracted with honesty and respect for tradition.
            Read authentic reviews from families who cook with Root & Harvest every day.
          </p>
        </div>

        {/* Rating Summary + Google CTA Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Summary Box */}
          <div className="md:col-span-5 bg-white p-8 rounded-2xl border border-forest/10 flex flex-col justify-center items-center text-center space-y-4 shadow-xs">
            <div className="text-5xl sm:text-6xl font-serif font-bold text-forest">
              {avgRating}
            </div>
            <div className="flex items-center gap-1 text-gold">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(Number(avgRating)) ? "fill-gold text-gold" : "text-gold/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-dark/60">
              Based on <span className="font-semibold text-forest">{totalReviews}</span> verified reviews across our website & family households.
            </p>
            <div className="pt-2 w-full">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setShowModal(true);
                }}
                className="w-full py-3 text-xs uppercase tracking-widest font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-2" />
                Write a Review
              </Button>
            </div>
          </div>

          {/* Google Review Spotlight Card */}
          <div className="md:col-span-7 bg-forest text-brand-bg p-8 rounded-2xl flex flex-col justify-between space-y-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-gold/15 to-transparent pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[1px] bg-gold" />
                <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                  Google Search & Maps
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white">
                Find & Review Us on Google
              </h2>
              <p className="text-xs sm:text-sm text-brand-bg/80 leading-relaxed font-light">
                Your direct rating on our Google Business Profile helps other families discover authentic wood-pressed oils and keeps traditional Indian farming thriving.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 relative z-10 pt-2">
              <GoogleReviewButton variant="gold" />
              <Link
                href="/about"
                className="text-xs text-brand-bg/80 hover:text-white underline underline-offset-4 font-light flex items-center gap-1"
              >
                Read our story <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeFilter === "all"
                  ? "bg-forest text-white shadow-xs"
                  : "bg-white border border-forest/10 text-dark/70 hover:border-forest/30"
              }`}
            >
              All ({totalReviews})
            </button>
            {[5, 4, 3].map((star) => (
              <button
                key={star}
                onClick={() => setActiveFilter(star)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  activeFilter === star
                    ? "bg-forest text-white shadow-xs"
                    : "bg-white border border-forest/10 text-dark/70 hover:border-forest/30"
                }`}
              >
                {star} <Star className="w-3 h-3 fill-gold text-gold" />
              </button>
            ))}
          </div>

          <span className="text-xs text-dark/50">
            Showing {filteredReviews.length} reviews
          </span>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((r, idx) => (
            <div
              key={r.id || idx}
              className="p-6 bg-white rounded-2xl border border-forest/10 flex flex-col justify-between space-y-4 shadow-xs hover:border-forest/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (r.rating || 5) ? "fill-gold text-gold" : "text-gold/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-dark/40">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Verified"}
                  </span>
                </div>

                {r.productName && (
                  <span className="text-[10px] uppercase tracking-wider text-gold font-semibold block">
                    {r.productName}
                  </span>
                )}

                <p className="text-xs text-dark/80 leading-relaxed font-light whitespace-pre-line">
                  "{r.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-forest/5 flex items-center justify-between text-[10px] uppercase tracking-wider">
                <span className="font-semibold text-forest truncate max-w-[150px]">
                  {r.name || "Verified Customer"}
                </span>
                <span className="text-gold flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Write Review with Two-Step Post-Review Engagement */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-xs">
            <div className="relative w-full max-w-lg bg-brand-bg border border-forest/10 p-6 sm:p-8 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-dark/40 hover:text-forest transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>

              {submitted ? (
                <div className="space-y-6 text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif text-forest font-semibold">
                      Thank You for Supporting Root & Harvest ❤️
                    </h3>
                    <p className="text-xs text-dark/70 leading-relaxed max-w-md mx-auto">
                      Your review has been submitted to our website. Would you also like to share your experience on our official Google Business Profile to help other families find healthy wood-pressed oils?
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-xl border border-forest/10 space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gold fill-gold" />
                      <h4 className="text-xs font-semibold text-forest uppercase tracking-wider">
                        Share on Google Maps
                      </h4>
                    </div>
                    <p className="text-xs text-dark/70 leading-relaxed font-light">
                      It only takes 30 seconds and means the world to our small team and farmers!
                    </p>
                    <div className="pt-2">
                      <GoogleReviewButton variant="gold" className="w-full justify-center" />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="w-full py-2.5 text-xs uppercase tracking-widest font-semibold border-forest/20"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1 border-b border-forest/10 pb-3">
                    <h3 className="text-2xl font-serif text-forest font-semibold">
                      Share Your Feedback
                    </h3>
                    <p className="text-xs text-dark/60">
                      Help other families discover pure, healthy nourishment.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">
                      Product
                    </label>
                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-forest/10 text-xs focus:border-forest outline-none rounded"
                    >
                      <option value="general">General Brand Feedback</option>
                      {INITIAL_PRODUCTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? "fill-gold text-gold" : "fill-transparent text-dark/20"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full p-2.5 bg-white border border-forest/10 text-xs focus:border-forest outline-none rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full p-2.5 bg-white border border-forest/10 text-xs focus:border-forest outline-none rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">
                      Review
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your honest thoughts on the oil's purity, aroma, packaging, and cooking experience..."
                      className="w-full p-3 bg-white border border-forest/10 text-xs focus:border-forest outline-none rounded"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 text-xs uppercase tracking-widest font-semibold"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
