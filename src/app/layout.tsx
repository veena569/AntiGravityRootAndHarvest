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
  description: "From Trusted Farms to Your Family. ROOT & HARVEST brings transparency, trust, premium quality, and authenticity back into every Indian kitchen. Founded by software engineers raised in farming families.",
  keywords: ["Root & Harvest", "Groundnut Oil", "Wood Pressed Oil", "Cold Pressed Oil", "Premium Indian Food", "Healthy Oils", "D2C food brand India"],
  authors: [{ name: "Root & Harvest Co-Founders" }],
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
  return (
    <html lang="en" className="scroll-smooth">
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
