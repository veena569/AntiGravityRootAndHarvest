"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Minus,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  Heart,
  X,
  Truck,
  ShieldCheck,
  CreditCard,
  Award,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/components/layout/AuthProvider";
import { INITIAL_PRODUCTS, Product } from "@/data/products";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { GoogleReviewButton } from "@/components/ui/GoogleReviewButton";

interface VariantOption {
  id: string;
  size: string;
  bottleType: string;
  label: string;
  name?: string;
  price: number;
  salePrice: number;
  mrp: number;
  originalPrice: number;
  discountPercent: number;
  unitPrice: number;
  unitPriceText: string;
  tag?: string;
}

function makeOilVariant(opts: {
  id: string;
  size: string;
  bottleType: string;
  label: string;
  salePrice: number;
  litres: number;
  tag?: string;
}): VariantOption {
  const salePrice = opts.salePrice;
  const mrp = Number((salePrice / 0.90).toFixed(2));
  const discountPercent = 10;
  const unitPrice = Number((salePrice / opts.litres).toFixed(2));
  const unitPriceText = `₹${unitPrice.toFixed(2)}/L`;

  return {
    id: opts.id,
    size: opts.size,
    bottleType: opts.bottleType,
    label: opts.label,
    name: opts.label,
    price: salePrice,
    salePrice,
    mrp,
    originalPrice: mrp,
    discountPercent,
    unitPrice,
    unitPriceText,
    tag: opts.tag,
  };
}

