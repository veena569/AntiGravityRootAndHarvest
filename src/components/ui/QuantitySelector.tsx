import React from "react";
import { Minus, Plus } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  className,
  size = "md",
}) => {
  const sizes = {
    sm: "h-8 px-2 text-sm",
    md: "h-11 px-4 text-base",
    lg: "h-14 px-6 text-lg",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <div className={cn("inline-flex items-center border border-forest/20 rounded-sm bg-transparent", className)}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        className={cn(
          "flex items-center justify-center text-forest transition-colors hover:bg-forest/5 disabled:opacity-30 disabled:hover:bg-transparent",
          sizes[size],
          "px-3"
        )}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSizes[size]} />
      </button>
      
      <span className={cn("flex items-center justify-center font-medium text-dark min-w-[2rem]", sizes[size], "px-0")}>
        {quantity}
      </span>
      
      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        className={cn(
          "flex items-center justify-center text-forest transition-colors hover:bg-forest/5 disabled:opacity-30 disabled:hover:bg-transparent",
          sizes[size],
          "px-3"
        )}
        aria-label="Increase quantity"
      >
        <Plus size={iconSizes[size]} />
      </button>
    </div>
  );
};
