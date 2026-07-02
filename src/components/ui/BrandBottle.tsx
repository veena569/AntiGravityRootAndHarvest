import Image from "next/image";
import React from "react";

export function BrandBottle({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src="/brand-assets.jpg"
        alt="Root & Harvest Amber Bottle"
        fill
        priority
        className="object-cover object-[center_center] scale-[2.5]"
      />
    </div>
  );
}
