'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface CourseDefaultThumbnailProps {
  title: string;
  className?: string;
}

export default function CourseDefaultThumbnail({ title, className = '' }: CourseDefaultThumbnailProps) {
  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #10302b 0%, #1a4a42 50%, #10302b 100%)',
      }}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('/patterns/pattern-vertical-white.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/5" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-white font-dubai font-bold text-sm leading-relaxed line-clamp-2 max-w-[200px]">
          {title}
        </h3>
      </div>

      {/* Bottom gradient brand mark */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
    </div>
  );
}
