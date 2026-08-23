"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus, Star, ChevronDown, ChevronUp, Check, Heart, X, Truck, ShieldCheck, CreditCard, Award, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/components/layout/AuthProvider";
import { Product } from "@/data/products";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface VariantOption {
  id: string;
  size: string;
  bottleType: string;
  label: string;
  price: number;
  originalPrice?: number;
  unitPriceText: string;
  tag?: string;
}

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { products, addToCart, wishlist, toggleWishlist } = useApp();
  const product = products.find((p) => p.id === params.id);

  if (!product || product.isComingSoon) {
    notFound();
    return null;
  }

  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);

  // Accordion open/close states
  const [openAccordion, setOpenAccordion] = useState<string | null>("why-better");

  // Reviews & Auth state
  const { user } = useAuth();
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Build combined Variant Matrix matching reference design (Size + Bottle + Price Card)
  const isOil = product.id.includes("oil");

  const p1L = product.sizePrices["1 L"] || 500;
  const p1LOrig = product.originalSizePrices?.["1 L"] || Math.round(p1L * 1.15);

  const p500 = product.sizePrices["500 ml"] || Math.round(p1L * 0.52);
  const p500Orig = product.originalSizePrices?.["500 ml"] || Math.round(p500 * 1.15);

  const p2L = product.sizePrices["2 L"] || Math.round(p1L * 1.95);
  const p2LOrig = product.originalSizePrices?.["2 L"] || Math.round(p2L * 1.15);

  const p5L = product.sizePrices["5 L"] || Math.round(p1L * 4.65);
  const p5LOrig = product.originalSizePrices?.["5 L"] || Math.round(p5L * 1.15);

  const glassDiff = 50; // ₹50 difference for premium glass bottle

  const variants: VariantOption[] = isOil
    ? [
        {
          id: "1l-glass",
          size: "1 L",
          bottleType: "Glass Bottle",
          label: "1L Glass Bottle",
          price: p1L + glassDiff,
          originalPrice: p1LOrig + glassDiff,
          unitPriceText: `Rs. ${p1L + glassDiff}.00 / L`,
        },
        {
          id: "1l-plastic",
          size: "1 L",
          bottleType: "Plastic Bottle",
          label: "1L Plastic Bottle",
          price: p1L,
          originalPrice: p1LOrig,
          unitPriceText: `Rs. ${p1L}.00 / L`,
          tag: "BESTSELLER",
        },
        {
          id: "2l-can",
          size: "2 L",
          bottleType: "Plastic Bottle",
          label: "2L Can",
          price: p2L,
          originalPrice: p2LOrig,
          unitPriceText: `Rs. ${Math.round(p2L / 2)}.00 / L`,
        },
        {
          id: "5l-can",
          size: "5 L",
          bottleType: "Plastic Bottle",
          label: "5L Can",
          price: p5L,
          originalPrice: p5LOrig,
          unitPriceText: `Rs. ${Math.round(p5L / 5)}.00 / L`,
          tag: "BEST VALUE",
        },
        {
          id: "500ml-pet",
          size: "500 ml",
          bottleType: "Plastic Bottle",
          label: "500mL PET Bottle",
          price: p500,
          originalPrice: p500Orig,
          unitPriceText: `Rs. ${p500 * 2}.00 / L`,
        },
      ]
    : product.sizes.map((s) => ({
        id: s.toLowerCase().replace(/\s+/g, "-"),
        size: s,
        bottleType: "Pack",
        label: s,
        price: product.sizePrices[s] || Object.values(product.sizePrices)[0] || 200,
        originalPrice: product.originalSizePrices?.[s] || undefined,
        unitPriceText: `${s} pack`,
      }));

  const [selectedVariant, setSelectedVariant] = useState<VariantOption>(
    variants.find((v) => v.tag === "BESTSELLER") || variants[0]
  );

  useEffect(() => {
    if (user) {
      setReviewerName(user.name || "");
      setReviewerEmail(user.email || "");
    }
  }, [user]);

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
    if (!comment) return;

    setSubmitLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          name: reviewerName || undefined,
          email: reviewerEmail || undefined,
          productId: product.id,
          mediaUrls: mediaFiles.map((f) => f.url),
          mediaTypes: mediaFiles.map((f) => f.type),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Thank you! Your review has been submitted and published successfully.");
        setComment("");
        setRating(5);
        setMediaFiles([]);
        const updatedRes = await fetch(`/api/reviews?productId=${product.id}`);
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

  const handleAddToCart = () => {
    if (product.isComingSoon) return;
    addToCart(product, selectedVariant.size, quantity, selectedVariant.bottleType);
    router.push("/checkout");
  };

  const handleBuyNow = () => {
    if (product.isComingSoon) return;
    addToCart(product, selectedVariant.size, quantity, selectedVariant.bottleType);
    router.push("/checkout");
  };

  // Calculated ratings
  const mockReviewsFormatted = (product.reviews || []).map((r: any, idx: number) => ({
    id: `mock-${idx}-${r.author || "rev"}`,
    rating: r.rating,
    name: r.author || "Verified Buyer",
    createdAt: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
    comment: r.comment || "",
    title: r.title || "",
    isVerified: r.verified ?? true,
    location: "Verified Buyer",
  }));
  const allReviews = [...dbReviews, ...mockReviewsFormatted];
  const totalReviewsCount = (product.reviewsCount || 0) + dbReviews.length;
  const averageRating = product.rating ? product.rating.toFixed(1) : "5.0";

  return (
    <div className="bg-brand-bg text-dark font-sans font-light selection:bg-gold/30 min-h-screen">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="max-w-[1280px] mx-auto px-6 py-4">
          <Link href="/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-dark/60 hover:text-forest transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Products Collection
          </Link>
        </div>

        {/* Product Details Hero Grid */}
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 py-4">
          
          {/* LEFT COLUMN: Main Hero Image + 2x2 Infographics Grid */}
          <div className="lg:col-span-6 space-y-6">
            {/* Main Product Viewer Card */}
            <div className="relative w-full aspect-[4/5] bg-white border border-forest/10 rounded-2xl p-6 shadow-sm overflow-hidden flex items-center justify-center">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain p-4"
                priority
              />
            </div>

            {/* 2x2 Infographics for Oils OR Gallery Thumbnails for Grains */}
            {isOil ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { src: "/images/why-made.jpg", label: "WHY CHOOSE US?" },
                  { src: "/images/how-made.jpg", label: "FARM TO DOORSTEP" },
                  { src: "/images/journey.jpg", label: "HOW IT'S MADE" },
                  { src: "/images/family.jpg", label: "OUR HERITAGE" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(item.src)}
                    className={`relative aspect-square w-full rounded-xl overflow-hidden border transition-all cursor-pointer bg-white group ${
                      selectedImage === item.src ? "border-forest ring-2 ring-forest shadow-md" : "border-forest/10 opacity-85 hover:opacity-100"
                    }`}
                  >
                    <Image src={item.src} alt={item.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/90 via-forest/60 to-transparent p-2 text-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              product.gallery && product.gallery.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.gallery.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgSrc)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border transition-all cursor-pointer bg-white shrink-0 ${
                        selectedImage === imgSrc ? "border-forest ring-2 ring-forest shadow-md" : "border-forest/10 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <Image src={imgSrc} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          {/* RIGHT COLUMN: Price, Combined Variant Cards, Buy Actions, Trust Badges & Accordions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header Badge, Title & Rating Stamp Row */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-full uppercase tracking-wider inline-block">
                  {isOil ? "Cold Pressed" : "Farm Fresh"}
                </span>

                {/* Circular Quality Stamp (Matching Image 1) */}
                <div className="w-12 h-12 rounded-full border-2 border-forest/30 bg-[#F2F7F2] flex items-center justify-center p-1 shadow-xs text-forest" title="100% Purity Certified">
                  <Award className="w-6 h-6 text-forest" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif text-forest font-bold tracking-tight">
                {product.name}
              </h1>

              {/* Price & Membership Badge */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="text-2xl md:text-3xl font-bold text-forest font-serif">
                  Rs. {selectedVariant.price}.00
                </div>

                {selectedVariant.originalPrice && (
                  <span className="text-base text-dark/40 line-through font-serif">
                    Rs. {selectedVariant.originalPrice}.00
                  </span>
                )}

                <div className="px-3 py-1 bg-[#E8F3EB] border border-forest/20 rounded-full text-xs text-[#123025] font-semibold flex items-center gap-1">
                  <span>Members Price Rs. {Math.round(selectedVariant.price * 0.88)}</span>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-2 pt-1 text-gold">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? "fill-gold text-gold" : "fill-transparent text-dark/20"}`} />
                  ))}
                </div>
                <span className="text-xs text-dark/65 font-semibold">({totalReviewsCount})</span>
              </div>
            </div>

            {/* COMBINED VARIANT MATRIX CARDS (3 Columns Grid matching Image 1) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-widest text-forest/70 font-semibold block">
                Select Option (Size & Packaging)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {variants.map((v) => {
                  const isSelected = selectedVariant.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer text-center min-h-[90px] border ${
                        isSelected
                          ? "bg-[#F2F7F2] border-2 border-[#123025] shadow-sm"
                          : "bg-white border-forest/15 hover:border-forest/40"
                      }`}
                    >
                      {/* Top Badge (BESTSELLER / BEST VALUE) */}
                      {v.tag && (
                        <span className={`absolute -top-2.5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full text-white shadow-xs ${
                          v.tag === "BESTSELLER" ? "bg-[#123025]" : "bg-gold"
                        }`}>
                          {v.tag}
                        </span>
                      )}

                      <span className="text-xs font-bold text-forest uppercase tracking-tight mb-1">
                        {v.label}
                      </span>
                      <span className="text-xs font-extrabold text-dark mb-0.5">
                        Rs. {v.price}
                      </span>
                      <span className="text-[10px] text-dark/50 font-medium">
                        {v.unitPriceText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUANTITY + ADD TO CART + BUY NOW ACTION BUTTONS */}
            <div className="space-y-3 pt-4 border-t border-forest/10">
              {/* Row 1: Quantity + Add To Cart */}
              <div className="flex gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-forest/20 rounded-lg bg-white shrink-0 px-2 h-12">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-dark/60 hover:text-forest transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-black">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-dark/60 hover:text-forest transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* ADD TO CART Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full h-12 border-2 border-[#123025] bg-white text-[#123025] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-forest/5 transition-colors cursor-pointer shadow-xs"
                >
                  ADD TO CART
                </button>
              </div>

              {/* Row 2: BUY NOW Button with Payment Logos */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full h-14 bg-[#123025] hover:bg-forest text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-md"
              >
                <span>BUY NOW</span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md text-[10px] font-normal tracking-normal">
                  <span>GPay</span> • <span>PhonePe</span> • <span>UPI</span>
                </span>
              </button>
            </div>

            {/* TRUST & DELIVERY HIGHLIGHTS BANNER (Matching Image 1) */}
            <div className="bg-[#FDFBF7] border border-forest/10 rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center space-y-1">
                <Truck className="w-5 h-5 text-gold" />
                <span className="text-[10px] font-bold text-forest uppercase tracking-tight">Free Shipping</span>
                <span className="text-[9px] text-dark/50">Above ₹999</span>
              </div>
              <div className="flex flex-col items-center space-y-1 border-x border-forest/10 px-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <span className="text-[10px] font-bold text-forest uppercase tracking-tight">Secure Payments</span>
                <span className="text-[9px] text-dark/50">256-Bit SSL</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <CreditCard className="w-5 h-5 text-gold" />
                <span className="text-[10px] font-bold text-forest uppercase tracking-tight">COD Available</span>
                <span className="text-[9px] text-dark/50">Pay at Doorstep</span>
              </div>
            </div>

            {/* KEY FEATURES BULLET LIST */}
            <div className="space-y-2 pt-2 border-t border-forest/10">
              <ul className="space-y-2 text-xs md:text-sm text-dark/80 font-light leading-relaxed">
                {(isOil
                  ? [
                      "Fresh, cold-pressed oil extracted in small batches",
                      "Gently extracted using a traditional slow stone kolhu (wooden Ghani)",
                      "Light on the stomach and easy to digest",
                      "Rich, authentic natural nut aroma",
                      "Ideal for crisp, clean frying and daily homestyle cooking",
                      "100% pure, unrefined, zero chemical solvents or artificial additives",
                    ]
                  : [
                      "100% Traditional, pesticide-free heritage grains & rice",
                      "Sourced directly from rain-fed family farms in South India",
                      "Gently processed to retain natural bran layer, fiber & essential B-complex vitamins",
                      "Fluffy, aromatic texture and authentic natural taste when cooked",
                      "Slow-digesting complex carbs that provide sustained energy without post-meal lethargy",
                      "100% pure, unpolished, zero chemical additives or artificial coating",
                    ]
                ).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-gold font-bold">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* EXPANDABLE COLLAPSIBLE ACCORDIONS */}
            <div className="space-y-3 pt-4 border-t border-forest/10">
              {(isOil
                ? [
                    {
                      id: "why-better",
                      title: "WHY IT TASTES BETTER",
                      content: "Our wood pressing mills run under 14 RPM in seasoned Vagai wooden Ghanis. By keeping extraction temperatures strictly under 38°C, zero nutrients or natural aromas are lost, resulting in authentic, rich homestyle flavor."
                    },
                    {
                      id: "whats-inside",
                      title: "WHAT'S INSIDE",
                      content: "100% pure single-origin bold seeds sourced directly from rain-fed family farms. 0% mineral oil, 0% preservatives, 0% added chemical solvents."
                    },
                    {
                      id: "how-made",
                      title: "HOW IT'S MADE",
                      content: "Sun-dried oilseeds are slowly crushed in traditional wooden Ghani, gravity-filtered for 48 hours without chemical bleaching, and packed fresh upon order."
                    },
                    {
                      id: "results-notice",
                      title: "RESULTS YOU'LL NOTICE",
                      content: "Lighter stomach feeling after meals, authentic traditional aroma in your kitchen, reduced oil absorption during frying, and pure unadulterated nourishment for your family."
                    }
                  ]
                : [
                    {
                      id: "why-better",
                      title: "WHY IT TASTES BETTER",
                      content: "Our heritage grains and traditional rice varieties are grown naturally and aged to perfection. By avoiding harsh chemical polishing, the grain retains its original aroma, natural sweetness, and wholesome texture."
                    },
                    {
                      id: "whats-inside",
                      title: "WHAT'S INSIDE",
                      content: "100% pure single-origin heritage grains sourced directly from local family farmers. High in natural dietary fiber, essential B-complex vitamins, and minerals with zero chemical preservatives or artificial polish."
                    },
                    {
                      id: "how-made",
                      title: "HOW IT'S GROWN & PROCESSED",
                      content: "Harvested at peak maturity, naturally sun-dried, and gently dehusked using traditional milling methods to keep the nutrition-rich bran layer intact."
                    },
                    {
                      id: "results-notice",
                      title: "RESULTS YOU'LL NOTICE",
                      content: "Sustained energy without post-meal heaviness, improved digestion, authentic traditional aroma while cooking, and pure wholesome nourishment for your family."
                    }
                  ]
              ).map((acc) => {
                const isOpen = openAccordion === acc.id;
                return (
                  <div key={acc.id} className="border-b border-forest/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(isOpen ? null : acc.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-forest uppercase tracking-wider py-2 cursor-pointer hover:text-gold transition-colors"
                    >
                      <span>{acc.title}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-forest/60" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-dark/75 font-light leading-relaxed pt-2"
                        >
                          {acc.content}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* SPECIAL INFOGRAPHIC FEATURE BANNER FOR JAI SRI RAM RICE */}
        {product.id.includes("jaisriram") && (
          <div className="max-w-[1280px] mx-auto px-6 pt-12">
            <div className="relative w-full rounded-2xl overflow-hidden border border-forest/15 shadow-md bg-white p-4">
              <div className="relative aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] w-full">
                <Image
                  src="/images/why-jaisriram-rice.jpg"
                  alt="Why Our Jai Sri Ram Rice - Root & Harvest"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Minimal Details Grid (Benefits, Nutrition, Storage) */}
        <section className="bg-white py-20 px-6 border-y border-forest/10 mt-16">
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

        {/* Customer Reviews Section */}
        <section className="py-20 px-6 bg-brand-bg">
          <div className="max-w-4xl mx-auto space-y-16">
            
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif text-forest uppercase tracking-wider font-semibold">Customer Reviews</h2>
              <div className="flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-6 py-3 bg-forest hover:bg-forest-light text-white text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  Write a Review
                </button>
              </div>
            </div>

            {loadingReviews ? (
              <div className="text-center text-xs uppercase tracking-wider text-dark/40 py-8">
                Loading Customer Reviews...
              </div>
            ) : allReviews.length === 0 ? (
              <div className="text-center text-xs uppercase tracking-wider text-dark/40 py-8">
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {allReviews.map((r) => (
                  <div key={r.id} className="space-y-4 bg-white p-6 border border-forest/10 shadow-xs rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-gold text-gold' : 'fill-transparent text-dark/20'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-dark/40">
                        {r.createdAt && !isNaN(new Date(r.createdAt).getTime()) 
                          ? new Date(r.createdAt).toLocaleDateString() 
                          : new Date().toLocaleDateString()}
                      </span>
                    </div>
                    
                    {r.title && <h4 className="text-base font-serif text-forest font-semibold">"{r.title}"</h4>}
                    {r.comment && (
                      <p className="text-xs text-dark/70 font-light leading-relaxed whitespace-pre-line">
                        {r.comment}
                      </p>
                    )}

                    {r.mediaUrls && r.mediaUrls.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {r.mediaUrls.map((url: string, index: number) => {
                          const isVideo = r.mediaTypes?.[index] === "video";
                          return (
                            <div key={index} className="relative w-14 h-14 border border-forest/10 rounded overflow-hidden bg-brand-bg/10">
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
                      <span className="font-semibold text-forest">{r.name || "Verified Buyer"}</span>
                      {r.location && <span className="text-dark/40">({r.location})</span>}
                      {r.isVerified && <span className="text-gold flex items-center gap-1"><Check className="w-3 h-3" /> Verified Buyer</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* Write a Review Modal */}
        <AnimatePresence>
          {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReviewModal(false)}
                className="fixed inset-0 bg-dark/40 backdrop-blur-xs"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-brand-bg border border-forest/10 p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto rounded-2xl"
              >
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="absolute top-6 right-6 text-dark/40 hover:text-forest transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2 border-b border-forest/10 pb-4">
                  <h3 className="text-2xl font-serif text-forest font-semibold">Share Your Experience</h3>
                  <p className="text-xs text-dark/60">
                    Your review will be marked with a <span className="font-semibold text-forest">Verified Buyer</span> badge once submitted.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Rating</label>
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

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Your Comment</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={isOil ? "What did you think of our cold pressed oils?" : "What did you think of our farm fresh grains?"}
                      className="w-full p-3 bg-white border border-forest/10 text-xs focus:border-forest outline-none rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">Attach Photos or Videos (Up to 2)</label>
                    
                    {mediaFiles.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {mediaFiles.map((file, idx) => (
                          <div key={idx} className="relative border border-forest/10 p-2 rounded bg-white flex items-center justify-between">
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
                          id="review-media-upload"
                        />
                        <label
                          htmlFor="review-media-upload"
                          className={`w-full py-2.5 px-4 border border-dashed border-forest/20 hover:border-forest/50 bg-white flex items-center justify-center gap-2 cursor-pointer text-xs text-dark/75 transition-all ${
                            uploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {uploading ? "Uploading media..." : `Choose File ${mediaFiles.length + 1} (Image/Video)`}
                        </label>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitLoading || uploading}
                    className="w-full py-3"
                  >
                    {submitLoading ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}
