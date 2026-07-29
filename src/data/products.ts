export interface Review {
  author: string;
  rating: number;
  date: string;
  comment: string;
  title?: string;
  verified: boolean;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  shortDescription: string;
  image: string;
  gallery: string[];
  sizes: string[];
  sizePrices: Record<string, number>;
  originalSizePrices?: Record<string, number>;
  benefits: string[];
  ingredients: string;
  storage: string;
  nutrition: { label: string; value: string }[];
  pressedOn: string;
  packedOn: string;
  bestBefore: string;
  batchNumber: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  faqs: FAQ[];
  category: string;
  isComingSoon?: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "groundnut-oil",
    name: "Wood Pressed Groundnut Oil",
    tagline: "Slow-pressed in vagai wood, keeping nutrients pristine.",
    description: "Our signature oil is made from premium bold-variety groundnuts sourced from trusted rain-fed farms. Cold pressed using traditional wood-pressing (Lakdi Ghani) methods in seasoned Vagai (Black Siris) wood pestles at speeds under 14 RPM, keeping the extraction temperature below 38°C to retain all natural antioxidants, phytosterols, and the authentic sweet nutty aroma of premium groundnuts.",
    shortDescription: "Traditional wood-pressed groundnut oil. 100% natural, single-source groundnuts, zero chemical refining, sediment-filtered.",
    image: "/images/groundnut-oil-1l.jpg",
    gallery: [
      "/images/groundnut-oil-1l.jpg",
      "/images/groundnut-oil-farm.jpg",
      "/images/groundnut-oil-press.jpg"
    ],
    sizes: ["500 ml", "1 L", "2 L"],
    sizePrices: {
      "500 ml": 249,
      "1 L": 499,
      "2 L": 900
    },
    originalSizePrices: {
      "500 ml": 275,
      "1 L": 550,
      "2 L": 1000
    },
    benefits: [
      "Rich in Monounsaturated Fatty Acids (MUFA) which support healthy cholesterol levels.",
      "Naturally high in Vitamin E, a powerful antioxidant that protects cells from oxidative stress.",
      "High smoke point (~232°C) makes it ideal for everyday Indian deep frying, sautéing, and baking.",
      "Zero trans fats, zero hydrogenated fats, completely free of chemical preservatives or mineral oils.",
      "Traditional wood extraction preserves native bioactive compounds (resveratrol and phytosterols)."
    ],
    ingredients: "100% Pure Cold Pressed Groundnut Oil (from select bold-grade raw peanuts).",
    storage: "Store in a cool, dry place away from direct sunlight. Close the lid tightly after use. Since it is unrefined, natural sedimentation may occur at the bottom, which is a hallmark of absolute purity.",
    nutrition: [
      { label: "Energy", value: "898 kcal" },
      { label: "Total Fat", value: "99.8 g" },
      { label: "Saturated Fat", value: "16.8 g" },
      { label: "Monounsaturated Fat (MUFA)", value: "48.2 g" },
      { label: "Polyunsaturated Fat (PUFA)", value: "34.8 g" },
      { label: "Trans Fat", value: "0 g" },
      { label: "Vitamin E", value: "15.7 mg" },
      { label: "Cholesterol", value: "0 mg" }
    ],
    pressedOn: "June 24, 2026",
    packedOn: "June 26, 2026",
    bestBefore: "December 23, 2026 (6 Months from Packing)",
    batchNumber: "RH-GNT-2606A",
    rating: 4.9,
    reviewsCount: 142,
    reviews: [
      {
        author: "Ananya Sharma",
        rating: 5,
        date: "2026-06-28",
        title: "Smells like my childhood",
        comment: "This groundnut oil took me back to my grandmother's kitchen. It has that authentic sweet nutty aroma that you simply cannot get from modern refined oils. Excellent for frying pooris!",
        verified: true
      },
      {
        author: "Dr. Rajesh Iyer",
        rating: 5,
        date: "2026-06-27",
        title: "Pure and Unadulterated",
        comment: "As a health professional, I am highly selective about cooking fats. Root & Harvest delivers what they promise. You can see the slight cloudiness at the bottom, which proves it is unrefined and raw. Highly recommended.",
        verified: true
      },
      {
        author: "Devendra Patel",
        rating: 4,
        date: "2026-06-25",
        title: "Very Premium Packing",
        comment: "Tastes premium, and the bottle design is gorgeous. Minimalist and luxury packaging. The 5L container has an excellent spout that doesn't drip.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "What does 'wood pressed' or 'cold pressed' actually mean?",
        a: "Wood pressing is the traditional Indian method (Lakdi Ghani) of oil extraction. We use a massive mortar and wooden pestle (vagai wood) that slowly crushes the groundnuts. Because it operates at under 14 RPM, no heat is generated, ensuring all sensitive vitamins, antioxidants, and pure flavors remain undamaged."
      },
      {
        q: "Why is the oil slightly cloudy, and is there sediment at the bottom?",
        a: "Refined commercial oils are treated with harsh chemicals, bleaching agents, and extreme heat to make them look uniform. Our oil is naturally filtered using gravity sedimentation. The slight cloudiness and bottom sediment are tiny, nutritious peanut fibers that prove our oil is completely raw and unprocessed."
      },
      {
        q: "What is the shelf life of Root & Harvest oils?",
        a: "Because we add absolutely zero synthetic chemical preservatives, our oils have a natural shelf life of 6 months. Keep the bottle tightly capped and stored in a cool place to maintain peak freshness."
      }
    ],
    category: "Oils",
    isComingSoon: false
  },
  {
    id: "sesame-oil",
    name: "Wood Pressed Sesame Oil",
    tagline: "Ancient Indian superfood oil. Rich, nutty, deeply nourishing.",
    description: "Our premium Sesame Oil (Til Oil) is slowly extracted using organic sesame seeds from select farms in southern India. Cold pressed in traditional wooden Ghani mills at speeds below 14 RPM to preserve natural sesamol, sesamolin, and rich lignans. It possesses an authentic golden color, high smoke point, and a highly aromatic nutty flavor.",
    shortDescription: "Traditional wood-pressed sesame oil. 100% natural, single-source sesame seeds, unrefined, zero preservatives.",
    image: "/images/sesame-oil-1l.jpg",
    gallery: [
      "/images/sesame-oil-1l.jpg"
    ],
    sizes: ["500 ml", "1 L", "2 L", "5 L"],
    sizePrices: {
      "500 ml": 1,
      "1 L": 490,
      "2 L": 960,
      "5 L": 2350
    },
    benefits: [
      "Rich in powerful antioxidants (sesamol and sesamolin) that support heart health.",
      "Excellent source of healthy unsaturated fats and vitamin E.",
      "Traditional extraction retains native flavor and key bioactive compounds.",
      "Highly stable for everyday cooking, sautéing, and oil pulling."
    ],
    ingredients: "100% Pure Cold Pressed Sesame Oil.",
    storage: "Store in a cool, dry place away from direct sunlight. Close the cap tightly after use.",
    nutrition: [
      { label: "Energy", value: "898 kcal" },
      { label: "Total Fat", value: "99.8 g" },
      { label: "Saturated Fat", value: "14.2 g" },
      { label: "Monounsaturated Fat (MUFA)", value: "39.7 g" },
      { label: "Polyunsaturated Fat (PUFA)", value: "41.7 g" },
      { label: "Trans Fat", value: "0 g" },
      { label: "Vitamin E", value: "14.1 mg" },
      { label: "Cholesterol", value: "0 mg" }
    ],
    pressedOn: "June 23, 2026",
    packedOn: "June 25, 2026",
    bestBefore: "December 22, 2026 (6 Months from Packing)",
    batchNumber: "RH-SES-2506A",
    rating: 4.8,
    reviewsCount: 64,
    reviews: [
      {
        author: "Meera Krishnan",
        rating: 5,
        date: "2026-06-28",
        title: "Smells wonderful!",
        comment: "The aroma of this sesame oil is so rich and authentic. It matches the quality of stone-pressed oil from Tamil Nadu perfectly. Excellent for cooking and oil pulling.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "What is sesame oil commonly used for?",
        a: "Sesame oil is a staple in Asian and South Indian cooking, known for its deep nutty aroma and nutritional density. It is also highly recommended in Ayurveda for daily oil pulling (Kavala)."
      }
    ],
    category: "Oils",
    isComingSoon: true
  },
  {
    id: "coconut-oil",
    name: "Cold Pressed Coconut Oil",
    tagline: "Pure virgin coconut oil from Kerala's coastal farms.",
    description: "Our pure cold pressed coconut oil is made from select coconuts sourced directly from organic coastal farms in Kerala. Extracted slowly to retain natural MCTs, vitamins, and a fresh tropical aroma. Zero heat, chemical bleaching, or mineral oils.",
    shortDescription: "100% natural, single-source cold pressed coconut oil, unrefined and nutrient-rich.",
    image: "/images/coconut-oil-1l.jpg",
    gallery: ["/images/coconut-oil-1l.jpg"],
    sizes: ["500 ml", "1 L"],
    sizePrices: {
      "500 ml": 1,
      "1 L": 520
    },
    benefits: [
      "Rich in medium-chain triglycerides (MCTs) which provide instant energy.",
      "Excellent source of healthy fats for cooking and hair/skin nourishment.",
      "Naturally high smoke point makes it highly stable for daily cooking."
    ],
    ingredients: "100% Pure Cold Pressed Coconut Oil.",
    storage: "Store in a cool dry place. Keep airtight.",
    nutrition: [
      { label: "Energy", value: "898 kcal" },
      { label: "Total Fat", value: "99.8 g" },
      { label: "Saturated Fat", value: "86.5 g" },
      { label: "MCTs", value: "Present" }
    ],
    pressedOn: "N/A",
    packedOn: "N/A",
    bestBefore: "6 Months from Packing",
    batchNumber: "RH-CCN-MOCK",
    rating: 5.0,
    reviewsCount: 0,
    reviews: [],
    faqs: [],
    category: "Oils",
    isComingSoon: true
  }
];
