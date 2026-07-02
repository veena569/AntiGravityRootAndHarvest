import Image from "next/image";
import React from "react";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src="/brand-assets.jpg"
        alt="Root & Harvest Logo"
        fill
        priority
        className="object-cover object-[20%_center] scale-[3]"
      />
    </div>
  );
}
