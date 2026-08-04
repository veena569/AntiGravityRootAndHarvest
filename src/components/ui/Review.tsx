import React from "react";
import { Star, CheckCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ReviewProps {
  author: string;
  rating: number;
  date: string;
  comment: string;
  title?: string;
  verified?: boolean;
  mediaUrl?: string;
  mediaType?: string;
  className?: string;
}

export const Review: React.FC<ReviewProps> = ({
  author,
  rating,
  date,
  comment,
  title,
  verified = false,
  mediaUrl,
  mediaType,
  className,
}) => {
  return (
    <div className={cn("flex flex-col space-y-4 rounded-sm bg-white p-6 md:p-8 shadow-sm border border-forest/5", className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-1 text-gold">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < rating ? "fill-current" : "fill-transparent opacity-30"}
              />
            ))}
          </div>
          {title && <h4 className="font-medium text-lg pt-1">{title}</h4>}
        </div>
        <span className="text-sm text-dark/50 whitespace-nowrap ml-4">
          {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <p className="text-dark/80 leading-relaxed">
        "{comment}"
      </p>

      {mediaUrl && (
        <div className="mt-2 rounded overflow-hidden max-w-sm border border-forest/10 bg-brand-bg/20">
          {mediaType === "video" ? (
            <video 
              src={mediaUrl} 
              controls 
              className="w-full max-h-60 object-contain bg-black"
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt="Review Attachment" 
              className="w-full max-h-60 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              onClick={() => window.open(mediaUrl, '_blank')}
            />
          )}
        </div>
      )}

      <div className="flex items-center space-x-2 pt-2 text-sm text-dark/70 font-medium border-t border-forest/5">
        <span>{author}</span>
        {verified && (
          <span className="flex items-center text-forest/70 text-xs uppercase tracking-wider">
            <CheckCircle size={14} className="mr-1" />
            Verified Buyer
          </span>
        )}
      </div>
    </div>
  );
};
