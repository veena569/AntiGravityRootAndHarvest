export const SEO_CONFIG = {
  siteUrl: "https://www.rootandharvest.in",
  brandName: "Root & Harvest",
  brandTagline: "Pure by Nature. Pressed with Tradition.",
  defaultTitle: "ROOT & HARVEST | Traditional Wood Pressed Oils & Natural Grains",
  defaultDescription:
    "Naturally wood-pressed groundnut & sesame oils and heritage grains. Cold-extracted in small batches below 14 RPM from trusted Indian farms directly to your family kitchen.",
  
  // Google Business Profile & Reviews Configuration
  // Can be configured via environment variables in production
  googleReviewUrl:
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
    "https://search.google.com/local/writereview?placeid=RootAndHarvestIndia",
  googleBusinessUrl:
    process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL ||
    "https://maps.google.com/?q=Root+and+Harvest+Hyderabad",
  googlePlaceId: process.env.GOOGLE_PLACE_ID || "",
  
  // Official Business Identifiers & Contact Details
  business: {
    name: "Root & Harvest",
    legalName: "Root & Harvest",
    telephone: "+91-9121603832",
    email: "hello@rootandharvest.in",
    address: {
      streetAddress: "Central Park Phase -1",
      addressLocality: "Serilingampally, Hyderabad",
      addressRegion: "Telangana",
      postalCode: "500019",
      addressCountry: "IN",
    },
    geo: {
      latitude: "17.4834",
      longitude: "78.3158",
    },
    openingHours: ["Mo-Sa 10:00-18:00"],
    priceRange: "₹₹",
  },

  // Direct address alias for quick schema generation
  address: {
    street: "Central Park Phase -1",
    streetAddress: "Central Park Phase -1",
    locality: "Serilingampally, Hyderabad",
    addressLocality: "Serilingampally, Hyderabad",
    region: "Telangana",
    addressRegion: "Telangana",
    postalCode: "500019",
    country: "IN",
    addressCountry: "IN",
  },

  // Official Social Media Profiles (Used in Schema sameAs and footer links)
  social: {
    instagram: "https://www.instagram.com/rootandharvest.in/",
    youtube: "https://www.youtube.com/@rootandharvest",
    whatsapp: "https://wa.me/919121603832",
  },
};
