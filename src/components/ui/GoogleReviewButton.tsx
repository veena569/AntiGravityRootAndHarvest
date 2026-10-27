"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

interface GoogleReviewButtonProps {
  className?: string;
  variant?: "primary" | "outline" | "gold" | "compact";
  size?: "sm" | "md" | "lg";
  text?: string;
  href?: string;
}

export const GoogleReviewButton: React.FC<GoogleReviewButtonProps> = ({
  className = "",
  variant = "gold",
  size = "md",
  text = "Customer Reviews ⭐",
  href = "/reviews",
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-5 py-2.5 text-xs",
    lg: "px-7 py-3.5 text-sm",
  }[size];

  const variantClasses = {
    primary:
      "bg-forest hover:bg-forest-light text-white shadow-sm border border-transparent",
    outline:
      "bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white",
    gold:
      "bg-gold hover:bg-gold-dark text-forest font-bold shadow-sm border border-transparent",
    compact:
      "bg-transparent hover:text-gold text-forest p-0 underline decoration-gold/60 underline-offset-4",
  }[variant];

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-wider uppercase transition-all duration-200 rounded-sm ${sizeClasses} ${variantClasses} ${className}`}
      title="Verified Customer Reviews for Root & Harvest"
    >
      <div className="flex items-center text-amber-300">
        <Star className="w-3.5 h-3.5 fill-current" />
      </div>
      <span>{text}</span>
    </Link>
  );
};
