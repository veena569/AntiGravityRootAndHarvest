import type { Metadata } from "next";
import { ReviewsView } from "@/components/reviews/ReviewsView";
import { SEO_CONFIG } from "@/config/seo";
import { INITIAL_PRODUCTS } from "@/data/products";

export const metadata: Metadata = {
  title: "Customer Reviews & Verified Ratings | Root & Harvest",
  description:
    "Read genuine, verified 5-star customer ratings and household experiences for Root & Harvest wood-pressed cooking oils and unpolished heritage grains.",
  keywords: [
    "Root and Harvest reviews",
    "Root & Harvest customer reviews",
    "wood pressed oil reviews",
    "cold pressed oil ratings",
    "Root and Harvest feedback",
    "verified buyer ratings",
  ],
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/reviews`,
  },
  openGraph: {
    title: "Customer Reviews & Verified Ratings | Root & Harvest",
    description:
      "Genuine customer stories and verified ratings for Root & Harvest wood pressed oils and farm staples.",
    url: `${SEO_CONFIG.siteUrl}/reviews`,
    siteName: SEO_CONFIG.brandName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SEO_CONFIG.siteUrl}/images/groundnut-oil-farm.jpg`,
        width: 1200,
        height: 630,
        alt: "Root & Harvest Customer Reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Root & Harvest Customer Reviews & Verified Ratings",
    description:
      "Read verified household experiences with Root & Harvest pure wood pressed oils.",
    images: [`${SEO_CONFIG.siteUrl}/images/groundnut-oil-farm.jpg`],
  },
};

export default function Page() {
  const allStaticReviews = INITIAL_PRODUCTS.flatMap((p) =>
    (p.reviews || []).map((r) => ({
      name: r.author,
      rating: r.rating || 5,
      comment: r.comment,
      date: r.date || "2026-01-15",
      productName: p.name,
    }))
  );

  const totalReviews = allStaticReviews.length;
  const avgRating = (
    allStaticReviews.reduce((sum, r) => sum + r.rating, 0) / (totalReviews || 1)
  ).toFixed(1);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${SEO_CONFIG.siteUrl}/reviews#product-catalog`,
        "name": "Root & Harvest Pure Wood Pressed Oils & Farm-Fresh Foods",
        "description":
          "100% pure, unrefined wood-pressed cooking oils and farm-fresh natural grains sourced directly from Indian farms.",
        "image": `${SEO_CONFIG.siteUrl}/images/groundnut-oil-farm.jpg`,
        "brand": {
          "@type": "Brand",
          "name": SEO_CONFIG.brandName,
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": avgRating,
          "reviewCount": totalReviews,
          "bestRating": "5",
          "worstRating": "1",
        },
        "review": allStaticReviews.slice(0, 10).map((r) => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": r.name || "Verified Customer",
          },
          "datePublished": r.date,
          "reviewBody": r.comment,
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": r.rating,
            "bestRating": "5",
            "worstRating": "1",
          },
        })),
      },
      {
        "@type": "CollectionPage",
        "@id": `${SEO_CONFIG.siteUrl}/reviews#webpage`,
        "url": `${SEO_CONFIG.siteUrl}/reviews`,
        "name": "Root & Harvest Customer Reviews",
        "description":
          "Verified customer reviews and feedback for Root & Harvest wood-pressed oils and natural food products.",
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${SEO_CONFIG.siteUrl}/#website`,
          "name": SEO_CONFIG.brandName,
          "url": SEO_CONFIG.siteUrl,
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SEO_CONFIG.siteUrl,
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Customer Reviews",
              "item": `${SEO_CONFIG.siteUrl}/reviews`,
            },
          ],
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ReviewsView />
    </>
  );
}
