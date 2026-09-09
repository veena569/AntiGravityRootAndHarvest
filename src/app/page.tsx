import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { SEO_CONFIG } from "@/config/seo";

export const metadata: Metadata = {
  title: "Root & Harvest | 100% Pure Wood Pressed Oils & Farm-Fresh Traditional Foods",
  description:
    "Authentic wood pressed groundnut & sesame oils, unpolished heritage rice, and natural farm staples. Cold-extracted below 45°C in wooden ghanis, preserving essential nutrients and natural aroma.",
  keywords: [
    "Root and Harvest",
    "Root & Harvest",
    "Root and Harvest products",
    "wood pressed oil",
    "cold pressed groundnut oil",
    "cold pressed sesame oil",
    "mara chekku oil Hyderabad",
    "wood pressed oil India",
    "unpolished rice",
    "pure cooking oils",
    "traditional food brand",
  ],
  alternates: {
    canonical: SEO_CONFIG.siteUrl,
  },
  openGraph: {
    title: "Root & Harvest | Pure Wood Pressed Oils & Farm-Fresh Foods",
    description:
      "Crafted with love and tradition. Authentic wood pressed cooking oils and natural grains direct from Indian family farms to your kitchen.",
    url: SEO_CONFIG.siteUrl,
    siteName: SEO_CONFIG.brandName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SEO_CONFIG.siteUrl}/logo.png`,
        width: 800,
        height: 600,
        alt: "Root & Harvest - Pure Wood Pressed Oils",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Root & Harvest | Pure Wood Pressed Oils & Traditional Foods",
    description:
      "Authentic cold wood-pressed oils & farm-fresh staples. Direct from trusted Indian farms to your doorstep.",
    images: [`${SEO_CONFIG.siteUrl}/logo.png`],
  },
};

export default function Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What makes wood-pressed oil different from refined oil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Refined oils undergo chemical bleaching, deodorization at 200°C+, and hexane extraction, destroying antioxidants and healthy fats. Root & Harvest wood-pressed oils are crushed slowly in wooden ghanis at under 14 RPM, keeping temperatures below 45°C to preserve natural vitamins, flavor, and purity."
        }
      },
      {
        "@type": "Question",
        "name": "Are Root & Harvest products 100% pure with no additives?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, 100%. We never add preservatives, mineral oils, artificial coloring, or chemical solvents. What you see is pure, single-ingredient cold wood-pressed oil and naturally harvested farm grains."
        }
      },
      {
        "@type": "Question",
        "name": "Where do you source your seeds and raw produce?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We partner directly with family farms across Telangana and Gujarat. Our groundnuts and sesame seeds are naturally sun-dried and rigorously tested for aflatoxins and moisture before extraction."
        }
      },
      {
        "@type": "Question",
        "name": "How should wood-pressed oil be stored and what is the shelf life?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Store in a cool, dry place away from direct sunlight. Because our oils are natural and preservative-free, they are best consumed within 6 to 9 months from the date of extraction."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I share my customer review for Root & Harvest?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can leave a verified review directly on any product page or visit our dedicated Reviews page. You can also support us by reviewing Root & Harvest on our official Google Business Profile on Google Maps."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeView />
    </>
  );
}
