import type { Metadata } from "next";
import { AboutView } from "@/components/about/AboutView";
import { SEO_CONFIG } from "@/config/seo";

export const metadata: Metadata = {
  title: "About Us | Our Story & Traditional Wood-Pressing - Root & Harvest",
  description:
    "Discover the Root & Harvest story. How two software engineers returned to their agricultural roots to bring authentic, unadulterated wood-pressed oils and traditional grains directly from Indian family farms to your kitchen.",
  keywords: [
    "About Root and Harvest",
    "Root & Harvest story",
    "wood pressed oil Hyderabad",
    "lakdi ghani oil Hyderabad",
    "traditional cold pressed oils",
    "farm to table oils",
    "Root and Harvest founders",
  ],
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/about`,
  },
  openGraph: {
    title: "About Us | The Root & Harvest Story",
    description:
      "Combining engineering precision with generational farming to bring uncompromised nourishment back to Indian families.",
    url: `${SEO_CONFIG.siteUrl}/about`,
    siteName: SEO_CONFIG.brandName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SEO_CONFIG.siteUrl}/images/family.jpg`,
        width: 1200,
        height: 900,
        alt: "Root & Harvest Founders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Root & Harvest | Traditional Wood-Pressed Oils",
    description:
      "The journey from code to crops. Pure, wood-pressed oils directly from trusted family farms.",
    images: [`${SEO_CONFIG.siteUrl}/images/family.jpg`],
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SEO_CONFIG.siteUrl}/about#webpage`,
        "url": `${SEO_CONFIG.siteUrl}/about`,
        "name": "About Root & Harvest",
        "description":
          "Root & Harvest was founded by software engineers who returned to their agricultural roots to revive traditional wood-pressed oils and unpolished grains.",
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
              "name": "About Us",
              "item": `${SEO_CONFIG.siteUrl}/about`
            }
          ]
        },
        "mainEntity": {
          "@type": "Organization",
          "name": SEO_CONFIG.brandName,
          "url": SEO_CONFIG.siteUrl,
          "logo": `${SEO_CONFIG.siteUrl}/logo.png`,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": SEO_CONFIG.address.street,
            "addressLocality": SEO_CONFIG.address.locality,
            "addressRegion": SEO_CONFIG.address.region,
            "postalCode": SEO_CONFIG.address.postalCode,
            "addressCountry": "IN"
          },
          "sameAs": [
            SEO_CONFIG.social.instagram,
            SEO_CONFIG.social.youtube,
            SEO_CONFIG.googleBusinessUrl
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
      <AboutView />
    </>
  );
}
