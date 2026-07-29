"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import { BrandBottle } from "@/components/ui/BrandBottle";

export default function WishlistPage() {
  const { wishlist, products, toggleWishlist, addToCart } = useApp();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-left"
    >
      <h2 className="text-xl font-serif text-forest mb-6">My Wishlist</h2>
      
      {wishlistedProducts.length === 0 ? (
        <div className="bg-white p-16 border border-forest/5 shadow-sm text-center flex flex-col items-center justify-center space-y-6">
          <Heart className="w-12 h-12 text-forest/20" strokeWidth={1} />
          <div>
            <p className="text-dark/60 text-sm">Your wishlist is currently empty.</p>
            <p className="text-dark/40 text-xs mt-2">Save items you love to view them later.</p>
          </div>
          <Link href="/products" className="inline-block mt-4 px-8 py-3 bg-forest text-white text-[10px] font-semibold uppercase tracking-widest hover:bg-forest-light transition-colors">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlistedProducts.map((product) => {
            const defaultSize = Object.keys(product.sizePrices)[0];
            const price = product.sizePrices[defaultSize];
            return (
              <div key={product.id} className="bg-white border border-forest/10 p-6 shadow-sm flex gap-6 relative group rounded-sm">
                <div className="relative w-24 h-24 bg-brand-bg/30 shrink-0 border border-forest/5 overflow-hidden flex items-center justify-center">
                  {product.id.includes("oil") ? (
                    <BrandBottle className="w-full h-full" />
                  ) : (
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      className="object-contain p-2"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-between flex-grow">
                  <div className="space-y-1">
                    <h3 className="font-serif text-forest font-semibold text-sm">{product.name}</h3>
                    <p className="text-xs text-dark/50">{product.tagline}</p>
                    <p className="text-sm font-medium text-black pt-1">₹{price}</p>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-forest/5 mt-4">
                    <button 
                      onClick={() => addToCart(product, defaultSize, 1)}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold text-forest hover:text-gold transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Bag
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
