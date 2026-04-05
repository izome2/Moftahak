'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  title: string;
  courseSlug: string;
  lessonId: string;
  initialPosition?: number;
  onProgressUpdate?: (data: { watchedSeconds: number; lastPosition: number }) => void;
  onEnded?: () => void;
  isRTL?: boolean;
  translations: {
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    fullscreen: string;
    exitFullscreen: string;
    speed: string;
    normal: string;
    forward: string;
    backward: string;
  };
}

const PLAYBACK_SPEEDS = [1, 1.5, 2];

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Morphing Play ↔ Pause icon — two paths that each morph between
// half of the triangle and their respective bar (always visible, no opacity hack)
function PlayPauseMorphIcon({
  isPlaying,
  size,
  strokePx,
  color,
  filled = false,
}: {
  isPlaying: boolean;
  size: number;
  strokePx: number;
  color: string;
  filled?: boolean;
}) {
  const vb = 32;
  const sw = strokePx * (vb / size);

  // Path 1: full triangle ↔ left bar
  const path1Play  = 'M 8 5 L 8 27 L 27 16 L 27 16 Z';
  const path1Pause = 'M 6 4 L 6 28 L 13 28 L 13 4 Z';

  // Path 2: collapsed to tip point (zero size) ↔ right bar
  const path2Play  = 'M 27 16 L 27 16 L 27 16 L 27 16 Z';
  const path2Pause = 'M 19 4 L 19 28 L 26 28 L 26 4 Z';

  const transition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill="none">
      <motion.path
        animate={{ d: isPlaying ? path1Pause : path1Play }}
        transition={transition}
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={filled ? color : 'none'}
      />
      <motion.path
        animate={{
          d: isPlaying ? path2Pause : path2Play,
          opacity: isPlaying ? 1 : 0,
        }}
        transition={{
          d: transition,
          opacity: { duration: 0.25, ease: 'easeOut' },
        }}
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={filled ? color : 'none'}
      />
    </svg>
  );
}

