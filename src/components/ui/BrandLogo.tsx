import React from "react";
import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Emblem Container (Circular cropped frame of the uploaded logo.jpg) */}
      <div className="relative w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-full overflow-hidden border border-forest/10 bg-brand-bg/50">
        <Image
          src="/logo.jpg"
          alt="Root & Harvest Emblem"
          fill
          sizes="(max-width: 768px) 44px, 48px"
          className="object-cover transform transition-transform duration-300 hover:rotate-3"
          priority
        />
      </div>

      {/* Brand wordmark - Responsive Layout */}
      <div className="ml-3.5 flex flex-col leading-tight">
        {/* Mobile: Larger font size for better visibility, Desktop: Premium tracking */}
        <span className="font-serif text-forest font-bold tracking-widest text-[15px] sm:text-base md:text-lg uppercase leading-none">
          Root &amp; Harvest
        </span>
        {/* Tagline: Visible on desktop (md and up), hidden on mobile to prevent clutter */}
        <span className="hidden md:inline-block text-gold text-[9px] tracking-[0.22em] uppercase font-semibold leading-none mt-1">
          Wood Pressed Goodness
        </span>
      </div>
    </div>
  );
}
