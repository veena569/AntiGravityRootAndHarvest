import Image from "next/image";
import React from "react";

/**
 * BrandBottle — Uses the official groundnut oil bottle image.
 * Used everywhere an oil product needs a visual.
 */
export function BrandBottle({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src="/groundnut-oil-bottle.png"
        alt="Root & Harvest Wood Pressed Groundnut Oil"
        fill
        priority
        className="object-contain object-center"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
