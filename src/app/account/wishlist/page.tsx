"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-xl font-serif text-forest mb-6">My Wishlist</h2>
      
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
    </motion.div>
  );
}
