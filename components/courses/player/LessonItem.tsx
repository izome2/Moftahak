'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration, formatDurationEn } from '@/lib/courses/utils';

interface LessonItemProps {
  id: string;
  title: string;
  duration: number;
  videoUrl?: string;
  hasAccess: boolean;
  isActive: boolean;
  isRTL?: boolean;
  onClick: (id: string) => void;
}

function VideoThumbnail({ videoUrl, isActive }: { videoUrl: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (videoRef.current && ready) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [ready]);

  const handleMouseLeave = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 1;
    }
  }, []);

  return (
    <div
      className="w-full h-full group/thumb"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={`${videoUrl}#t=1`}
        muted
        preload="metadata"
        playsInline
        loop
        onLoadedData={() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 1;
          }
        }}
        onSeeked={() => setReady(true)}
        className={cn(
          'w-full h-full object-cover pointer-events-none transition-opacity duration-300',
          ready ? 'opacity-100' : 'opacity-0'
        )}
      />
      {!ready && (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/12 to-secondary/5 animate-pulse" />
      )}
      {/* Play icon – hides on hover */}
      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-hover/thumb:opacity-0 pointer-events-none">
        <Play className="w-6 h-6 text-[#ead3b9] drop-shadow-md" strokeWidth={2.5} />
      </div>
      {/* Active playing indicator */}
      {isActive && (
        <div className="absolute inset-0 ring-2 ring-primary/40 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

export default function LessonItem({
  id,
  title,
  duration,
  videoUrl,
  hasAccess,
  isActive,
  isRTL = false,
  onClick,
}: LessonItemProps) {
  const durationStr = isRTL ? formatDuration(duration) : formatDurationEn(duration);

  return (
    <button
      onClick={() => hasAccess && onClick(id)}
      disabled={!hasAccess}
      className={cn(
        'w-full flex items-center gap-4 px-3 py-3 rounded-xl text-start transition-all group/lesson',
        isActive
          ? 'bg-[#ead3b9]/25 border border-[#ead3b9]/60'
          : hasAccess
            ? 'hover:bg-[#ead3b9]/10 border border-transparent'
            : 'opacity-50 cursor-not-allowed border border-transparent'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Thumbnail */}
      <div className="relative w-40 h-[90px] rounded-lg flex-shrink-0 overflow-hidden bg-secondary/5 border-2 border-[#ead3b9]">
        {videoUrl ? (
          <VideoThumbnail videoUrl={videoUrl} isActive={isActive} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary/12 to-secondary/5 flex items-center justify-center">
            <Play className="w-6 h-6 text-[#ead3b9]/60 drop-shadow-md" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Title + Duration */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p
          className={cn(
            'text-base font-dubai font-bold leading-snug line-clamp-2',
            isActive ? 'text-primary-dark' : 'text-gray-800'
          )}
        >
          {title}
        </p>
        <p className="text-sm text-gray-500 font-dubai">
          {isRTL ? 'المدة' : 'Duration'}: {durationStr}
        </p>
      </div>
    </button>
  );
}
