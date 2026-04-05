'use client';

import React, { useState } from 'react';
import { Reply, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import CommentForm from './CommentForm';

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

interface CommentItemProps {
  comment: CommentData;
  currentUserId?: string;
  isRTL?: boolean;
  onReply: (content: string, parentId: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<void>;
  translations: {
    reply: string;
    cancel: string;
    delete: string;
    deleteConfirm: string;
    writeComment: string;
    send: string;
    repliesCount: (count: number) => string;
    justNow: string;
    minutesAgo: (n: number) => string;
    hoursAgo: (n: number) => string;
    daysAgo: (n: number) => string;
  };
}

function formatRelativeTime(
  dateStr: string,
  t: CommentItemProps['translations']
): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t.justNow;
  if (diffMins < 60) return t.minutesAgo(diffMins);
  if (diffHours < 24) return t.hoursAgo(diffHours);
  if (diffDays < 30) return t.daysAgo(diffDays);
  return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

export default function CommentItem({
  comment,
  currentUserId,
  isRTL = false,
  onReply,
  onDelete,
  translations: t,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = currentUserId === comment.userId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleReply = async (content: string, parentId?: string) => {
    const success = await onReply(content, parentId || comment.id);
    if (success) setShowReplyForm(false);
    return success;
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    await onDelete(comment.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary overflow-hidden ring-2 ring-primary/20">
          {comment.user.image ? (
            <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{comment.user.firstName[0]}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900 font-dubai">
              {comment.user.firstName} {comment.user.lastName}
            </span>
            <span className="text-[10px] text-[#c4956a]/70">
              {formatRelativeTime(comment.createdAt, t)}
            </span>
          </div>

          {/* Content */}
          <p className="mt-1 text-sm text-gray-700 leading-relaxed font-dubai whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-[11px] text-[#c4956a]/70 hover:text-primary transition-colors"
            >
              <Reply className="w-3 h-3" />
              {t.reply}
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                className={cn(
                  'flex items-center gap-1 text-[11px] transition-colors',
                  confirmDelete ? 'text-red-500' : 'text-[#c4956a]/50 hover:text-red-500 opacity-0 group-hover:opacity-100'
                )}
              >
                <Trash2 className="w-3 h-3" />
                {confirmDelete ? t.deleteConfirm : t.delete}
              </button>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <CommentForm
                  placeholder={t.writeComment}
                  submitLabel={t.send}
                  isRTL={isRTL}
                  parentId={comment.id}
                  onSubmit={handleReply}
                  onCancel={() => setShowReplyForm(false)}
                  cancelLabel={t.cancel}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {hasReplies && (
            <div className="mt-3">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary-dark transition-colors font-medium"
              >
                <ChevronDown
                  className={cn('w-3 h-3 transition-transform', showReplies && 'rotate-180')}
                />
                {t.repliesCount(comment.replies!.length)}
              </button>

              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2 ms-2 border-s-2 border-[#ead3b9]/40 ps-3 space-y-3"
                  >
                    {comment.replies!.map((reply) => (
                      <div key={reply.id} className="flex gap-2.5 group/reply">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden ring-1 ring-primary/15">
                          {reply.user.image ? (
                            <img src={reply.user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{reply.user.firstName[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-gray-800 font-dubai">
                              {reply.user.firstName} {reply.user.lastName}
                            </span>
                            <span className="text-[10px] text-[#c4956a]/70">
                              {formatRelativeTime(reply.createdAt, t)}
                            </span>
                            {currentUserId === reply.userId && (
                              <button
                                onClick={() => onDelete(reply.id)}
                                className="text-[10px] text-[#c4956a]/50 hover:text-red-500 transition-colors opacity-0 group-hover/reply:opacity-100"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-600 leading-relaxed font-dubai whitespace-pre-wrap break-words">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
