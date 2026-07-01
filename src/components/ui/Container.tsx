import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", as: Component = "div", children, ...props }, ref) => {
    const sizes = {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-7xl",
      xl: "max-w-[96rem]",
      full: "max-w-full px-0",
    };

    return (
      <Component
        ref={ref}
        className={cn("mx-auto w-full px-4 md:px-6 lg:px-8", sizes[size], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";
