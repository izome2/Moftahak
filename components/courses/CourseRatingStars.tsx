'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface CourseRatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}

const SIZES = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function CourseRatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  count,
}: CourseRatingStarsProps) {
  const sizeClass = SIZES[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const filled = i < Math.floor(rating);
          const halfFilled = !filled && i < rating;
          return (
            <Star
              key={i}
              className={`${sizeClass} ${
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : halfFilled
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-gray-200 fill-gray-100'
              }`}
            />
          );
        })}
      </div>
      {showValue && rating > 0 && (
        <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </div>
  );
}
