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
    sizes: ["500 ml", "1 L", "2 L", "5 L"],
    sizePrices: {
      "500 ml": 225,
      "1 L": 449,
      "2 L": 900,
      "5 L": 2200
    },
    originalSizePrices: {
      "500 ml": 250,
      "1 L": 529,
      "2 L": 1050,
      "5 L": 2499
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
    rating: 5.0,
    reviewsCount: 4,
    reviews: [
      {
        author: "Thanvika Reddy",
        rating: 5,
        date: "2026-06-29",
        title: "Absolutely Pure and Natural",
        comment: "I have been looking for an honest wood pressed groundnut oil for cooking everyday meals. This is clean, doesn't smell chemically at all. Very pleased with the quality!",
        verified: true
      },
      {
        author: "Ananya Sharma",
        rating: 5,
        date: "2026-06-28",
        title: "Highly recommended for families",
        comment: "Switching to Root & Harvest has been the best decision for our family's health. The oil is light, clean, and tastes incredibly pure in all our traditional dishes.",
        verified: true
      },
      {
        author: "Chiranjeevi E",
        rating: 5,
        date: "2026-07-02",
        title: "Pure and Authentic Taste",
        comment: "The oil has a fresh, natural groundnut smell and a delicious taste. It looks pure and authentic, making it perfect for everyday cooking. I suggest to buy everyone.",
        verified: true
      },
      {
        author: "Rajesh Kumar",
        rating: 5,
        date: "2026-07-08",
        title: "Top Quality Wood Pressed Oil",
        comment: "Excellent wood pressed groundnut oil. Fresh, natural aroma and great taste in homestyle cooking.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "What does 'wood pressed' or 'cold pressed' actually mean?",
        a: "Wood pressing is the traditional Indian method (Lakdi Ghani) of oil extraction. We use a massive mortar and wooden pestle (vagai wood) that slowly crushes the groundnuts. Because it operates at under 14 RPM, no heat is generated, ensuring all sensitive vitamins, antioxidants, and pure flavors remain undamaged."
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
      "500 ml": 319,
      "1 L": 599,
      "2 L": 1149,
      "5 L": 2799
    },
    originalSizePrices: {
      "500 ml": 355,
      "1 L": 665,
      "2 L": 1275,
      "5 L": 3100
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
    isComingSoon: false
  },
  {
    id: "sunflower-oil",
    name: "Wood Pressed Sunflower Oil",
    tagline: "Slow-pressed in vagai wood, keeping nutrients pristine.",
    description: "Our signature oil is made from premium sunflower seeds sourced from trusted rain-fed farms. Cold pressed using traditional wood-pressing (Lakdi Ghani) methods in seasoned Vagai wood pestles, crushing seeds gently to retain natural antioxidants and vitamin E.",
    shortDescription: "Traditional wood-pressed sunflower oil. 100% natural, single-source sunflower seeds, unrefined, zero preservatives.",
    image: "/images/sunflower-oil-1l.jpg",
    gallery: ["/images/sunflower-oil-1l.jpg"],
    sizes: ["500 ml", "1 L"],
    sizePrices: {
      "500 ml": 235,
      "1 L": 465
    },
    originalSizePrices: {
      "500 ml": 260,
      "1 L": 510
    },
    benefits: [
      "Naturally high in Vitamin E, a powerful antioxidant.",
      "Rich in unsaturated fats which support heart health.",
      "Excellent high smoke point makes it highly stable for daily cooking."
    ],
    ingredients: "100% Pure Cold Pressed Sunflower Oil.",
    storage: "Store in a cool dry place. Keep airtight.",
    nutrition: [
      { label: "Energy", value: "898 kcal" },
      { label: "Total Fat", value: "99.8 g" },
      { label: "Saturated Fat", value: "10.3 g" },
      { label: "Vitamin E", value: "41.1 mg" }
    ],
    pressedOn: "June 20, 2026",
    packedOn: "June 22, 2026",
    bestBefore: "6 Months from Packing",
    batchNumber: "RH-SFL-2606A",
    rating: 5.0,
    reviewsCount: 38,
    reviews: [],
    faqs: [],
    category: "Oils",
    isComingSoon: true
  },
  {
    id: "groundnuts",
    name: "Organic Raw Groundnuts",
    tagline: "Bold variety farm-fresh organic peanuts.",
    description: "Sourced directly from rain-fed family farms in Andhra Pradesh and Telangana. Hand-shelled, sun-dried, and pesticide-free peanuts of premium quality.",
    shortDescription: "Organic raw groundnuts. Hand-shelled, pesticide-free, rich in protein and healthy fats.",
    image: "/images/groundnuts.jpg",
    gallery: ["/images/groundnuts.jpg"],
    sizes: ["500 g", "1 kg", "2 kg", "5 kg"],
    sizePrices: {
      "500 g": 99,
      "1 kg": 199,
      "2 kg": 399,
      "5 kg": 999
    },
    originalSizePrices: {
      "500 g": 120,
      "1 kg": 240,
      "2 kg": 480,
      "5 kg": 1199
    },
    benefits: [
      "Good source of plant protein – supports muscle and tissue maintenance.",
      "Contains healthy unsaturated fats – especially monounsaturated and polyunsaturated fats.",
      "Rich in fibre – supports healthy digestion and helps with fullness.",
      "Provides energy – calorie-dense and useful as an energy-rich food.",
      "Contains important nutrients – including magnesium, phosphorus, niacin, vitamin E and folate.",
      "Contains antioxidants – including vitamin E and other plant compounds.",
      "May support heart health when eaten as part of an overall healthy diet."
    ],
    ingredients: "100% Organic Raw Peanuts / Groundnuts.",
    storage: "Store in an airtight container in a cool, dry place.",
    nutrition: [
      { label: "Energy", value: "567 kcal" },
      { label: "Protein", value: "25.8 g" },
      { label: "Total Fat", value: "49.2 g" },
      { label: "Carbohydrates", value: "16.1 g" }
    ],
    pressedOn: "N/A",
    packedOn: "N/A",
    bestBefore: "6 Months from Packing",
    batchNumber: "RH-GNT-RAW",
    rating: 5.0,
    reviewsCount: 12,
    reviews: [],
    faqs: [],
    category: "Grains",
    isComingSoon: false
  },
  {
    id: "jaisriram-unpolished-rice",
    name: "Jai Sriram Unpolished Rice",
    tagline: "Heritage premium unpolished rice variety.",
    description: "At Root & Harvest, we believe rice should be more than just a staple — it should be clean, wholesome, and naturally good. Our Jai Sri Ram Rice is carefully selected for its quality, grain consistency, taste, and aroma. We focus on bringing you rice that is handled with care and processed thoughtfully, so you can enjoy the natural character of the grain in your everyday meals.",
    shortDescription: "Jai Sriram traditional unpolished rice. High fiber, rich in vitamins and minerals.",
    image: "/images/jaisriram-unpolished-rice.jpg",
    gallery: ["/images/jaisriram-unpolished-rice.jpg", "/images/why-jaisriram-rice.jpg"],
    sizes: ["1 kg", "5 kg"],
    sizePrices: {
      "1 kg": 95,
      "5 kg": 450
    },
    originalSizePrices: {
      "1 kg": 115,
      "5 kg": 520
    },
    benefits: [
      "Carefully Selected Grains: We choose quality grains with good size, texture, and consistency.",
      "Thoughtfully Processed: We avoid unnecessary polishing and processing to retain the natural goodness of the rice.",
      "Naturally Tasty & Aromatic: Perfect for everyday cooking, with a pleasant texture and traditional rice flavour.",
      "Clean & Carefully Packed: Handled and packed with attention to cleanliness and quality.",
      "From Our Selection to Your Kitchen: We believe in bringing trusted, quality staples from our source to your family."
    ],
    ingredients: "100% Raw Jai Sriram Unpolished Rice.",
    storage: "Store in a cool dry place. Keep airtight.",
    nutrition: [
      { label: "Energy", value: "354 kcal" },
      { label: "Protein", value: "7.5 g" },
      { label: "Total Fat", value: "1.8 g" },
      { label: "Carbohydrates", value: "77.2 g" }
    ],
    pressedOn: "N/A",
    packedOn: "N/A",
    bestBefore: "12 Months from Packing",
    batchNumber: "RH-JSR-UNP",
    rating: 5.0,
    reviewsCount: 18,
    reviews: [],
    faqs: [],
    category: "Grains",
    isComingSoon: false
  },
  {
    id: "jaisriram-polished-rice",
    name: "Jai Sriram Polished Rice",
    tagline: "Fine-grain premium polished white rice.",
    description: "At Root & Harvest, we believe rice should be more than just a staple — it should be clean, wholesome, and naturally good. Our Jai Sri Ram Rice is carefully selected for its quality, grain consistency, taste, and aroma. We focus on bringing you rice that is handled with care and processed thoughtfully, so you can enjoy the natural character of the grain in your everyday meals.",
    shortDescription: "Premium Jai Sriram polished white rice. Fluffy, fragrant, and highly digestible.",
    image: "/images/jaisriram-polished-rice.jpg",
    gallery: ["/images/jaisriram-polished-rice.jpg", "/images/why-jaisriram-rice.jpg"],
    sizes: ["1 kg", "5 kg"],
    sizePrices: {
      "1 kg": 88,
      "5 kg": 420
    },
    originalSizePrices: {
      "1 kg": 105,
      "5 kg": 490
    },
    benefits: [
      "Carefully Selected Grains: We choose quality grains with good size, texture, and consistency.",
      "Thoughtfully Processed: We avoid unnecessary processing and focus on retaining the natural character of the rice.",
      "Naturally Tasty & Aromatic: Perfect for everyday cooking, with a pleasant texture and traditional rice flavour.",
      "Clean & Carefully Packed: Handled and packed with attention to cleanliness and quality.",
      "From Our Selection to Your Kitchen: We believe in bringing trusted, quality staples from our source to your family."
    ],
    ingredients: "100% Raw Jai Sriram Polished Rice.",
    storage: "Store in a cool dry place. Keep airtight.",
    nutrition: [
      { label: "Energy", value: "351 kcal" },
      { label: "Protein", value: "6.8 g" },
      { label: "Total Fat", value: "0.4 g" },
      { label: "Carbohydrates", value: "80.0 g" }
    ],
    pressedOn: "N/A",
    packedOn: "N/A",
    bestBefore: "12 Months from Packing",
    batchNumber: "RH-JSR-POL",
    rating: 5.0,
    reviewsCount: 15,
    reviews: [],
    faqs: [],
    category: "Grains",
    isComingSoon: false
  }
];
