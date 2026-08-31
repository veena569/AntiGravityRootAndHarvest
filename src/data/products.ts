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
    tagline: "Slow-pressed in traditional wooden Ghani, keeping natural nutrients pristine.",
    description: "Our signature Wood Pressed Groundnut Oil is extracted from premium bold-variety groundnuts sourced from rain-fed farms. Extracted using traditional wooden Ghani methods (Lakdi Ghani) with seasoned Vagai wood pestles at low speeds under 14 RPM. This gentle extraction keeps temperatures below 38°C, preserving natural antioxidants, Vitamin E, and the authentic sweet nutty aroma of fresh groundnuts.",
    shortDescription: "Traditional wood-pressed groundnut oil. 100% natural, single-source groundnuts, unrefined, zero chemical additives.",
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
      "Rich in Monounsaturated Fatty Acids (MUFA) which support healthy lipid levels.",
      "Naturally contains Vitamin E, a known dietary antioxidant.",
      "High smoke point (~232°C) makes it ideal for everyday Indian deep frying, sautéing, and tempering.",
      "Zero trans fats, zero hydrogenated fats, free of chemical refining or mineral oils.",
      "Traditional wooden Ghani extraction preserves native aroma and natural fats."
    ],
    ingredients: "100% Pure Wood Pressed Groundnut Oil (from select bold-grade raw peanuts).",
    storage: "Store in a cool, dry place away from direct sunlight. Close the cap tightly after use. Since it is unrefined, natural sedimentation may settle at the bottom, which is a hallmark of authentic wood-pressed purity.",
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
        q: "What does 'wood pressed' mean?",
        a: "Wood pressing (Lakdi Ghani) is the traditional Indian method of oil extraction. A massive mortar and wooden pestle slowly crush the seeds under 14 RPM. No external heat or chemicals are used, preserving the natural nutrients, antioxidants, and authentic taste."
      }
    ],
    category: "Oils",
    isComingSoon: false
  },
  {
    id: "sesame-oil",
    name: "Wood Pressed Sesame Oil",
    tagline: "Ancient Indian superfood oil. Rich, nutty, deeply nourishing.",
    description: "Our premium Wood Pressed Sesame Oil (Til Oil) is slowly extracted using natural sesame seeds sourced from select farms in southern India. Pressed in traditional wooden Ghani mills at low speeds below 14 RPM to preserve natural sesamol, sesamolin, and rich lignans. It possesses an authentic golden color, high thermal stability, and a rich nutty aroma.",
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
      "Rich in natural sesame antioxidants (sesamol and sesamolin).",
      "Good source of healthy unsaturated fatty acids and Vitamin E.",
      "Traditional wooden Ghani extraction retains authentic flavor and native oil density.",
      "Versatile for everyday South Indian cooking, tempering, and Ayurvedic oil pulling."
    ],
    ingredients: "100% Pure Wood Pressed Sesame Oil.",
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
    reviewsCount: 4,
    reviews: [
      {
        author: "Meera Krishnan",
        rating: 5,
        date: "2026-06-28",
        title: "Smells wonderful!",
        comment: "The aroma of this sesame oil is so rich and authentic. It matches the quality of traditional wood pressed oil perfectly.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "What is sesame oil commonly used for?",
        a: "Sesame oil is a staple in South Indian cooking, known for its deep nutty aroma and nutritional density. It is also traditional for daily oil pulling (Kavala)."
      }
    ],
    category: "Oils",
    isComingSoon: false
  },
  {
    id: "sunflower-oil",
    name: "Wood Pressed Sunflower Oil",
    tagline: "Slow-pressed in wooden Ghani, keeping natural goodness intact.",
    description: "Our Wood Pressed Sunflower Oil is extracted from premium sunflower seeds sourced from trusted rain-fed farms. Pressed gently using traditional wooden Ghani pestles at low temperatures, retaining natural Vitamin E and unsaturated fats without chemical refining.",
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
      "High in Vitamin E, a natural dietary antioxidant.",
      "Rich in unsaturated fats for balanced daily cooking.",
      "Light texture and high smoke point for sautéing and roasting."
    ],
    ingredients: "100% Pure Wood Pressed Sunflower Oil.",
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
    reviewsCount: 2,
    reviews: [],
    faqs: [],
    category: "Oils",
    isComingSoon: true
  },
  {
    id: "groundnuts",
    name: "Organic Raw Groundnuts",
    tagline: "Bold variety farm-fresh peanuts.",
    description: "Sourced directly from rain-fed family farms in Telangana and Andhra Pradesh. Hand-shelled and sun-dried, these premium raw groundnuts offer a rich nutty taste, natural crunchy texture, and high protein density. Perfect for roasting, making homemade wood-pressed peanut butter, or adding to traditional poha, upma, and chutneys.",
    shortDescription: "Hand-shelled organic raw peanuts. Sun-dried, protein-dense, rich in healthy unsaturated fats.",
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
      "Rich Source of Plant Protein: Supports muscle maintenance and balanced daily nutrition.",
      "Contains Healthy Unsaturated Fats: Monounsaturated and polyunsaturated fats for energy.",
      "Good Source of Dietary Fibre: Supports healthy digestion and satiety.",
      "Essential Minerals & Micronutrients: Provides magnesium, phosphorus, niacin, and folate.",
      "Sun-Dried & Hand-Shelled: Carefully selected without chemical preservatives or artificial treatments."
    ],
    ingredients: "100% Organic Raw Peanuts / Groundnuts.",
    storage: "Store in an airtight container in a cool, dry place.",
    nutrition: [
      { label: "Energy", value: "567 kcal" },
      { label: "Protein", value: "25.8 g" },
      { label: "Total Fat", value: "49.2 g" },
      { label: "Carbohydrates", value: "16.1 g" },
      { label: "Dietary Fibre", value: "8.5 g" }
    ],
    pressedOn: "N/A",
    packedOn: "N/A",
    bestBefore: "6 Months from Packing",
    batchNumber: "RH-GNT-RAW",
    rating: 5.0,
    reviewsCount: 3,
    reviews: [
      {
        author: "Venkatesh Rao",
        rating: 5,
        date: "2026-07-12",
        title: "Fresh and Bold Quality Peanuts",
        comment: "Very clean raw groundnuts without any empty shells or bad seeds. Roasted them for snacks and the flavor is amazing.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "Are these groundnuts raw or roasted?",
        a: "These are 100% raw, sun-dried groundnuts. You can roast them, boil them, or use them directly in daily recipes."
      }
    ],
    category: "Grains",
    isComingSoon: false
  },
  {
    id: "jaisriram-unpolished-rice",
    name: "Jai Sriram Unpolished Rice",
    tagline: "Heritage premium unpolished rice variety.",
    description: "At Root & Harvest, we select our Jai Sriram Unpolished Rice for its natural bran layer, rich fiber content, and traditional grain character. Unpolished rice retains its outer nutrient layer, providing a hearty texture, natural earthy flavor, and wholesome goodness for healthy everyday family meals.",
    shortDescription: "Traditional Jai Sriram unpolished rice. Retains natural bran layer, high fiber, rich in minerals.",
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
      "Retains Natural Bran Layer: High in natural dietary fiber which aids healthy digestion.",
      "Unpolished & Unrefined: Free of harsh chemical polishing to protect natural grain character.",
      "Rich in Minerals: Provides natural B-vitamins, iron, and magnesium.",
      "Nourishing Daily Staple: Delicious earthy flavor and satisfying firm texture."
    ],
    ingredients: "100% Raw Jai Sriram Unpolished Rice.",
    storage: "Store in a cool dry place. Keep airtight.",
    nutrition: [
      { label: "Energy", value: "354 kcal" },
      { label: "Protein", value: "7.5 g" },
      { label: "Total Fat", value: "1.8 g" },
      { label: "Carbohydrates", value: "77.2 g" },
      { label: "Dietary Fibre", value: "3.4 g" }
    ],
    pressedOn: "N/A",
    packedOn: "N/A",
    bestBefore: "12 Months from Packing",
    batchNumber: "RH-JSR-UNP",
    rating: 5.0,
    reviewsCount: 4,
    reviews: [
      {
        author: "Kavitha N",
        rating: 5,
        date: "2026-07-15",
        title: "Wholesome & Healthy Rice",
        comment: "Excellent unpolished rice! Cooks well with a nice texture and keeps us full for longer.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "How should I cook unpolished rice?",
        a: "Soak the unpolished rice in water for 30 minutes before cooking. Use 1:2.5 ratio of rice to water for optimal fluffy texture."
      }
    ],
    category: "Grains",
    isComingSoon: false
  },
  {
    id: "jaisriram-polished-rice",
    name: "Jai Sriram Polished Rice",
    tagline: "Fine-grain premium polished white rice.",
    description: "Our Jai Sriram Polished Rice is carefully milled to deliver clean, fluffy white rice grains that cook evenly and digest easily. Selected from premium farm harvests, this polished white rice is thoroughly cleaned and processed under strict hygiene standards, offering a soft texture and delicate aroma perfect for everyday family meals, biryanis, and traditional curries.",
    shortDescription: "Premium Jai Sriram polished white rice. Light, fluffy texture, easy to digest, perfect for daily meals.",
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
      "Clean & Easy to Digest: Light on digestion, making it ideal for daily family meals.",
      "Uniform Fluffy Grains: Cooks up non-sticky with excellent grain separation.",
      "Hygienically Processed: Thoroughly de-stoned, cleaned, and packed under strict quality standards.",
      "Aromatic & Versatile: Pairs delightfully with sambar, rasam, dal, and everyday South Indian curries."
    ],
    ingredients: "100% Raw Jai Sriram Polished White Rice.",
    storage: "Store in a cool dry place. Keep airtight.",
    nutrition: [
      { label: "Energy", value: "351 kcal" },
      { label: "Protein", value: "6.8 g" },
      { label: "Total Fat", value: "0.4 g" },
      { label: "Carbohydrates", value: "80.0 g" },
      { label: "Dietary Fibre", value: "0.6 g" }
    ],
    pressedOn: "N/A",
    packedOn: "N/A",
    bestBefore: "12 Months from Packing",
    batchNumber: "RH-JSR-POL",
    rating: 5.0,
    reviewsCount: 3,
    reviews: [
      {
        author: "Suresh P",
        rating: 5,
        date: "2026-07-20",
        title: "Very soft and aromatic",
        comment: "Great quality white rice. Grains are long and cook softly. Perfect for daily lunch.",
        verified: true
      }
    ],
    faqs: [
      {
        q: "Is this rice suitable for daily cooking?",
        a: "Yes, Jai Sriram Polished Rice is a staple white rice variety prized for its light digestion, soft texture, and versatility."
      }
    ],
    category: "Grains",
    isComingSoon: false
  }
];
