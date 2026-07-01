import React from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Heading } from "./Heading";
import { Price } from "./Price";
import { Badge } from "./Badge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ProductCardProps {
  id: string;
  name: string;
  tagline: string;
  image: string;
  price: number;
  badge?: string;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  tagline,
  image,
  price,
  badge,
  className,
}) => {
  return (
    <div className={cn("group flex flex-col", className)}>
      <Link href={`/products/${id}`} className="relative block overflow-hidden bg-white aspect-[4/5] rounded-sm mb-6 border border-forest/5 shadow-sm">
        {badge && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="primary">{badge}</Badge>
          </div>
        )}
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-forest/0 transition-colors duration-300 group-hover:bg-forest/5" />
      </Link>
      
      <div className="flex flex-col flex-grow text-center items-center">
        <Link href={`/products/${id}`}>
          <Heading level="h4" className="mb-2 text-forest transition-colors hover:text-gold">
            {name}
          </Heading>
        </Link>
        <p className="text-sm text-dark/60 mb-4 px-4 line-clamp-2 leading-relaxed">
          {tagline}
        </p>
        <div className="mt-auto pt-2">
          <Price amount={price} size="lg" />
        </div>
      </div>
    </div>
  );
};
