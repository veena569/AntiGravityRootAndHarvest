import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "outline" | "success";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: "bg-forest text-white",
      secondary: "bg-gold text-white",
      outline: "border border-forest/20 text-forest",
      success: "bg-green-100 text-green-800",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