export default function VideoPlayer({
  src,
  title,
  courseSlug,
  lessonId,
  initialPosition = 0,
  onProgressUpdate,
  onEnded,
  isRTL = false,
  translations: t,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const maxWatchedRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTooltip, setSeekTooltip] = useState({ show: false, time: 0, x: 0 });
  const [showSkipAnimation, setShowSkipAnimation] = useState<'forward' | 'backward' | null>(null);
  const [centerIconVisible, setCenterIconVisible] = useState(true);

  // --- Controls visibility ---
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    } else {
      hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying]);

  // Center icon: stays visible briefly after play starts so morph animation is seen
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => setCenterIconVisible(false), 600);
      return () => clearTimeout(timer);
    } else {
      setCenterIconVisible(true);
    }
  }, [isPlaying]);

  // --- Progress reporting ---
  // Save progress immediately
  const saveProgressNow = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !onProgressUpdate) return;
    const watched = Math.max(maxWatchedRef.current, vid.currentTime);
    maxWatchedRef.current = watched;
    onProgressUpdate({
      watchedSeconds: Math.floor(watched),
      lastPosition: Math.floor(vid.currentTime),
    });
  }, [onProgressUpdate]);

  // Save progress via sendBeacon (works during page unload)
  const saveProgressBeacon = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !courseSlug || !lessonId) return;
    const watched = Math.max(maxWatchedRef.current, vid.currentTime);
    const payload = JSON.stringify({
      lessonId,
      watchedSeconds: Math.floor(watched),
      lastPosition: Math.floor(vid.currentTime),
    });
    navigator.sendBeacon(
      `/api/courses/${encodeURIComponent(courseSlug)}/progress`,
      new Blob([payload], { type: 'application/json' })
    );
  }, [courseSlug, lessonId]);

  // Periodic progress save
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      const vid = videoRef.current;
      if (vid && !vid.paused && onProgressUpdate) {
        saveProgressNow();
      }
    }, 15000);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [onProgressUpdate, saveProgressNow]);

  // Save progress when leaving page or switching tabs
  useEffect(() => {
    const handleBeforeUnload = () => saveProgressBeacon();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveProgressBeacon();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Save on unmount (lesson switch)
      saveProgressBeacon();
    };
  }, [saveProgressBeacon]);

  // --- Video event handlers ---
  const handleLoadedMetadata = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    setDuration(vid.duration);
    if (initialPosition > 0 && initialPosition < vid.duration - 5) {
      vid.currentTime = initialPosition;
    }
  }, [initialPosition]);

  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || isSeeking) return;
    setCurrentTime(vid.currentTime);
    maxWatchedRef.current = Math.max(maxWatchedRef.current, vid.currentTime);
  }, [isSeeking]);

  const handleProgress = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !vid.buffered.length) return;
    const end = vid.buffered.end(vid.buffered.length - 1);
    setBuffered((end / vid.duration) * 100);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (onProgressUpdate && videoRef.current) {
      onProgressUpdate({
        watchedSeconds: Math.floor(videoRef.current.duration),
        lastPosition: Math.floor(videoRef.current.duration),
      });
    }
    onEnded?.();
  }, [onProgressUpdate, onEnded]);

  // --- Controls ---
  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
      saveProgressNow();
    }
  }, [saveProgressNow]);

  const skip = useCallback((seconds: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = Math.min(Math.max(vid.currentTime + seconds, 0), vid.duration);
    setShowSkipAnimation(seconds > 0 ? 'forward' : 'backward');
    setTimeout(() => setShowSkipAnimation(null), 600);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const changeVolume = useCallback((val: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    const clamped = Math.min(Math.max(val, 0), 1);
    vid.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // --- Progress bar interaction ---
  const handleProgressBarInteraction = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      const vid = videoRef.current;
      if (!bar || !vid) return;
      const rect = bar.getBoundingClientRect();
      let ratio = (e.clientX - rect.left) / rect.width;
      if (isRTL) ratio = 1 - ratio;
      ratio = Math.min(Math.max(ratio, 0), 1);
      vid.currentTime = ratio * vid.duration;
      setCurrentTime(ratio * vid.duration);
    },
    [isRTL]
  );

  const handleProgressBarHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      if (!bar || !duration) return;
      const rect = bar.getBoundingClientRect();
      let ratio = (e.clientX - rect.left) / rect.width;
      if (isRTL) ratio = 1 - ratio;
      ratio = Math.min(Math.max(ratio, 0), 1);
      setSeekTooltip({ show: true, time: ratio * duration, x: e.clientX - rect.left });
    },
    [duration, isRTL]
  );

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(isRTL ? -5 : 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(isRTL ? 5 : -5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(volume - 0.1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
      showControlsTemporarily();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, skip, changeVolume, toggleMute, toggleFullscreen, showControlsTemporarily, isRTL, volume]);

  // Note: unmount progress saving is handled by the beforeunload/visibilitychange
  // useEffect above via saveProgressBeacon, which works reliably during page unload.

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full bg-black overflow-hidden group select-none',
        isFullscreen && 'rounded-none'
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={(e) => {
        // Only toggle play if clicking on the video area, not controls
        if ((e.target as HTMLElement).closest('[data-controls]')) return;
        togglePlay();
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
        preload="metadata"
      />

      {/* Skip animation overlay */}
      <AnimatePresence>
        {showSkipAnimation && (
          <motion.div
            key={showSkipAnimation}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-4',
              showSkipAnimation === 'forward' ? 'right-[20%]' : 'left-[20%]'
            )}
          >
            {showSkipAnimation === 'forward' ? (
              <RotateCw className="w-8 h-8 text-white" />
            ) : (
              <RotateCcw className="w-8 h-8 text-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient + title overlay (only when paused) */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(-135deg, rgba(20,15,8,0.75) 0%, rgba(60,45,25,0.4) 30%, rgba(120,90,50,0.12) 50%, transparent 70%)' }}
            />
            <motion.p
              initial={{ opacity: 0, x: 40, y: -25 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 40, y: -25 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute top-8 right-16 max-w-[65%] text-end text-[#ead3b9] text-3xl sm:text-4xl md:text-5xl font-bold font-dubai leading-snug line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            >
              {title}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center morphing play/pause icon (always mounted, opacity controlled) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          opacity: centerIconVisible ? 1 : 0,
          scale: centerIconVisible ? 1 : 0.7,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 10px rgba(237,191,140,0.7)) drop-shadow(0 0 22px rgba(237,191,140,0.35))' }}
      >
        <PlayPauseMorphIcon
          isPlaying={isPlaying}
          size={240}
          strokePx={13}
          color="#ead3b9"
        />
      </motion.div>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            data-controls
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-3 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer group/progress mb-3 hover:h-2.5 transition-all"
              onClick={handleProgressBarInteraction}
              onMouseMove={handleProgressBarHover}
              onMouseLeave={() => setSeekTooltip((p) => ({ ...p, show: false }))}
              onMouseDown={(e) => {
                setIsSeeking(true);
                handleProgressBarInteraction(e);
                const onMove = (ev: MouseEvent) => {
                  const bar = progressRef.current;
                  const vid = videoRef.current;
                  if (!bar || !vid) return;
                  const rect = bar.getBoundingClientRect();
                  let ratio = (ev.clientX - rect.left) / rect.width;
                  if (isRTL) ratio = 1 - ratio;
                  ratio = Math.min(Math.max(ratio, 0), 1);
                  vid.currentTime = ratio * vid.duration;
                  setCurrentTime(ratio * vid.duration);
                };
                const onUp = () => {
                  setIsSeeking(false);
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
            >
              {/* Buffered indicator */}
              <div
                className="absolute top-0 h-full bg-white/20 rounded-full"
                style={{ width: `${buffered}%`, [isRTL ? 'right' : 'left']: 0 }}
              />
              {/* Progress indicator */}
              <div
                className="absolute top-0 h-full bg-primary rounded-full transition-none"
                style={{ width: `${progressPercent}%`, [isRTL ? 'right' : 'left']: 0 }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ [isRTL ? 'left' : 'right']: '-7px' }}
                />
              </div>
              {/* Seek tooltip */}
              {seekTooltip.show && (
                <div
                  className="absolute -top-8 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none"
                  style={{ left: seekTooltip.x }}
                >
                  {formatTime(seekTooltip.time)}
                </div>
              )}
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between gap-2">
              {/* Left controls */}
              <div className="flex items-center gap-1.5">
                {/* Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2 py-1 rounded-lg hover:bg-white/15 transition-colors flex items-center"
                    title={t.speed}
                  >
                    <span className="text-xs text-white font-bold tabular-nums">{playbackSpeed === 1 ? '1x' : `${playbackSpeed}x`}</span>
                  </button>
                  <AnimatePresence>
                    {showSpeedMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-full mb-2 bg-black/40 backdrop-blur-xl rounded-xl shadow-lg py-2 min-w-[100px] border border-white/10"
                        style={{ [isRTL ? 'right' : 'left']: 0 }}
                      >
                        <div className="flex items-center gap-1 px-3 pb-1.5 mb-1 border-b border-white/10">
                          <ChevronUp className="w-3 h-3 text-white/50" />
                          <span className="text-xs text-white/60">{t.speed}</span>
                        </div>
                        {PLAYBACK_SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={() => changeSpeed(s)}
                            className={cn(
                              'w-full px-3 py-1.5 text-start text-sm transition-colors rounded-lg mx-auto',
                              s === playbackSpeed
                                ? 'text-primary bg-white/15'
                                : 'text-white/80 hover:bg-white/10'
                            )}
                          >
                            {s === 1 ? t.normal : `${s}x`}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                  title={isFullscreen ? t.exitFullscreen : t.fullscreen}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 text-white" />
                  ) : (
                    <Maximize className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1.5">
                {/* Volume */}
                <div className="flex items-center gap-1 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                    title={isMuted ? t.unmute : t.mute}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-full h-1 accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={() => skip(isRTL ? -5 : 5)}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors hidden sm:block"
                  title={isRTL ? t.backward : t.forward}
                >
                  <RotateCw className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={() => skip(isRTL ? 5 : -5)}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors hidden sm:block"
                  title={isRTL ? t.forward : t.backward}
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                  title={isPlaying ? t.pause : t.play}
                >
                  <PlayPauseMorphIcon
                    isPlaying={isPlaying}
                    size={22}
                    strokePx={3}
                    color="white"
                    filled
                  />
                </button>

                {/* Time display — immediately after play button */}
                <span className="text-white/80 text-xs font-mono tabular-nums hidden sm:inline ms-0.5">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
