'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LessonLikeButtonProps {
  courseSlug: string;
  lessonId: string;
  likeLabel: string;
  likesLabel: (count: number) => string;
}

export default function LessonLikeButton({
  courseSlug,
  lessonId,
  likeLabel,
  likesLabel,
}: LessonLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [count, setCount] = useState(0);
  const [animatingLike, setAnimatingLike] = useState(false);
  const [animatingDislike, setAnimatingDislike] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = `/api/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonId)}/like`;

  // Fetch initial state
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          setLiked(data.liked);
          setDisliked(data.disliked);
          setCount(data.likesCount);
        }
      } catch {
        // ignore
      }
    })();
  }, [apiUrl]);

  const handleAction = useCallback(async (action: 'like' | 'dislike') => {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const prevLiked = liked;
    const prevDisliked = disliked;
    const prevCount = count;

    if (action === 'like') {
      setAnimatingLike(true);
      setTimeout(() => setAnimatingLike(false), 400);
      if (liked) {
        setLiked(false);
        setCount((c) => Math.max(c - 1, 0));
      } else {
        setLiked(true);
        setDisliked(false);
        setCount((c) => c + 1);
      }
    } else {
      setAnimatingDislike(true);
      setTimeout(() => setAnimatingDislike(false), 400);
      if (disliked) {
        setDisliked(false);
      } else {
        setDisliked(true);
        if (liked) {
          setLiked(false);
          setCount((c) => Math.max(c - 1, 0));
        }
      }
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setDisliked(data.disliked);
        setCount(data.likesCount);
      } else {
        setLiked(prevLiked);
        setDisliked(prevDisliked);
        setCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setDisliked(prevDisliked);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  }, [liked, disliked, count, loading, apiUrl]);

  return (
    <div className="flex items-center rounded-full bg-[#ead3b9]/25 overflow-hidden">
      {/* Like button */}
      <button
        onClick={() => handleAction('like')}
        disabled={loading}
        className={cn(
          'flex items-center gap-1.5 ps-4 pe-3 py-2 text-sm font-medium transition-all',
          liked
            ? 'text-primary-dark'
            : 'text-[#c4956a] hover:bg-[#ead3b9]/30'
        )}
      >
        <motion.div
          animate={animatingLike ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ThumbsUp className={cn('w-5 h-5', liked && 'fill-primary text-primary-dark')} />
        </motion.div>
        <span>{count > 0 ? likesLabel(count) : likeLabel}</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-[#ead3b9]/50" />

      {/* Dislike button */}
      <button
        onClick={() => handleAction('dislike')}
        disabled={loading}
        className={cn(
          'flex items-center px-3 py-2 transition-all',
          disliked
            ? 'text-primary-dark'
            : 'text-[#c4956a] hover:bg-[#ead3b9]/30'
        )}
      >
        <motion.div
          animate={animatingDislike ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ThumbsDown className={cn('w-5 h-5', disliked && 'fill-primary text-primary-dark')} />
        </motion.div>
      </button>
    </div>
  );
}
