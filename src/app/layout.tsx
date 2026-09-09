import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { PageHitTracker } from "@/components/analytics/PageHitTracker";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rootandharvest.in"),
  title: {
    default: "ROOT & HARVEST | Pure Wood Pressed Oils & Farm-Fresh Foods",
    template: "%s | ROOT & HARVEST",
  },
  description:
    "100% natural wood-pressed groundnut oil, sesame oil, and authentic unpolished heritage grains. Cold-extracted below 14 RPM from trusted Indian farms directly to your kitchen.",
  keywords: [
    "Root and Harvest",
    "Root & Harvest",
    "Root and Harvest products",
    "Wood Pressed Groundnut Oil",
    "Wood Pressed Sesame Oil",
    "Cold Pressed Oil Hyderabad",
    "Lakdi Ghani Oil India",
    "Unpolished Rice",
    "Organic Groundnuts",
    "Traditional Indian Food",
  ],
  authors: [{ name: "Root & Harvest", url: "https://www.rootandharvest.in" }],
  creator: "Root & Harvest",
  publisher: "Root & Harvest",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "ROOT & HARVEST | Pure Wood Pressed Oils & Farm-Fresh Foods",
    description:
      "From trusted farms to your family. 100% pure, unrefined wood-pressed oils and natural grains, made in small batches.",
    url: "https://www.rootandharvest.in",
    siteName: "Root & Harvest",
    images: [
      {
        url: "https://www.rootandharvest.in/images/groundnut-oil-farm.jpg",
        width: 1200,
        height: 630,
        alt: "Root & Harvest Wood Pressed Oils and Farm Purity",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROOT & HARVEST | Pure Wood Pressed Oils",
    description:
      "Pure, unrefined wood-pressed oils and traditional grains sourced with care from trusted Indian farms.",
    images: ["https://www.rootandharvest.in/images/groundnut-oil-farm.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "Store", "LocalBusiness"],
        "@id": "https://www.rootandharvest.in/#organization",
        "name": "Root & Harvest",
        "legalName": "Root & Harvest",
        "url": "https://www.rootandharvest.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.rootandharvest.in/logo.jpg",
          "caption": "Root & Harvest Brand Logo",
        },
        "image": "https://www.rootandharvest.in/images/groundnut-oil-farm.jpg",
        "description":
          "Root & Harvest brings 100% pure, traditional wood-pressed oils and authentic farm-fresh heritage grains directly from trusted Indian farms to family kitchens.",
        "telephone": "+91-9121603832",
        "email": "hello@rootandharvest.in",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Central Park Phase -1",
          "addressLocality": "Serilingampally, Hyderabad",
          "addressRegion": "Telangana",
          "postalCode": "500019",
          "addressCountry": "IN",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "17.4834",
          "longitude": "78.3158",
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "10:00",
            "closes": "18:00",
          },
        ],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+91-9121603832",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": ["English", "Telugu", "Hindi"],
          },
        ],
        "sameAs": [
          "https://www.instagram.com/rootandharvest.in/",
          "https://www.youtube.com/@rootandharvest",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.rootandharvest.in/#website",
        "url": "https://www.rootandharvest.in",
        "name": "Root & Harvest",
        "description": "Pure Wood Pressed Oils & Farm Fresh Traditional Foods",
        "publisher": {
          "@id": "https://www.rootandharvest.in/#organization",
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.rootandharvest.in/products?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${cormorant.variable} ${inter.variable} font-sans antialiased bg-brand-bg text-dark min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <AppProvider>
            <PageHitTracker />
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
