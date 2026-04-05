'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

import { useSession } from 'next-auth/react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface CommentUser {
  id: string;
  firstName: string;
  lastName: string;
  image: string | null;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: CommentUser;
  replies?: CommentData[];
}

interface CommentsSectionProps {
  courseSlug: string;
  lessonId: string;
  enrolled: boolean;
}

export default function CommentsSection({ courseSlug, lessonId, enrolled }: CommentsSectionProps) {
  const { data: session } = useSession();
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses.comments;

  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchComments = useCallback(async (pageNum: number, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await fetch(
        `/api/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonId)}/comments?page=${pageNum}&limit=10`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (append) {
        setComments((prev) => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      setTotal(data.total);
      setHasMore(data.comments.length === 10);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [courseSlug, lessonId]);

  useEffect(() => {
    setPage(1);
    setComments([]);
    fetchComments(1);
  }, [fetchComments]);

  const handleSubmitComment = useCallback(async (content: string, parentId?: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonId)}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, parentId }),
        }
      );
      if (!res.ok) return false;
      const data = await res.json();

      if (parentId) {
        // Add reply to parent
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies || []), data.comment] };
            }
            return c;
          })
        );
      } else {
        // Add new top-level comment
        setComments((prev) => [data.comment, ...prev]);
        setTotal((prev) => prev + 1);
      }
      return true;
    } catch {
      return false;
    }
  }, [courseSlug, lessonId]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonId)}/comments/${encodeURIComponent(commentId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) return;

      // Remove from state
      setComments((prev) => {
        // Try removing as top-level
        const filtered = prev.filter((c) => c.id !== commentId);
        if (filtered.length !== prev.length) {
          setTotal((t) => t - 1);
          return filtered;
        }
        // Try removing as a reply
        return prev.map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.id !== commentId),
        }));
      });
    } catch {
      // ignore
    }
  }, [courseSlug, lessonId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4.5 h-4.5 text-[#c4956a]" />
        <h3 className="text-sm font-bold text-gray-900 font-dubai">
          {ct.title}
        </h3>
        {total > 0 && (
          <span className="text-[10px] text-[#c4956a] bg-[#ead3b9]/25 px-2 py-0.5 rounded-full font-medium">
            {total}
          </span>
        )}
      </div>

      {/* Comment form */}
      {session?.user && enrolled ? (
        <div className="mb-5">
          <CommentForm
            placeholder={ct.writeComment}
            submitLabel={ct.send}
            isRTL={isRTL}
            onSubmit={handleSubmitComment}
          />
        </div>
      ) : !session?.user ? (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
          className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl bg-[#ead3b9]/15 border border-[#ead3b9]/50 text-sm text-[#c4956a] hover:text-primary hover:border-primary/30 transition-colors font-dubai"
        >
          <LogIn className="w-4 h-4" />
          {ct.loginToComment}
        </button>
      ) : null}

      {/* Comments list */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 text-primary/40 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-xs text-gray-400 py-6 font-dubai">{ct.noComments}</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={session?.user?.id}
              isRTL={isRTL}
              onReply={handleSubmitComment}
              onDelete={handleDeleteComment}
              translations={{
                reply: ct.reply,
                cancel: ct.cancel,
                delete: ct.delete,
                deleteConfirm: ct.deleteConfirm,
                writeComment: ct.writeComment,
                send: ct.send,
                repliesCount: ct.repliesCount,
                justNow: ct.justNow,
                minutesAgo: ct.minutesAgo,
                hoursAgo: ct.hoursAgo,
                daysAgo: ct.daysAgo,
              }}
            />
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-2 text-xs text-primary/60 hover:text-primary transition-colors font-dubai"
            >
              {ct.loadMore}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
