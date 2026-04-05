'use client';

import React from 'react';

interface LessonTitleProps {
  title: string;
  sectionTitle: string;
  isRTL?: boolean;
}

export default function LessonTitle({
  title,
  isRTL = false,
}: LessonTitleProps) {
  return (
    <div className="px-1 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className="text-lg font-bold text-gray-900 font-dubai leading-relaxed">
        {title}
      </h2>
    </div>
  );
}
