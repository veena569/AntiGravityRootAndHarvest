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
    description: "Our signature oil is made from premium bold-variety groundnuts sourced from trusted rain-fed farms in Saurashtra. Cold pressed using traditional wood-pressing (Lakdi Ghani) methods in seasoned Vagai (Black Siris) wood pestles at speeds under 14 RPM, keeping the extraction temperature below 38°C to retain all natural antioxidants, phytosterols, and the authentic sweet nutty aroma of Gujarat's premium groundnuts.",
    shortDescription: "Traditional wood-pressed groundnut oil. 100% natural, single-source groundnuts, zero chemical refining, sediment-filtered.",
    image: "/images/groundnut-oil-1l.jpg",
    gallery: [
      "/images/groundnut-oil-1l.jpg",
      "/images/groundnut-oil-farm.jpg",
      "/images/groundnut-oil-press.jpg"
    ],
    sizes: ["250 ml", "500 ml", "1 L", "2 L", "5 L"],
    sizePrices: {
      "250 ml": 120,
      "500 ml": 220,
      "1 L": 410,
      "2 L": 800,
      "5 L": 1950
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
        comment: "This groundnut oil took me back to my grandmother's kitchen in Gujarat. It has that authentic sweet nutty aroma that you simply cannot get from modern refined oils. Excellent for frying pooris!",
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
    id: "mustard-oil",
    name: "Wood Pressed Black Mustard Oil",
    tagline: "Pungent, authentic, and naturally cold-extracted.",
    description: "Crafted from selected high-pungency black mustard seeds sourced from organic farmers in Rajasthan. Crushed slowly in traditional wooden mills, this oil possesses a sharp, robust aroma and rich color, preserving natural allyl isothiocyanate (the active compound) which aids digestion and circulation.",
    shortDescription: "Traditional wood-pressed black mustard oil (Sarso ka tel) with high pungency and nutrient retention.",
    image: "/images/mustard-oil-1l.jpg",
    gallery: ["/images/mustard-oil-1l.jpg"],
    sizes: ["500 ml", "1 L", "5 L"],
    sizePrices: {
      "500 ml": 160,
      "1 L": 290,
      "5 L": 1390
    },
    benefits: [
      "Strong antimicrobial and anti-inflammatory properties.",
      "High level of Omega-3 and Omega-6 essential fatty acids.",
      "Ideal for high-heat cooking, tempering, and pickling.",
      "Zero chemicals, artificial colors, or argemone oil contaminants."
    ],
    ingredients: "100% Pure Wood Pressed Black Mustard Seeds.",
    storage: "Store in a cool dry place. Keep the bottle airtight.",
    nutrition: [
      { label: "Energy", value: "899 kcal" },
      { label: "Total Fat", value: "99.9 g" },
      { label: "Saturated Fat", value: "11.6 g" },
      { label: "MUFA", value: "59.2 g" },
      { label: "PUFA", value: "29.1 g" },
      { label: "Allyl Isothiocyanate", value: "Natural Pungency Retention" }
    ],
    pressedOn: "June 22, 2026",
    packedOn: "June 25, 2026",
    bestBefore: "December 21, 2026",
    batchNumber: "RH-MST-2506A",
    rating: 4.8,
    reviewsCount: 96,
    reviews: [
      {
        author: "Preeti Banerjee",
        rating: 5,
        date: "2026-06-29",
        title: "Perfect for Bengali cooking!",
        comment: "Excellent pungency and smell. Cooked Machher Jhol and the flavor was outstanding. The absolute best sarso tel in the market.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "Why is it called black mustard oil?",
        a: "Black mustard seeds have a higher concentration of natural oils and essential pungent elements than yellow mustard, creating a richer flavor profile favored in traditional regional cooking."
      }
    ],
    category: "Oils",
    isComingSoon: true
  },
  {
    id: "himalayan-honey",
    name: "Raw Himalayan Honey",
    tagline: "Single-source wildflower nectar, unfiltered.",
    description: "Sourced from the high-altitude forests of the Himalayas. Collected by local traditional bee-keepers in small batches, our honey is never pasteurized, heated, or micro-filtered. It contains all natural pollen, enzymes, and trace minerals just as nature intended.",
    shortDescription: "Unheated, unfiltered wild-nectar honey. Packed with native enzymes and wild forest pollens.",
    image: "/images/honey-500g.jpg",
    gallery: ["/images/honey-500g.jpg"],
    sizes: ["250 g", "500 g"],
    sizePrices: {
      "250 g": 250,
      "500 g": 450
    },
    benefits: [
      "Natural immunity booster containing active floral enzymes.",
      "Soothing for throat infections and aids digestive wellness.",
      "100% pure wild nectar with zero added sugars, corn syrup, or flavorings."
    ],
    ingredients: "100% Pure, Raw Wildflower Honey.",
    storage: "Store at room temperature. Real honey naturally crystallizes over time. If crystallized, place the jar in warm water (below 40°C) to liquefy.",
    nutrition: [
      { label: "Energy", value: "320 kcal" },
      { label: "Carbohydrates", value: "80 g" },
      { label: "Natural Sugars", value: "78 g" },
      { label: "Protein", value: "0.3 g" },
      { label: "Sodium", value: "4 mg" }
    ],
    pressedOn: "N/A (Harvested: May 2026)",
    packedOn: "June 10, 2026",
    bestBefore: "June 09, 2028 (24 Months from Packing)",
    batchNumber: "RH-HNY-1006A",
    rating: 4.9,
    reviewsCount: 88,
    reviews: [
      {
        author: "Vikram Malhotra",
        rating: 5,
        date: "2026-06-25",
        title: "Distinct forest aroma",
        comment: "This has a complex wildflower aroma, unlike the store-bought honey which tastes like pure sugar syrup. Highly recommend the 500g glass jar.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "Why does my honey look solid/crystallized?",
        a: "Crystallization is the absolute signature of raw, unheated honey. Glucose naturally separates from water and forms crystals. Commercial honey is heated to high levels to destroy the crystals, which also kills the live enzymes. Crystallization shows our honey is completely alive and pure."
      }
    ],
    category: "Honey",
    isComingSoon: true
  }
];
