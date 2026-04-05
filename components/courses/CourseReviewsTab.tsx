'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Star, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import CourseRatingStars from './CourseRatingStars';
import { useTranslation } from '@/hooks/useTranslation';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    image: string | null;
  };
}

interface CourseReviewsTabProps {
  slug: string;
  reviewsCount: number;
  averageRating: number;
}

function ReviewForm({ slug, onSubmitted }: { slug: string; onSubmitted: () => void }) {
  const t = useTranslation();
  const ct = t.courses;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error');
        return;
      }
      setSubmitted(true);
      onSubmitted();
    } catch {
      setError('Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center text-sm text-green-700">
        {ct.review.submitted}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-900">{ct.review.rateThisCourse}</p>
      {/* Star rating */}
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={ct.review.writeReview}
        maxLength={1000}
        rows={3}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-shadow"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {ct.review.submit}
      </button>
    </div>
  );
}

export default function CourseReviewsTab({ slug, reviewsCount, averageRating }: CourseReviewsTabProps) {
  const t = useTranslation();
  const ct = t.courses;
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localReviewsCount, setLocalReviewsCount] = useState(reviewsCount);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchReviews = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}/reviews?page=${pageNum}&limit=10`);
      if (!res.ok) return;
      const data = await res.json();
      if (pageNum === 1) {
        setReviews(data.reviews);
        if (data.isEnrolled !== undefined) setIsEnrolled(data.isEnrolled);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }
      setHasMore(data.reviews.length === 10);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-2xl bg-[#ead3b9]/20 border-2 border-[#ead3b9]/70 shadow-lg overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ead3b9]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ead3b9]/40 flex items-center justify-center">
              <Star className="w-[18px] h-[18px] text-[#c4956a]" />
            </div>
            <h3 className="text-base font-bold text-secondary">{ct.reviews || 'التقييمات'}</h3>
          </div>
          {averageRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              <CourseRatingStars rating={averageRating} size="sm" />
              <span className="text-xs text-gray-400">({localReviewsCount})</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Review form */}
          {session && isEnrolled ? (
            <ReviewForm
              slug={slug}
              onSubmitted={() => {
                setLocalReviewsCount((c) => c + 1);
                setPage(1);
                fetchReviews(1);
              }}
            />
          ) : session ? null : (
            <p className="text-sm text-gray-400 text-center py-2">{ct.review.loginRequired}</p>
          )}

          {/* Reviews list */}
          {loading && reviews.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{ct.noReviews}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-sm font-bold text-gray-600 overflow-hidden">
                    {review.user.image ? (
                      <img src={review.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{review.user.firstName[0]}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="mt-0.5">
                      <CourseRatingStars rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Load more */}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full py-2.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors disabled:opacity-50 rounded-xl hover:bg-primary/5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'المزيد...'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
