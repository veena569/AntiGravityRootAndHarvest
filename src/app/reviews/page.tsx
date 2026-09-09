import type { Metadata } from "next";
import { ReviewsView } from "@/components/reviews/ReviewsView";
import { SEO_CONFIG } from "@/config/seo";

export const metadata: Metadata = {
  title: "Customer Reviews & Experiences | Root & Harvest",
  description:
    "Read genuine, verified reviews from families across India using Root & Harvest wood-pressed cooking oils and unpolished grains. Share your own experience or review us on Google.",
  keywords: [
    "Root and Harvest reviews",
    "Root & Harvest customer reviews",
    "wood pressed oil reviews",
    "cold pressed oil ratings",
    "Root and Harvest feedback",
    "Google reviews Root & Harvest",
  ],
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/reviews`,
  },
  openGraph: {
    title: "Customer Reviews & Experiences | Root & Harvest",
    description:
      "Genuine customer stories and reviews for Root & Harvest wood pressed oils and farm staples.",
    url: `${SEO_CONFIG.siteUrl}/reviews`,
    siteName: SEO_CONFIG.brandName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SEO_CONFIG.siteUrl}/logo.png`,
        width: 800,
        height: 600,
        alt: "Root & Harvest Customer Reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Root & Harvest Customer Reviews",
    description:
      "Read verified household experiences with Root & Harvest pure wood pressed oils.",
    images: [`${SEO_CONFIG.siteUrl}/logo.png`],
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
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
          "url": SEO_CONFIG.siteUrl
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SEO_CONFIG.siteUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Customer Reviews",
              "item": `${SEO_CONFIG.siteUrl}/reviews`
            }
          ]
        }
      }
    ]
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