export function ProductDetailsClient({ productId }: { productId: string }) {
  const { products, addToCart, wishlist, toggleWishlist } = useApp();
  const product =
    products.find((p) => p.id === productId) ||
    INITIAL_PRODUCTS.find((p) => p.id === productId);

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
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Build combined Variant Matrix matching reference design (Size + Bottle + Price Card)
  const isOil = product.id.includes("oil");

  const oilVariants: VariantOption[] = useMemo(() => {
    if (!isOil) {
      return product.sizes.map((s) => {
        const salePrice = product.sizePrices[s] || 0;
        const mrp = Number((salePrice / 0.90).toFixed(2));
        return {
          id: s,
          size: s,
          bottleType: "Pouch",
          label: s,
          name: s,
          price: salePrice,
          salePrice,
          mrp,
          originalPrice: mrp,
          discountPercent: 10,
          unitPrice: salePrice,
          unitPriceText: "",
        };
      });
    }

    if (product.id === "groundnut-oil") {
      return [
        makeOilVariant({
          id: "gn-500ml-plastic",
          size: "500 ml",
          bottleType: "Plastic Bottle",
          label: "500 ml - Plastic Bottle",
          salePrice: 245,
          litres: 0.5,
        }),
        makeOilVariant({
          id: "gn-500ml-glass",
          size: "500 ml",
          bottleType: "Glass Bottle",
          label: "500 ml - Glass Bottle",
          salePrice: 295,
          litres: 0.5,
        }),
        makeOilVariant({
          id: "gn-1l-plastic",
          size: "1 L",
          bottleType: "Plastic Bottle",
          label: "1 Litre - Plastic Bottle",
          salePrice: 469,
          litres: 1.0,
          tag: "BESTSELLER",
        }),
        makeOilVariant({
          id: "gn-1l-glass",
          size: "1 L",
          bottleType: "Glass Bottle",
          label: "1 Litre - Glass Bottle",
          salePrice: 549,
          litres: 1.0,
        }),
        makeOilVariant({
          id: "gn-1l-tin",
          size: "1 L",
          bottleType: "Metal Tin",
          label: "1 Litre - Metal Tin",
          salePrice: 569,
          litres: 1.0,
          tag: "MOST POPULAR",
        }),
        makeOilVariant({
          id: "gn-2l-tin",
          size: "2 L",
          bottleType: "Metal Tin",
          label: "2 Litre - Metal Tin",
          salePrice: 999,
          litres: 2.0,
        }),
        makeOilVariant({
          id: "gn-5l-tin",
          size: "5 L",
          bottleType: "Metal Tin",
          label: "5 Litre - Metal Can",
          salePrice: 2299,
          litres: 5.0,
          tag: "BEST VALUE",
        }),
      ];
    }

    if (product.id === "sesame-oil") {
      return [
        makeOilVariant({
          id: "ses-500ml-plastic",
          size: "500 ml",
          bottleType: "Plastic Bottle",
          label: "500 ml - Plastic Bottle",
          salePrice: 299,
          litres: 0.5,
        }),
        makeOilVariant({
          id: "ses-500ml-glass",
          size: "500 ml",
          bottleType: "Glass Bottle",
          label: "500 ml - Glass Bottle",
          salePrice: 349,
          litres: 0.5,
        }),
        makeOilVariant({
          id: "ses-1l-plastic",
          size: "1 L",
          bottleType: "Plastic Bottle",
          label: "1 Litre - Plastic Bottle",
          salePrice: 549,
          litres: 1.0,
          tag: "BESTSELLER",
        }),
        makeOilVariant({
          id: "ses-1l-glass",
          size: "1 L",
          bottleType: "Glass Bottle",
          label: "1 Litre - Glass Bottle",
          salePrice: 569,
          litres: 1.0,
        }),
        makeOilVariant({
          id: "ses-1l-tin",
          size: "1 L",
          bottleType: "Metal Tin",
          label: "1 Litre - Metal Tin",
          salePrice: 589,
          litres: 1.0,
          tag: "MOST POPULAR",
        }),
        makeOilVariant({
          id: "ses-2l-tin",
          size: "2 L",
          bottleType: "Metal Tin",
          label: "2 Litre - Metal Tin",
          salePrice: 1199,
          litres: 2.0,
        }),
        makeOilVariant({
          id: "ses-5l-tin",
          size: "5 L",
          bottleType: "Metal Tin",
          label: "5 Litre - Metal Can",
          salePrice: 2699,
          litres: 5.0,
          tag: "BEST VALUE",
        }),
      ];
    }

    // Default fallback for any other oils (e.g. sunflower-oil)
    const base1L = product.sizePrices["1 L"] || 500;
    const base500 = product.sizePrices["500 ml"] || Math.round(base1L * 0.53);
    const base2L = product.sizePrices["2 L"] || Math.round(base1L * 2 - 30);
    const base5L = product.sizePrices["5 L"] || Math.round(base1L * 5 - 150);

    return [
      makeOilVariant({
        id: `${product.id}-500ml-plastic`,
        size: "500 ml",
        bottleType: "Plastic Bottle",
        label: "500 ml - Plastic Bottle",
        salePrice: base500,
        litres: 0.5,
      }),
      makeOilVariant({
        id: `${product.id}-500ml-glass`,
        size: "500 ml",
        bottleType: "Glass Bottle",
        label: "500 ml - Glass Bottle",
        salePrice: base500 + 50,
        litres: 0.5,
      }),
      makeOilVariant({
        id: `${product.id}-1l-plastic`,
        size: "1 L",
        bottleType: "Plastic Bottle",
        label: "1 Litre - Plastic Bottle",
        salePrice: base1L,
        litres: 1.0,
        tag: "BESTSELLER",
      }),
      makeOilVariant({
        id: `${product.id}-1l-glass`,
        size: "1 L",
        bottleType: "Glass Bottle",
        label: "1 Litre - Glass Bottle",
        salePrice: base1L + 50,
        litres: 1.0,
      }),
      makeOilVariant({
        id: `${product.id}-1l-tin`,
        size: "1 L",
        bottleType: "Metal Tin",
        label: "1 Litre - Metal Tin",
        salePrice: base1L + 70,
        litres: 1.0,
        tag: "MOST POPULAR",
      }),
      makeOilVariant({
        id: `${product.id}-2l-tin`,
        size: "2 L",
        bottleType: "Metal Tin",
        label: "2 Litre - Metal Tin",
        salePrice: base2L,
        litres: 2.0,
      }),
      makeOilVariant({
        id: `${product.id}-5l-tin`,
        size: "5 L",
        bottleType: "Metal Tin",
        label: "5 Litre - Metal Can",
        salePrice: base5L,
        litres: 5.0,
        tag: "BEST VALUE",
      }),
    ];
  }, [product, isOil]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    const bestseller = oilVariants.find((v) => v.id.includes("1l-plastic"));
    return bestseller?.id || oilVariants[0]?.id || "";
  });

  const selectedVariant =
    oilVariants.find((v) => v.id === selectedVariantId) ||
    oilVariants.find((v) => v.id.includes("1l-plastic")) ||
    oilVariants[0];

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
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
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (user) {
      if (user.name) setReviewerName(user.name);
      if (user.email) setReviewerEmail(user.email);
    }
  }, [user]);

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
        setReviewSubmitted(true);
        setComment("");
        setRating(5);
        setMediaFiles([]);
        const updatedRes = await fetch(`/api/reviews?productId=${product.id}`);
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setDbReviews(updatedData.reviews || []);
        }
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
    addToCart(product, selectedVariant.size, quantity, selectedVariant.bottleType, selectedVariant.salePrice);
    router.push("/checkout");
  };

  const handleBuyNow = () => {
    if (product.isComingSoon) return;
    addToCart(product, selectedVariant.size, quantity, selectedVariant.bottleType, selectedVariant.salePrice);
    router.push("/checkout");
  };

  const combinedReviews = [...(product.reviews || []), ...dbReviews];
  const totalCount = combinedReviews.length;
  const avgRating = totalCount > 0
    ? (combinedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalCount).toFixed(1)
    : "5.0";

  return (
    <div className="flex flex-col min-h-screen font-sans bg-brand-bg text-dark selection:bg-gold/20 font-light">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12 w-full space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-dark/60 flex items-center gap-2">
          <Link href="/" className="hover:text-forest transition-colors">
            Home
          </Link>
          <span className="text-dark/30">/</span>
          <Link href="/products" className="hover:text-forest transition-colors">
            Products
          </Link>
          <span className="text-dark/30">/</span>
          <span className="text-forest font-medium truncate max-w-[240px] sm:max-w-none" aria-current="page">
            {product.name}
          </span>
        </nav>

        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-forest/70 hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all products
        </Link>

        {/* ============================================================
            Top Grid: Gallery + Product Info
            ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Product Images */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full bg-white rounded-2xl border border-forest/10 overflow-hidden shadow-sm">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnail Strip */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all bg-white flex-shrink-0 ${
                      selectedImage === img ? "border-gold scale-95" : "border-forest/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Variant Selector */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-bold">
                  {product.category}
                </span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Save to wishlist"
                  className="p-2 text-forest/40 hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-forest font-semibold tracking-tight">
                {product.name}
              </h1>

              {/* Rating Summary Link */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(Number(avgRating)) ? "fill-gold text-gold" : "text-gold/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-dark/80">
                  {avgRating} ({totalCount} verified {totalCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>

            <p className="text-sm text-dark/70 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Price Display */}
            <div className="flex flex-wrap items-baseline gap-3 pt-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-forest">
                ₹{selectedVariant.salePrice}
              </span>
              {selectedVariant.mrp > selectedVariant.salePrice && (
                <>
                  <span className="text-base text-dark/40 line-through">
                    ₹{selectedVariant.mrp}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">
                    Save 10%
                  </span>
                </>
              )}
              {selectedVariant.unitPriceText && (
                <span className="text-xs font-mono font-medium text-forest/70">
                  ({selectedVariant.unitPriceText})
                </span>
              )}
            </div>

            {/* Variant Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-forest/70 block">
                Select Option:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {oilVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      selectedVariantId === v.id
                        ? "border-forest bg-forest/5 shadow-xs"
                        : "border-forest/10 hover:border-forest/30 bg-white"
                    }`}
                  >
                    {v.tag && (
                      <span className="absolute -top-2 right-2 text-[9px] px-1.5 py-0.5 bg-gold text-forest font-bold rounded uppercase tracking-wider">
                        {v.tag}
                      </span>
                    )}
                    <div className="font-semibold text-xs text-forest">{v.label}</div>
                    <div className="text-xs text-dark/60 mt-0.5 font-sans">
                      ₹{v.salePrice} {v.unitPriceText && <span className="text-[10px] text-dark/40">({v.unitPriceText})</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-forest/70">
                Quantity:
              </span>
              <div className="flex items-center border border-forest/20 rounded-lg bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-forest hover:bg-forest/5 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-semibold text-forest">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-forest hover:bg-forest/5 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <Button
                onClick={handleAddToCart}
                className="w-full py-3.5 text-xs uppercase tracking-widest font-semibold"
              >
                Add to Cart & Checkout
              </Button>
              <Button
                variant="outline"
                onClick={handleBuyNow}
                className="w-full py-3.5 text-xs uppercase tracking-widest font-semibold border-forest text-forest hover:bg-forest hover:text-white"
              >
                Instant Buy
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-forest/10 text-center">
              <div className="p-3 bg-white rounded-lg border border-forest/5 space-y-1">
                <Award className="w-4 h-4 text-gold mx-auto" />
                <div className="text-[10px] font-semibold text-forest uppercase tracking-wider">
                  100% Pure
                </div>
                <p className="text-[9px] text-dark/60">Zero Chemicals</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-forest/5 space-y-1">
                <Truck className="w-4 h-4 text-gold mx-auto" />
                <div className="text-[10px] font-semibold text-forest uppercase tracking-wider">
                  Fast Shipping
                </div>
                <p className="text-[9px] text-dark/60">All India Delivery</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-forest/5 space-y-1">
                <ShieldCheck className="w-4 h-4 text-gold mx-auto" />
                <div className="text-[10px] font-semibold text-forest uppercase tracking-wider">
                  Authentic
                </div>
                <p className="text-[9px] text-dark/60">Direct From Farm</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            Product Information Tabs & FAQs
            ============================================================ */}
        <section className="bg-white rounded-2xl border border-forest/10 p-6 md:p-10 space-y-8 shadow-xs">
          <div className="border-b border-forest/10 pb-4">
            <h2 className="text-xl sm:text-2xl font-serif text-forest font-semibold">
              Product Details & Sourcing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-dark/75 font-light">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-forest uppercase tracking-wider text-[11px] mb-1">
                  Extraction Method
                </h3>
                <p>
                  Cold wood-pressed using traditional Vagai wood ghanis operating at low speeds (&lt;14 RPM). Temperatures never exceed 45°C, ensuring natural enzymes and healthy fats remain intact.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-forest uppercase tracking-wider text-[11px] mb-1">
                  Storage & Shelf Life
                </h3>
                <p>
                  Store in a cool, dry place away from direct sunlight. Unopened: 9 months. Once opened, consume within 3–4 months for peak flavor and aroma.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-forest uppercase tracking-wider text-[11px] mb-1">
                  Purity Guarantee
                </h3>
                <p>
                  Single-origin raw materials sourced directly from family farms. Zero mineral oils, zero preservatives, zero artificial fragrances, zero chemical refining.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-forest uppercase tracking-wider text-[11px] mb-1">
                  Culinary Uses
                </h3>
                <p>
                  Ideal for traditional Indian tempering, daily curries, deep frying, dressing, and ancestral family recipes that require deep aromatic flavor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            Customer Reviews & Google Review Section
            ============================================================ */}
        <section id="reviews" className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest/10 pb-4">
            <div>
              <h2 className="text-2xl font-serif text-forest font-semibold">
                Customer Reviews
              </h2>
              <p className="text-xs text-dark/60 mt-1">
                Real feedback from verified households cooking with Root & Harvest.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <GoogleReviewButton variant="gold" />
              <Button
                onClick={() => {
                  setReviewSubmitted(false);
                  setShowReviewModal(true);
                }}
                className="py-2 px-4 text-xs font-semibold uppercase tracking-wider"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Write a Review
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {combinedReviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-forest/5 space-y-3">
                <Star className="w-8 h-8 text-gold/40 mx-auto" />
                <p className="text-sm text-dark/60">No reviews yet for this product.</p>
                <p className="text-xs text-dark/40">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combinedReviews.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="p-5 bg-white rounded-xl border border-forest/10 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gold">
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
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : r.date || "Verified Purchase"}
                      </span>
                    </div>

                    {r.comment && (
                      <p className="text-xs text-dark/80 leading-relaxed font-light whitespace-pre-line">
                        "{r.comment}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-forest/5 text-[10px] uppercase tracking-wider">
                      <span className="font-semibold text-forest">{r.name || r.author || "Verified Customer"}</span>
                      <span className="text-gold flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Verified Buyer
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Review Modal */}
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
                className="relative w-full max-w-lg bg-brand-bg border border-forest/10 p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto rounded-2xl"
              >
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="absolute top-6 right-6 text-dark/40 hover:text-forest transition-colors"
                  aria-label="Close review modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {reviewSubmitted ? (
                  /* Two-Step Post-Review Engagement */
                  <div className="space-y-6 text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
                      <Check className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif text-forest font-semibold">
                        Thank You for Supporting Root & Harvest ❤️
                      </h3>
                      <p className="text-xs text-dark/70 leading-relaxed max-w-md mx-auto">
                        Your review has been submitted and marked with a Verified Buyer badge!
                      </p>
                    </div>

                    <div className="p-5 bg-white rounded-xl border border-forest/10 space-y-3 text-left">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-gold fill-gold" />
                        <h4 className="text-xs font-semibold text-forest uppercase tracking-wider">
                          Share your experience on Google
                        </h4>
                      </div>
                      <p className="text-xs text-dark/70 leading-relaxed font-light">
                        As an independent family business, honest reviews on Google Maps help families across India discover real wood-pressed oils.
                      </p>
                      <div className="pt-2">
                        <GoogleReviewButton variant="gold" className="w-full justify-center" />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setShowReviewModal(false)}
                      className="w-full py-2.5 text-xs uppercase tracking-widest font-semibold border-forest/20"
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  /* Review Submission Form */
                  <>
                    <div className="space-y-2 border-b border-forest/10 pb-4">
                      <h3 className="text-2xl font-serif text-forest font-semibold">
                        Share Your Experience
                      </h3>
                      <p className="text-xs text-dark/60">
                        Reviewing <span className="font-semibold text-forest">{product.name}</span>. Your feedback helps other families make healthy choices.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                        {errorMsg}
                      </div>
                    )}

                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">
                          Your Rating
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
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
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
                            value={reviewerEmail}
                            onChange={(e) => setReviewerEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full p-2.5 bg-white border border-forest/10 text-xs focus:border-forest outline-none rounded"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-forest/60 font-semibold block">
                          Your Review
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What did you love about the taste, aroma, cooking experience, or packaging?"
                          className="w-full p-3 bg-white border border-forest/10 text-xs focus:border-forest outline-none rounded"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitLoading || uploading}
                        className="w-full py-3"
                      >
                        {submitLoading ? "Submitting Review..." : "Submit Review"}
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
