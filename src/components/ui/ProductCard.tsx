import React from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Heading } from "./Heading";
import { Price } from "./Price";
import { Badge } from "./Badge";
import { BrandBottle } from "./BrandBottle";

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
    <div className={cn("group flex flex-col h-full bg-white border border-forest/10 p-8 shadow-sm hover:shadow-md transition-all duration-300 rounded-none", className)}>
      <Link href={`/products/${id}`} className="relative block overflow-hidden bg-brand-bg aspect-[4/5] mb-6 border border-forest/5 shadow-sm w-full">
        {badge && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="primary">{badge}</Badge>
          </div>
        )}
        {id.includes("oil") ? (
          <BrandBottle className="w-full h-full absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-forest/0 transition-colors duration-300 group-hover:bg-forest/5" />
      </Link>
      
      <div className="flex flex-col flex-grow text-center items-center">
        <Link href={`/products/${id}`}>
          <h4 className="mb-2 text-xl font-serif text-forest transition-colors hover:text-gold uppercase tracking-wider font-semibold">
            {name}
          </h4>
        </Link>
        <p className="text-sm text-dark/60 mb-4 px-2 line-clamp-2 leading-relaxed">
          {tagline}
        </p>
        <div className="mt-auto pt-4 w-full flex justify-center border-t border-forest/5">
          <Price amount={price} size="lg" />
        </div>
      </div>
    </div>
  );
};
