import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  variant?: "display" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  font?: "serif" | "sans";
  as?: React.ElementType;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = "h2", variant, font = "serif", className, children, as, ...props }, ref) => {
    const Component = as || level;
    
    // If variant isn't specified, it defaults to the level
    const activeVariant = variant || level;

    const baseStyles = "text-dark tracking-tight";
    
    const fontStyles = {
      serif: "font-serif",
      sans: "font-sans",
    };

    const variantStyles = {
      display: "text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter leading-tight",
      h1: "text-4xl md:text-5xl lg:text-6xl font-normal leading-tight",
      h2: "text-3xl md:text-4xl font-normal leading-snug",
      h3: "text-2xl md:text-3xl font-medium",
      h4: "text-xl md:text-2xl font-medium",
      h5: "text-lg md:text-xl font-medium",
      h6: "text-base md:text-lg font-medium",
    };

    return (
      <Component
        ref={ref}
        className={cn(baseStyles, fontStyles[font], variantStyles[activeVariant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = "Heading";
