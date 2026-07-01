export const SIZES = {
  OILS: ["250 ml", "500 ml", "1 L", "2 L", "5 L"],
  HONEY: ["250 g", "500 g"],
};

export const COLORS = {
  brandBg: "#F8F5EF",
  forest: {
    DEFAULT: "#1E4A3A",
    light: "#2C6B54",
    dark: "#123025",
  },
  gold: {
    DEFAULT: "#B8903A",
    light: "#D4AF37",
    dark: "#8E6E27",
  },
  dark: "#2B2B2B",
  grey: "#F3F3F3",
};

export const NAVIGATION_LINKS = [
  { name: "Shop Oils", href: "/products?category=Oils" },
  { name: "Shop Honey", href: "/products?category=Honey" },
  { name: "Our Story", href: "/about" },
];

export const FOOTER_LINKS = {
  shop: [
    { name: "Groundnut Oil", href: "/products/groundnut-oil" },
    { name: "Mustard Oil", href: "/products/mustard-oil" },
    { name: "Himalayan Honey", href: "/products/himalayan-honey" },
  ],
  support: [
    { name: "Track Order", href: "/account" },
    { name: "FAQ", href: "/faq" },
    { name: "Shipping Policy", href: "/shipping" },
    { name: "Returns & Refunds", href: "/returns" },
    { name: "Contact Us", href: "/contact" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Farms", href: "/farms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};
