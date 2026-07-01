import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Heading } from "./Heading";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TimelineItem {
  year?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn("relative border-l border-forest/20 ml-3 md:ml-6", className)}>
      {items.map((item, index) => (
        <div key={index} className="mb-12 last:mb-0 relative pl-8 md:pl-12">
          {/* Timeline Dot/Icon */}
          <div className="absolute left-[-17px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg border border-forest/20 text-gold shadow-sm">
            {item.icon ? (
              <span className="scale-75">{item.icon}</span>
            ) : (
              <div className="h-2.5 w-2.5 rounded-full bg-gold" />
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            {item.year && (
              <span className="text-xs font-bold tracking-widest text-forest uppercase">
                {item.year}
              </span>
            )}
            <Heading level="h4" className="text-forest">
              {item.title}
            </Heading>
            <p className="text-dark/70 leading-relaxed text-sm md:text-base max-w-2xl">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
