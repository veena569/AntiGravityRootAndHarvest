import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INITIAL_PRODUCTS } from "@/data/products";
import { SEO_CONFIG } from "@/config/seo";
import { ProductDetailsClient } from "@/components/products/ProductDetailsClient";

interface Props {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = INITIAL_PRODUCTS.find((p) => p.id === params.id);

  if (!product) {
    return {
      title: "Product Not Found | Root & Harvest",
    };
  }

  const defaultPrice = product.sizes?.[0]
    ? product.sizePrices[product.sizes[0]]
    : undefined;

  const title = `${product.name} | Pure Wood Pressed - Root & Harvest`;
  const description =
    product.shortDescription ||
    product.description.substring(0, 160) + "...";
  const canonicalUrl = `${SEO_CONFIG.siteUrl}/products/${product.id}`;
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${SEO_CONFIG.siteUrl}${product.image}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      `Root and Harvest ${product.name}`,
      "wood pressed oil",
      "cold pressed oil Hyderabad",
      "Root & Harvest products",
      product.category,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SEO_CONFIG.brandName,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    other: {
      "product:price:amount": defaultPrice ? String(defaultPrice) : "",
      "product:price:currency": "INR",
    },
  };
}

export default function Page({ params }: Props) {
  const product = INITIAL_PRODUCTS.find((p) => p.id === params.id);

  if (!product || product.isComingSoon) {
    notFound();
  }

  const defaultSize = product.sizes?.[0] || "1 L";
  const defaultPrice = product.sizePrices[defaultSize] || 500;
  const canonicalUrl = `${SEO_CONFIG.siteUrl}/products/${product.id}`;
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${SEO_CONFIG.siteUrl}${product.image}`;

  const hasReviews = product.reviews && product.reviews.length > 0;
  const avgRating = hasReviews
    ? (
        product.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) /
        product.reviews.length
      ).toFixed(1)
    : "5.0";

  const schemaGraph: any[] = [
    {
      "@type": "Product",
      "@id": `${canonicalUrl}#product`,
      "name": product.name,
      "description": product.description,
      "image": [imageUrl],
      "sku": `RH-${product.id.toUpperCase()}`,
      "brand": {
        "@type": "Brand",
        "name": SEO_CONFIG.brandName,
      },
      "offers": {
        "@type": "Offer",
        "url": canonicalUrl,
        "priceCurrency": "INR",
        "price": defaultPrice,
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": SEO_CONFIG.brandName,
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
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
          "name": "Products",
          "item": `${SEO_CONFIG.siteUrl}/products`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": product.name,
          "item": canonicalUrl,
        },
      ],
    },
  ];

  if (hasReviews) {
    schemaGraph[0].aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": product.reviews.length,
      "bestRating": "5",
      "worstRating": "1",
    };

    schemaGraph[0].review = product.reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.author || "Verified Buyer",
      },
      "datePublished": r.date || "2026-01-01",
      "reviewBody": r.comment,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating || 5,
        "bestRating": "5",
        "worstRating": "1",
      },
    }));
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": schemaGraph,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient productId={params.id} />
    </>
  );
}
