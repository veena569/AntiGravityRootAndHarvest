import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl" | "hero";
  as?: React.ElementType;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = "lg", as: Component = "section", children, ...props }, ref) => {
    const spacings = {
      none: "py-0",
      sm: "py-8 md:py-12",
      md: "py-12 md:py-20",
      lg: "py-16 md:py-24 lg:py-32",
      xl: "py-24 md:py-32 lg:py-48",
      hero: "pt-32 pb-16 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32",
    };

    return (
      <Component
        ref={ref}
        className={cn(spacings[spacing], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Section.displayName = "Section";
