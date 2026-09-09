"use client";

import React from "react";
import { Star } from "lucide-react";
import { SEO_CONFIG } from "@/config/seo";

interface GoogleReviewButtonProps {
  className?: string;
  variant?: "primary" | "outline" | "gold" | "compact";
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const GoogleReviewButton: React.FC<GoogleReviewButtonProps> = ({
  className = "",
  variant = "primary",
  size = "md",
  text = "Review us on Google ❤️",
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-5 py-2.5 text-xs",
    lg: "px-7 py-3.5 text-sm",
  }[size];

  const variantClasses = {
    primary:
      "bg-[#1A73E8] hover:bg-[#1558B3] text-white shadow-sm border border-transparent",
    outline:
      "bg-white hover:bg-[#F8F9FA] text-[#1A73E8] border border-[#1A73E8]/30 hover:border-[#1A73E8]",
    gold:
      "bg-gold hover:bg-gold-dark text-white shadow-sm border border-transparent",
    compact:
      "bg-transparent hover:text-gold text-forest p-0 underline decoration-gold/60 underline-offset-4",
  }[variant];

  return (
    <a
      href={SEO_CONFIG.googleReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-wider uppercase transition-all duration-200 rounded-sm ${sizeClasses} ${variantClasses} ${className}`}
      title="Write a customer review for Root & Harvest on Google"
    >
      <div className="flex items-center text-amber-300">
        <Star className="w-3.5 h-3.5 fill-current" />
      </div>
      <span>{text}</span>
    </a>
  );
};
