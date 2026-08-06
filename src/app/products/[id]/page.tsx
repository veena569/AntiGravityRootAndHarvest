"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus, Star, ChevronDown, ChevronUp, Check, Heart, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/components/layout/AuthProvider";
import { Product } from "@/data/products";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { BrandBottle } from "@/components/ui/BrandBottle";
import { Button } from "@/components/ui/Button";

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { products, addToCart, wishlist, toggleWishlist } = useApp();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
    return null;
  }

  const router = useRouter();
  const defaultSize = product.sizes.find((s: string) => s === "1 L" || s === "1L") || product.sizes[0] || "";
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [selectedBottleType, setSelectedBottleType] = useState("Lightweight Bottle");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const { user } = useAuth();
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!product) return;
    async function fetchProductReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${product!.id}`);
        if (res.ok) {
          const data = await res.json();
          setDbReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("[FETCH_PRODUCT_REVIEWS_FAILED]", err);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchProductReviews();
  }, [product?.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaFiles.length >= 2) {
      setErrorMsg("You can only upload up to 2 files per review.");
      return;
    }

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
        setMediaFiles((prev) => [...prev, { url: data.mediaUrl, type: data.mediaType }]);
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

  const handleRemoveMedia = (indexToRemove: number) => {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
        body: JSON.stringify({
          productId: product!.id,
          rating,
          comment,
          name: reviewerName,
          mediaUrls: mediaFiles.map((f) => f.url),
          mediaTypes: mediaFiles.map((f) => f.type)
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Thank you! Your review has been submitted and published successfully.");
        setComment("");
        setRating(5);
        setReviewerName("");
        setMediaFiles([]);
        
        // Refresh reviews
        const updatedRes = await fetch(`/api/reviews?productId=${product!.id}`);
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setDbReviews(updatedData.reviews || []);
        }
        setTimeout(() => {
          setShowReviewModal(false);
          setSuccessMsg("");
        }, 3000);
      } else {
        setErrorMsg(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("[PRODUCT_REVIEW_SUBMIT_FAILED]", err);
      setErrorMsg("Failed to submit review due to network error.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const is2L = selectedSize.toLowerCase().includes("2");
  const availableBottleTypes = is2L ? ["Lightweight Bottle"] : ["Lightweight Bottle", "Glass Bottle"];

  useEffect(() => {
    if (selectedSize && is2L) {
      setSelectedBottleType("Lightweight Bottle");
    }
  }, [selectedSize, is2L]);

  const currentPriceRaw = selectedSize ? product.sizePrices[selectedSize] : Object.values(product.sizePrices)[0];
  const currentOriginalPriceRaw = selectedSize 
    ? (product.originalSizePrices?.[selectedSize] || null) 
    : (product.originalSizePrices ? Object.values(product.originalSizePrices)[0] : null);

  let currentPrice = currentPriceRaw;
  let currentOriginalPrice = currentOriginalPriceRaw;

  if (selectedBottleType === "Lightweight Bottle") {
    if (selectedSize === "500 ml") {
      currentPrice = 225;
      currentOriginalPrice = 250;
    } else if (selectedSize === "1 L") {
      currentPrice = Math.max(0, currentPriceRaw - 50);
      currentOriginalPrice = currentOriginalPriceRaw ? Math.max(0, currentOriginalPriceRaw - 50) : null;
    }
  }

  const handleAddToCart = () => {
    if (product.isComingSoon || !selectedSize) return;
    addToCart(product, selectedSize, quantity, selectedBottleType);
    router.push("/cart");
  };

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30 min-h-screen">
      <Navbar />

      <main>
        {/* Navigation Breadcrumb */}
        <div className="pt-32 pb-8 px-6 max-w-7xl mx-auto">
          <Link href="/products" className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-dark/50 hover:text-forest transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Collection
          </Link>
        </div>

        {/* Product Hero Area (Extremely Simple) */}
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 py-20">
          
          {/* Huge Photography */}
          <div className="relative aspect-[4/5] bg-white w-full border border-forest/10 p-8 shadow-sm">
            {product.id.includes("oil") ? (
              <BrandBottle className="w-full h-full absolute inset-0" />
            ) : (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`object-cover p-4 ${product.isComingSoon ? "blur-md opacity-70 grayscale" : ""}`}
                priority
              />
            )}
          </div>

          {/* Core Info & Cart Actions */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-serif text-forest tracking-tight leading-tight uppercase font-semibold">
                {product.name}
              </h1>
              <p className="text-lg text-dark/70 font-light leading-relaxed">
                {product.tagline}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-base text-dark/80 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* If product is coming soon, just show a label, else show cart actions */}
            {product.isComingSoon ? (
              <div className="pt-8 border-t border-forest/10">
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-gold">Launching Soon</p>
              </div>
            ) : (
              <div className="space-y-12 pt-8 border-t border-forest/10">
                
                {/* Size Selection */}
                <div className="space-y-6">
                  <label htmlFor="size-select" className="text-xs uppercase tracking-widest text-forest/50 font-semibold block">Select Size (Mandatory)</label>
                  <div className="relative">
                    <select
                      id="size-select"
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full appearance-none rounded-none border border-forest/20 bg-transparent px-8 py-4 text-sm uppercase tracking-widest text-forest focus:border-forest focus:outline-none transition-colors"
                    >
                      <option value="" disabled>Choose a size</option>
                      {product.sizes.filter(size => ['250ml', '500ml', '1000ml', '250 ml', '500 ml', '1 L', '1L'].includes(size.toLowerCase()) || true).map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50 pointer-events-none" />
                  </div>
                </div>

                {/* Bottle Type Selection */}
                {selectedSize && product.id.includes("oil") && (
                  <div className="space-y-6">
                    <label htmlFor="bottle-select" className="text-xs uppercase tracking-widest text-forest/50 font-semibold block">Select Bottle Type</label>
                    <div className="relative">
                      <select
                        id="bottle-select"
                        value={selectedBottleType}
                        onChange={(e) => setSelectedBottleType(e.target.value)}
                        className="w-full appearance-none rounded-none border border-forest/20 bg-transparent px-8 py-4 text-sm uppercase tracking-widest text-forest focus:border-forest focus:outline-none transition-colors bg-white"
                      >
                        {availableBottleTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Add to Cart Line */}
                <div className="flex flex-col sm:flex-row items-end gap-6">
                  <div className="w-full sm:w-auto">
                    <span className="text-xs uppercase tracking-widest text-forest/50 font-semibold block mb-4">Quantity</span>
                    <div className="flex items-center border border-forest/10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-6 py-4 text-dark/50 hover:text-forest transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-serif text-lg text-black">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-6 py-4 text-dark/50 hover:text-forest transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="text-xs uppercase tracking-widest text-forest/50 font-semibold">Total Price</span>
                      <div className="flex items-baseline gap-2">
                        {currentOriginalPrice && (
                          <span className="font-serif text-lg text-dark/40 line-through">₹{currentOriginalPrice * quantity}</span>
                        )}
                        <span className="font-serif text-2xl text-black font-semibold">₹{currentPrice * quantity}</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={handleAddToCart}
                        disabled={!selectedSize}
                        variant="primary"
                        className="w-full h-14"
                      >
                        {selectedSize ? "Add To Cart" : "Select Size"}
                      </Button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`w-14 h-14 border flex items-center justify-center shrink-0 transition-all ${
                          wishlist?.includes(product.id)
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-forest/20 text-forest hover:bg-forest/5"
                        }`}
                        aria-label="Toggle Wishlist"
                      >
                        <Heart className={`w-5 h-5 ${wishlist?.includes(product.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Minimal Details Grid (Benefits, Nutrition, Storage) */}
        <section className="bg-white py-20 px-6 border-y border-forest/10">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-8">The Benefits</h3>
              <ul className="space-y-4 text-sm text-dark/80 font-light leading-relaxed">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-1.5 h-1.5 bg-forest/30 mt-2 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-8">Nutrition (Per 100g)</h3>
              <ul className="space-y-3 text-sm text-dark/80 font-light w-full">
                {product.nutrition.map((item, i) => (
                  <li key={i} className="flex justify-between border-b border-forest/10 pb-3">
                    <span className="text-dark/60">{item.label}</span>
                    <span className="font-medium text-forest">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mb-8">Storage</h3>
              <p className="text-sm text-dark/80 font-light leading-relaxed">
                {product.storage}
              </p>
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold mt-12 mb-4">Ingredients</h3>
              <p className="text-sm text-dark/80 font-light leading-relaxed">
                {product.ingredients}
              </p>
            </div>

          </div>
        </section>

        {/* Minimal Customer Reviews */}
        <section className="py-20 px-6 bg-brand-bg">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Headers & Overall Rating */}
            {(() => {
              const mockReviewsFormatted = (product.reviews || []).map((r: any) => ({
                id: `mock-${r.author}-${r.date}`,
                rating: r.rating,
                comment: r.comment,
                name: r.author,
                location: "Verified Buyer",
                isVerified: r.verified,
                mediaUrls: [],
                mediaTypes: [],
                createdAt: r.date
              }));
              
              const allReviews = [...dbReviews, ...mockReviewsFormatted];
              const totalReviewsCount = allReviews.length;
              const averageRating = totalReviewsCount > 0 
                ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1) 
                : "5.0";

              return (
                <>
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-serif text-forest uppercase tracking-wider font-semibold">Customer Perspectives</h2>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-3 text-lg font-serif text-forest">
                        <Star className="w-5 h-5 fill-gold text-gold" />
                        {averageRating} / 5 based on {totalReviewsCount} reviews
                      </div>
                      <div className="pt-4">
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="px-6 py-3 bg-forest hover:bg-forest-light text-white text-xs uppercase tracking-widest font-semibold transition-colors"
                        >
                          Write a Review
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {loadingReviews ? (
                    <div className="text-center text-xs uppercase tracking-wider text-dark/40 py-8">
                      Loading Customer Reviews...
                    </div>
                  ) : allReviews.length === 0 ? (
                    <div className="text-center text-xs uppercase tracking-wider text-dark/40 py-8">
                      No reviews yet. Be the first to share your experience!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                      {allReviews.map((r) => (
                        <div key={r.id} className="space-y-6 bg-white p-6 border border-forest/5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-gold text-gold' : 'fill-transparent text-dark/20'}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-dark/40">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          {r.title && <h4 className="text-lg font-serif text-forest leading-tight">"{r.title}"</h4>}
                          <p className="text-xs text-dark/70 font-light leading-relaxed whitespace-pre-line">
                            {r.comment}
                          </p>

                          {/* Media attachments */}
                          {r.mediaUrls && r.mediaUrls.length > 0 && (
                            <div className="flex gap-2 pt-2">
                              {r.mediaUrls.map((url: string, index: number) => {
                                const isVideo = r.mediaTypes?.[index] === "video";
                                return (
                                  <div key={index} className="relative w-16 h-16 border border-forest/10 rounded overflow-hidden bg-brand-bg/10">
                                    {isVideo ? (
                                      <video src={url} className="w-full h-full object-cover" controls />
                                    ) : (
                                      <img src={url} alt="Review attachment" className="w-full h-full object-cover cursor-pointer" onClick={() => window.open(url, '_blank')} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-2 text-[10px] uppercase tracking-widest border-t border-forest/5">
                            <span className="font-semibold text-forest">{r.name}</span>
                            <span className="text-dark/40">({r.location})</span>
                            {r.isVerified && <span className="text-gold flex items-center gap-1"><Check className="w-3 h-3" /> Verified Buyer</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

          </div>
        </section>

        {/* Write a Review Modal */}
        <AnimatePresence>
          {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReviewModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              
              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-lg p-8 md:p-10 shadow-2xl border border-forest/10 z-10 max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="absolute right-6 top-6 text-dark/40 hover:text-forest transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h3 className="text-2xl font-serif text-forest border-b border-forest/5 pb-3 uppercase tracking-wider font-semibold">Share Your Experience</h3>
                  
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
                  
                  {!user && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Your Name</label>
                      <input
                        required
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full text-xs p-3 border border-forest/10 focus:border-gold outline-none bg-brand-bg/20"
                        placeholder="Enter your name"
                      />
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
                      placeholder={`What did you think of our ${product.name}?`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Attach Photos or Videos (Up to 2)</label>
                    
                    {mediaFiles.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {mediaFiles.map((file, idx) => (
                          <div key={idx} className="relative border border-forest/10 p-2 rounded bg-brand-bg/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {file.type === "video" ? (
                                <div className="w-12 h-12 bg-black rounded flex items-center justify-center text-[10px] text-white">Video</div>
                              ) : (
                                <img src={file.url} alt={`Thumbnail ${idx + 1}`} className="w-12 h-12 object-cover rounded" />
                              )}
                              <span className="text-[10px] text-dark/70 truncate max-w-[180px]">Attachment {idx + 1} ready</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveMedia(idx)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {mediaFiles.length < 2 && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          disabled={uploading}
                          className="hidden"
                          id="product-review-media-upload"
                        />
                        <label
                          htmlFor="product-review-media-upload"
                          className={`w-full py-2.5 px-4 border border-dashed border-forest/20 hover:border-forest/50 bg-brand-bg/10 flex items-center justify-center gap-2 cursor-pointer text-xs text-dark/75 transition-all ${
                            uploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {uploading ? "Uploading..." : "Choose File (Image/Video)"}
                        </label>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitLoading || uploading}
                    className="w-full h-12 text-xs uppercase tracking-widest mt-4"
                  >
                    {submitLoading ? "Submitting Review..." : "Submit Review"}
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Minimal FAQ */}
        <section className="py-20 px-6 bg-white border-t border-forest/10">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-serif text-forest uppercase tracking-wider font-semibold">Common Queries</h2>
            </div>
            
            <div className="divide-y divide-forest/10 border-t border-b border-forest/10">
              {product.faqs.map((faq, idx) => (
                <div key={idx} className="py-8">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <span className="text-lg font-serif text-forest pr-8 group-hover:text-gold transition-colors">{faq.q}</span>
                    {activeFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-gold shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-forest/40 group-hover:text-gold transition-colors shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-6 text-sm text-dark/70 font-light leading-relaxed pr-12">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
