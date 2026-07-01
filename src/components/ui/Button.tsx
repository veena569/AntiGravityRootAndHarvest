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
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest disabled:pointer-events-none disabled:opacity-50 rounded-sm";
    
    const variants = {
      primary: "bg-forest text-white hover:bg-forest-light shadow-sm",
      secondary: "bg-gold text-white hover:bg-gold-light shadow-sm",
      outline: "border border-forest/20 bg-transparent hover:bg-forest/5 text-forest",
      ghost: "hover:bg-forest/5 text-forest",
      link: "text-forest underline-offset-4 hover:underline",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-11 px-6 py-2 tracking-wide",
      lg: "h-14 px-8 text-base tracking-widest uppercase",
      icon: "h-9 w-9",
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
