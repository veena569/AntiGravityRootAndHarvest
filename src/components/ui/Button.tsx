import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  href?: string;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap text-xs uppercase tracking-widest font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 rounded-none h-12";
    
    const variants = {
      primary: "bg-forest text-white hover:bg-forest-light shadow-sm border border-transparent",
      secondary: "border border-forest bg-white text-forest hover:bg-forest/5",
      outline: "border border-forest bg-white text-forest hover:bg-forest/5",
      ghost: "hover:bg-forest/5 text-forest h-auto px-0 py-0",
      link: "text-forest underline-offset-4 hover:underline h-auto px-0 py-0",
    };

    const sizes = {
      sm: "px-4 text-xs h-10",
      md: "px-8 tracking-widest h-12",
      lg: "px-10 text-sm tracking-widest h-14",
      icon: "h-9 w-9 px-0",
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
