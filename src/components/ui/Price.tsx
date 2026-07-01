import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PriceProps {
  amount: number;
  originalAmount?: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Price: React.FC<PriceProps> = ({
  amount,
  originalAmount,
  currency = "₹",
  className,
  size = "md",
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  };

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg md:text-xl",
    xl: "text-2xl md:text-3xl",
  };

  return (
    <div className={cn("flex items-end space-x-2", className)}>
      <span className={cn("font-medium text-dark", sizes[size])}>
        {currency}{formatPrice(amount)}
      </span>
      
      {originalAmount && originalAmount > amount && (
        <span className={cn("text-dark/40 line-through", 
          size === "xl" ? "text-lg mb-1" : 
          size === "lg" ? "text-sm mb-[2px]" : 
          "text-xs mb-[1px]"
        )}>
          {currency}{formatPrice(originalAmount)}
        </span>
      )}
    </div>
  );
};
