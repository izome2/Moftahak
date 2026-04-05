'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  placeholder: string;
  submitLabel: string;
  isRTL?: boolean;
  parentId?: string;
  onSubmit: (content: string, parentId?: string) => Promise<boolean>;
  onCancel?: () => void;
  cancelLabel?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  placeholder,
  submitLabel,
  isRTL = false,
  parentId,
  onSubmit,
  onCancel,
  cancelLabel,
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const success = await onSubmit(trimmed, parentId);
      if (success) {
        setContent('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={2000}
          rows={parentId ? 2 : 3}
          className={cn(
            'w-full bg-[#ead3b9]/10 border border-[#ead3b9]/40 rounded-xl px-4 py-3 text-sm text-gray-900 font-dubai',
            'placeholder:text-[#c4956a]/50 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 focus:bg-[#ffffff] transition-all',
            parentId && 'text-xs'
          )}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-[#c4956a]/70 hover:text-gray-700 transition-colors font-dubai"
            >
              {cancelLabel}
            </button>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all',
            content.trim()
              ? 'bg-primary text-secondary hover:bg-primary/90'
              : 'bg-[#ead3b9]/20 text-[#c4956a]/50 cursor-not-allowed'
          )}
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
