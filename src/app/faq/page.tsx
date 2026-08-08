"use client";

import React, { useState } from "react";
import { Plus, Minus, Info } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function FAQPage() {
  const faqCategories = [
    {
      title: "Wood Pressing Methods",
      items: [
        {
          q: "What is traditional wood pressing (Lakdi Ghani)?",
          a: "Lakdi Ghani is the ancient Indian method of oil extraction. It utilizes a massive wooden mortar and a slow-turning wooden pestle (we use seasoned vagai wood) to crush oilseeds. Because the process is mechanical and runs at extremely low speeds (under 14 RPM), it generates zero frictional heat. This keeps the oil cool, retaining all natural vitamins, vital fatty acids, and original nutty flavors."
        },
        {
          q: "How does cold pressed oil differ from refined oil?",
          a: "Commercial refined oils are extracted using chemical solvents (like hexane), treated with extreme heat (up to 200°C), bleached with chemicals to look uniform, and deodorized. This destroys all nutrients and creates harmful trans fats. Root & Harvest wood-pressed oil is extracted with no chemicals, no heat, and is simply sediment-filtered, keeping it completely raw and healthy."
        },
        {
          q: "What wood is used in your pressing Ghani?",
          a: "We use seasoned Vagai wood (Black Siris) for our mortar and pestle. Vagai is traditionally known for its cooling properties and high structural density, ensuring no friction heat is transferred to the oil during extraction."
        }
      ]
    },
    {
      title: "Agriculture & Sourcing",
      items: [
        {
          q: "Where do you source your sunflower seeds and other oilseeds?",
          a: "We source our premium oilseeds directly from small family farms. Sourcing from specific, mineral-rich soils gives our oils their signature light, nutrient-dense characteristics."
        },
        {
          q: "Are the crops organically grown?",
          a: "Our partner farmers follow natural, chemical-free farming methodologies. We verify soil quality reports and test incoming seed batches for pesticide residues before processing them in our mills."
        }
      ]
    },
    {
      title: "Batches & Shelf Life",
      items: [
        {
          q: "What is the shelf life of Root & Harvest oils?",
          a: "Because we add absolutely zero synthetic chemical preservatives or antioxidants (like TBHQ), our unrefined oils have a natural shelf life of 6 months from the date of packaging. Keep them stored in a cool place away from direct sunlight."
        },
        {
          q: "Why does the batch number matter?",
          a: "We run our wood-pressing mills in small, controlled batches. Each batch is stamped with a unique code (e.g. RH-GNT-2606A) representing the date, peanuts source farm, and quality lab clearance. You can look up your batch code in our database for trace details."
        },
        {
          q: "Is there sediment at the bottom of the bottle?",
          a: "Yes. Our oil is naturally filtered using gravity sedimentation (settling for 48 hours) rather than chemical clarification. The fine, cloud-like particles at the bottom are tiny peanut fibers which are highly nutritious and serve as proof of unrefined extraction."
        }
      ]
    },
    {
      title: "Shipments & Delivery",
      items: [
        {
          q: "Where do you ship, and what is the cost?",
          a: "We offer free shipping on all orders across India. Orders are shipped from our packaging hub in Hyderabad, India and delivered through express shipping partners within 3 to 5 business days."
        },
        {
          q: "Do you ship in plastic or glass containers?",
          a: "For volumes under 1L (like our 250ml, 500ml, and 1L bottles), we ship in premium recyclable glass bottles to preserve taste. For our 2L and 5L pantry packs, we use thick, food-grade, BPA-free recyclable cans to ensure safety during transit."
        }
      ]
    }
  ];

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-bg py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold block">
              SUPPORT CENTRE
            </span>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-forest font-light">
              Frequently Asked <span className="italic font-normal text-gold">Questions</span>
            </h1>
            <p className="text-sm text-dark/75 font-light max-w-xl mx-auto">
              Everything you need to know about our slow wood-pressed oils, sustainable farming practices, batch traceability, and logistics.
            </p>
          </div>

          {/* Categories and Questions */}
          <div className="space-y-12 text-left">
            {faqCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-6">
                <h3 className="text-sm uppercase tracking-widest text-gold font-semibold border-b border-forest/5 pb-2">
                  {cat.title}
                </h3>
                
                <div className="space-y-4">
                  {cat.items.map((item, itemIdx) => {
                    const key = `${catIdx}-${itemIdx}`;
                    const isOpen = openItems[key] || false;

                    return (
                      <div
                        key={itemIdx}
                        className="bg-white border border-forest/5 shadow-sm overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleItem(catIdx, itemIdx)}
                          className="w-full p-6 flex justify-between items-center text-left text-forest font-semibold hover:text-gold transition-colors focus:outline-none"
                        >
                          <span className="text-sm md:text-base font-serif">{item.q}</span>
                          <span className="shrink-0 p-1 bg-brand-bg ml-4">
                            {isOpen ? <Minus className="w-4 h-4 text-forest" /> : <Plus className="w-4 h-4 text-forest" />}
                          </span>
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-dark/80 font-light leading-relaxed border-t border-forest/5 mt-[-1px]">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Notice */}
          <div className="bg-white border border-forest/5 p-6 flex gap-4 items-center text-left">
            <Info className="w-6 h-6 text-gold shrink-0" />
            <p className="text-xs text-dark/80 font-light leading-relaxed">
              Have a highly specific batch or order query not listed here? Please contact our co-founders' dispatch directly at{" "}
              <a href="mailto:hello@rootandharvest.in" className="font-semibold text-forest hover:text-gold transition-colors">
                hello@rootandharvest.in
              </a>
              .
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
