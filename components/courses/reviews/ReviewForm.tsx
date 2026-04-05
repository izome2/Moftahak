'use client';

import React, { useState, useCallback } from 'react';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReviewFormProps {
  courseSlug: string;
  existingReview?: {
    rating: number;
    comment: string | null;
  } | null;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ courseSlug, existingReview, onReviewSubmitted }: ReviewFormProps) {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const rt = t.courses.review;

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isEditing = !!existingReview;

  const handleSubmit = useCallback(async () => {
    if (rating === 0 || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });

      if (res.ok) {
        setSubmitted(true);
        onReviewSubmitted?.();
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }, [rating, comment, courseSlug, submitting, onReviewSubmitted]);

  return (
    <div
      className="bg-primary/5 border border-primary/10 rounded-2xl p-5"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <h4 className="text-sm font-bold text-secondary font-dubai mb-3">
        {isEditing ? rt.editReview : rt.addReview}
      </h4>

      {/* Star rating */}
      <div className="mb-3">
        <p className="text-xs text-secondary/50 mb-2 font-dubai">{rt.rateThisCourse}</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  (hoveredStar || rating) >= star
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-secondary/20'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment textarea */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={rt.writeReview}
        maxLength={1000}
        rows={3}
        className="w-full bg-white border border-secondary/10 rounded-xl px-4 py-3 text-sm text-secondary font-dubai placeholder:text-secondary/30 resize-none focus:outline-none focus:border-primary/40 transition-colors"
      />

      {/* Submit button */}
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all',
            rating > 0
              ? 'bg-secondary text-white hover:bg-secondary/90'
              : 'bg-secondary/10 text-secondary/30 cursor-not-allowed'
          )}
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : submitted ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : null}
          {submitted ? rt.submitted : rt.submit}
        </button>
      </div>
    </div>
  );
}
