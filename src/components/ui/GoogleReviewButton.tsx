"use client";

import React from "react";
import { Star, ExternalLink } from "lucide-react";
import { SEO_CONFIG } from "@/config/seo";

interface GoogleReviewButtonProps {
  className?: string;
  variant?: "primary" | "outline" | "gold" | "compact";
  size?: "sm" | "md" | "lg";
  text?: string;
  showSupportingText?: boolean;
}

export const GoogleReviewButton: React.FC<GoogleReviewButtonProps> = ({
  className = "",
  variant = "gold",
  size = "md",
  text = "⭐ Review us on Google",
  showSupportingText = false,
}) => {
  const isDev = process.env.NODE_ENV !== "production";
  const reviewUrl =
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || SEO_CONFIG.googleReviewUrl;

  // If the official link is not configured yet:
  // In development: Display a clear placeholder indicator
  // In production: Cleanly hide the button until the genuine URL is supplied in environment
  if (!reviewUrl || !reviewUrl.trim()) {
    if (!isDev) {
      return null;
    }

    return (
      <div className={`flex flex-col items-center gap-1.5 ${className}`}>
        <span
          className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gold/70 text-forest bg-gold/10 text-xs font-semibold uppercase tracking-wider rounded-sm cursor-help"
          title="Setup note: Add NEXT_PUBLIC_GOOGLE_REVIEW_URL in your .env or Vercel environment to link your official Google Business Profile review dialog."
        >
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span>{text} (Configure URL in .env)</span>
        </span>
        {showSupportingText && (
          <p className="text-[11px] text-dark/60 italic max-w-sm text-center">
            Set NEXT_PUBLIC_GOOGLE_REVIEW_URL to enable the live Google review CTA.
          </p>
        )}
      </div>
    );
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-[11px]",
    md: "px-6 py-2.5 text-xs",
    lg: "px-8 py-3.5 text-sm",
  }[size];

  const variantClasses = {
    primary:
      "bg-forest hover:bg-forest-light text-white shadow-sm border border-transparent",
    outline:
      "bg-transparent hover:bg-forest/5 text-forest border border-forest/30 hover:border-forest",
    gold:
      "bg-gold hover:bg-gold-dark text-forest font-bold shadow-sm border border-transparent",
    compact:
      "bg-transparent hover:text-gold text-forest p-0 underline decoration-gold/60 underline-offset-4",
  }[variant];

  const buttonElement = (
    <a
      href={reviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-wider uppercase transition-all duration-200 rounded-sm ${sizeClasses} ${variantClasses} ${className}`}
      aria-label="Write an honest customer review for Root & Harvest on Google"
      title="Open the official Root & Harvest review form on Google (opens in a new tab)"
    >
      <Star className="w-3.5 h-3.5 fill-current text-amber-400 shrink-0" />
      <span>{text}</span>
      <ExternalLink className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
    </a>
  );

  if (showSupportingText) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        {buttonElement}
        <p className="text-xs text-dark/70 max-w-md leading-relaxed font-light">
          Enjoyed your experience with Root & Harvest? Share your honest feedback on Google. Your feedback helps our small business grow.
        </p>
      </div>
    );
  }

  return buttonElement;
};
