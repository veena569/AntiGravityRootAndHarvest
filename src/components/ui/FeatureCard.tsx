import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Heading } from "./Heading";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  align?: "left" | "center";
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className,
  align = "left",
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-white p-8 md:p-10 rounded-sm shadow-sm border border-forest/5 transition-transform hover:-translate-y-1 duration-300",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {icon && (
        <div className="mb-6 text-gold">
          {icon}
        </div>
      )}
      <Heading level="h4" className="mb-3 text-forest">
        {title}
      </Heading>
      <p className="text-dark/70 leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </div>
  );
};
