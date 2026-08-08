import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/components/layout/AuthProvider";
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
  title: "ROOT & HARVEST | Premium Wood Pressed Oils & Farm Fresh Foods",
  description: "From trusted farms to your family. ROOT & HARVEST brings 100% pure, traditional wood-pressed oils and authentic farm-fresh foods to every Indian kitchen.",
  keywords: ["Root & Harvest", "Sunflower Oil", "Wood Pressed Oil", "Cold Pressed Oil", "Premium Indian Food", "Healthy Oils", "D2C food brand India"],
  authors: [{ name: "Root & Harvest Co-Founders" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "ROOT & HARVEST | Honest Food, Naturally Crafted",
    description: "Generations of agricultural values combined with modern engineering precision.",
    type: "website",
    locale: "en_IN",
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
        "@type": "Organization",
        "@id": "https://www.rootandharvest.in/#organization",
        "name": "Root & Harvest",
        "url": "https://www.rootandharvest.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.rootandharvest.in/logo.jpg",
          "caption": "Root & Harvest Logo"
        },
        "image": "https://www.rootandharvest.in/logo.jpg",
        "sameAs": [
          "https://www.instagram.com/rootandharvest.in",
          "https://www.youtube.com/@rootandharvest"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.rootandharvest.in/#website",
        "url": "https://www.rootandharvest.in",
        "name": "ROOT & HARVEST",
        "description": "From Trusted Farms to Your Family. Premium Wood Pressed Oils.",
        "publisher": {
          "@id": "https://www.rootandharvest.in/#organization"
        },
        "hasPart": [
          {
            "@type": "WebPage",
            "name": "Our Products",
            "url": "https://www.rootandharvest.in/products"
          },
          {
            "@type": "WebPage",
            "name": "About Us",
            "url": "https://www.rootandharvest.in/about"
          },
          {
            "@type": "WebPage",
            "name": "Contact Us",
            "url": "https://www.rootandharvest.in/contact"
          },
          {
            "@type": "WebPage",
            "name": "FAQ",
            "url": "https://www.rootandharvest.in/faq"
          }
        ]
      }
    ]
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
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
