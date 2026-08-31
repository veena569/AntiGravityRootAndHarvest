import React from "react";
import { Product } from "@/data/products";

interface ProductPriceProps {
  product: Product;
  selectedSize?: string;
  className?: string;
  showOriginal?: boolean;
}

export const getLowestPrice = (product: Product): { current: number; original?: number; size: string } => {
  const sizes = product.sizes || [];
  if (sizes.length === 0) return { current: 0, size: "" };

  let lowestSize = sizes[0];
  let lowestPrice = product.sizePrices[lowestSize] || 0;

  for (const s of sizes) {
    const price = product.sizePrices[s];
    if (price && price < lowestPrice) {
      lowestPrice = price;
      lowestSize = s;
    }
  }

  const originalPrice = product.originalSizePrices ? product.originalSizePrices[lowestSize] : undefined;
  return { current: lowestPrice, original: originalPrice, size: lowestSize };
};

export const ProductPrice: React.FC<ProductPriceProps> = ({
  product,
  selectedSize,
  className = "",
  showOriginal = true,
}) => {
  if (selectedSize && product.sizePrices[selectedSize]) {
    const current = product.sizePrices[selectedSize];
    const original = product.originalSizePrices ? product.originalSizePrices[selectedSize] : undefined;

    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        <span className="font-serif font-bold text-dark">₹{current}</span>
        {showOriginal && original && original > current && (
          <span className="text-xs text-dark/40 line-through">₹{original}</span>
        )}
      </div>
    );
  }

  const lowest = getLowestPrice(product);
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="text-[11px] text-dark/50 font-sans uppercase tracking-wider font-semibold">From</span>
      <span className="font-serif font-bold text-dark">₹{lowest.current}</span>
      {showOriginal && lowest.original && lowest.original > lowest.current && (
        <span className="text-xs text-dark/40 line-through">₹{lowest.original}</span>
      )}
    </div>
  );
};
