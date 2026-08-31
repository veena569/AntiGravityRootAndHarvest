export const SHIPPING_CONFIG = {
  // Primary Promo Message
  announcementPromo: "10% OFF & FREE SHIPPING FOR THE FIRST 100 ORDERS IN HYDERABAD",

  // Regional Rules
  hyderabad: {
    isFree: true,
    label: "Free Local Delivery in Hyderabad",
    badge: "🚚 Free Shipping in Hyderabad",
  },

  restOfIndia: {
    flatFee: 100,
    freeShippingThreshold: 999,
    label: "Standard Shipping: ₹100 Across India",
    freeLabel: "Free Shipping (Orders > ₹999)",
    badge: "🚚 ₹100 Flat Shipping Fee Across India",
  },

  // Guarantee Badges
  guarantees: [
    "Wood Pressed in Seasoned Wooden Ghani",
    "Single-Source Farm Fresh Ingredients",
    "100% Unrefined & Zero Preservatives",
    "Instant Order Confirmation via Email & WhatsApp",
  ],
};
