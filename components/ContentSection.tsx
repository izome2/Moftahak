'use client';

import React, { useState, useRef } from 'react';
import { Play, Heart, MessageCircle, Repeat2, Instagram, ThumbsUp, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from './ui/Container';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Video {
  id: number;
  src: string;
  platform: 'instagram' | 'tiktok';
}

const VideoPlayer: React.FC<{ src: string; isActive: boolean }> = ({ src, isActive }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Pause video when not active
  React.useEffect(() => {
    if (!isActive && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    
    // Create hearts animation with staggered timing
    if (!isLiked) {
      Array.from({ length: 5 }).forEach((_, i) => {
        setTimeout(() => {
          const newHeart = {
            id: Date.now() + Math.random(),
            x: Math.random() * 60 - 30,
            y: 0,
          };
          setHearts(prev => [...prev, newHeart]);
          
          // Remove heart after animation
          setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== newHeart.id));
          }, 1000);
        }, i * 150); // Stagger each heart by 150ms
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const updateProgress = (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = rect.right - e.clientX;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(100, (clickX / width) * 100));
      const newTime = (percentage / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    updateProgress(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateProgress(e);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateProgress(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        className="w-full rounded-xl object-cover"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      >
        المتصفح لا يدعم تشغيل الفيديو
      </video>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/50 to-transparent pointer-events-none rounded-b-xl" />

      {/* Play/Pause Overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
        onClick={togglePlay}
      >
        {!isPlaying && (
          <div className="w-18 h-18 rounded-full bg-[#ead3b9]/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-[#ead3b9]/50 shadow-[0_0_20px_rgba(180,130,80,0.4)]">
            <div className="flex items-center justify-center mr-0 transition-all duration-300 group-hover/play:drop-shadow-[0_0_8px_rgba(243,235,221,0.8)]">
              <Play size={28} className="text-[#f3ebdd] fill-[#f3ebdd]" />
            </div>
          </div>
        )}
      </div>

      {/* Social Actions - Right Side */}
      <div className="absolute right-4 bottom-16 flex flex-col gap-3">
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className="w-12 h-12 rounded-full bg-[#ead3b9]/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#ead3b9]/50 shadow-lg relative overflow-visible"
        >
          <Heart 
            size={20} 
            className={`transition-all duration-300 ${
              isLiked 
                ? 'text-[#f3ebdd] fill-[#f3ebdd] scale-110' 
                : 'text-[#f3ebdd]'
            }`}
          />
          
          {/* Hearts Animation */}
          {hearts.map((heart) => (
            <Heart
              key={heart.id}
              size={16}
              className="absolute text-[#f3dddd] fill-[#f3ebdd] animate-[float_1s_ease-out_forwards] pointer-events-none"
              style={{
                left: `50%`,
                bottom: `50%`,
                transform: `translate(-50%, 0)`,
                animation: `float-up 1s ease-out forwards`,
                '--tx': `${heart.x}px`,
              } as React.CSSProperties}
            />
          ))}
        </button>
        
        {/* Comment Button */}
        <button className="w-12 h-12 rounded-full bg-[#ead3b9]/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#ead3b9]/50 shadow-lg">
          <MessageCircle size={20} className="text-[#f3ebdd]" />
        </button>
        
        {/* Repost Button */}
        <button className="w-12 h-12 rounded-full bg-[#ead3b9]/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#ead3b9]/50 shadow-lg">
          <Repeat2 size={20} className="text-[#f3ebdd]" />
        </button>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) translateX(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100px) translateX(var(--tx));
          }
        }
      `}</style>

      {/* Floating Progress Bar */}
      <div className="absolute bottom-6 left-4 right-4 px-2">
        <div
          ref={progressBarRef}
          className="h-1.5 bg-[#ead3b9]/30 rounded-full overflow-hidden cursor-pointer shadow-lg backdrop-blur-sm select-none"
          onClick={handleProgressClick}
          onMouseDown={handleMouseDown}
        >
          <div
            className="h-full bg-[#edbf8c] rounded-full shadow-[0_0_10px_rgba(237,191,140,0.8)] transition-all duration-100 ml-auto"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const ContentSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useScrollAnimation(containerRef as React.RefObject<Element>, { threshold: 0.2, once: true });
  const isHeaderInView = useScrollAnimation(headerRef as React.RefObject<Element>, { threshold: 0.5, once: false });

  React.useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setHasAnimated(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  React.useEffect(() => {
    if (isHeaderInView) {
      setShowEmojis(true);
      const timer = setTimeout(() => setShowEmojis(false), 3000);
      return () => clearTimeout(timer);
    } else {
      // عند الخروج من القسم، إعادة تشغيل الأنيميشن عند العودة
      setShowEmojis(false);
    }
  }, [isHeaderInView]);

  const allVideos: Video[] = [
    { id: 1, src: '/videos/instagram-1.mp4', platform: 'instagram' },
    { id: 2, src: '/videos/instagram-2.mp4', platform: 'instagram' },
    { id: 3, src: '/videos/instagram-3.mp4', platform: 'instagram' },
    { id: 4, src: '/videos/tiktok-1.mp4', platform: 'tiktok' },
    { id: 5, src: '/videos/tiktok-2.mp4', platform: 'tiktok' },
    { id: 6, src: '/videos/tiktok-3.mp4', platform: 'tiktok' },
  ];

  const emojis = [
    { icon: ThumbsUp, colors: ['#F58529', '#DD2A7B', '#D4A574', '#D4A574'] },
    { icon: Heart, colors: ['#DD2A7B', '#F58529', '#D4A574', '#D4A574'] },
    { icon: Flame, colors: ['#FEDA75', '#FA7E1E', '#D4A574', '#D4A574'] },
    { icon: Heart, colors: ['#3B5998', '#8134AF', '#D4A574', '#D4A574'] },
    { icon: ThumbsUp, colors: ['#8134AF', '#3B5998', '#D4A574', '#D4A574'] },
    { icon: Flame, colors: ['#FA7E1E', '#FEDA75', '#D4A574', '#D4A574'] },
  ];

  const getEmojiPosition = (index: number) => {
    // توزيع متساوٍ في جميع الاتجاهات: فوق، يمين، تحت، يسار
    const baseAngles = [
      -Math.PI / 2,      // فوق
      0,                 // يمين
      Math.PI / 2,       // تحت
      Math.PI,           // يسار
      -Math.PI / 4,      // فوق-يمين
      Math.PI / 4,       // تحت-يمين
    ];
    
    // إضافة تنوع عشوائي صغير للزاوية
    const angle = baseAngles[index] + (Math.random() - 0.5) * 0.3;
    const distance = 100 + Math.random() * 60; // مسافة عشوائية
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    return { x, y };
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleVideoClick = (videoIndex: number) => {
    const position = videoIndex - (((currentIndex % allVideos.length) + allVideos.length) % allVideos.length);
    if (position !== 0) {
      setCurrentIndex((prev) => prev + position);
    }
  };

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStartX(clientX);
  };

  const handleDragEnd = (clientX: number) => {
    if (!isDragging) return;
    
    const diff = dragStartX - clientX;
    const threshold = 80;

    if (diff > threshold) {
      handleNext();
    } else if (diff < -threshold) {
      handlePrev();
    }

    setIsDragging(false);
    setDragStartX(0);
  };

  const getPositionStyles = (index: number, isMobile: boolean = false) => {
    const normalizedCurrent = ((currentIndex % allVideos.length) + allVideos.length) % allVideos.length;
    let position = index - normalizedCurrent;
    
    // Adjust position for circular wrapping
    if (position > allVideos.length / 2) {
      position -= allVideos.length;
    } else if (position < -allVideos.length / 2) {
      position += allVideos.length;
    }
    
    const spacing = isMobile ? 180 : 240;
    let translateX = position * spacing;
    let scale = 1;
    let opacity = 1;
    let zIndex = 10;
    let blur = 0;

    if (position === 0) {
      scale = isMobile ? 1 : 1.1;
      opacity = 1;
      zIndex = 15;
      blur = 0;
    } else if (Math.abs(position) === 1) {
      scale = isMobile ? 0.85 : 1.05;
      opacity = 0.75;
      zIndex = 14;
      blur = 2;
    } else if (Math.abs(position) === 2) {
      scale = isMobile ? 0.7 : 1;
      opacity = 0.5;
      zIndex = 13;
      blur = 6;
    } else {
      scale = 0.9;
      opacity = 0;
      zIndex = 10;
      blur = 8;
    }

    return {
      transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale})`,
      opacity,
      zIndex,
      filter: `blur(${blur}px)`,
      pointerEvents: Math.abs(position) <= 2 ? 'auto' : 'none',
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleDragEnd(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      handleDragEnd(e.changedTouches[0].clientX);
    }
  };

  // Get 5 visible videos: 2 left, center, 2 right
  const getVisibleVideos = () => {
    const positions = [-2, -1, 0, 1, 2];
    return positions.map((offset) => {
      const index = (currentIndex + offset + allVideos.length) % allVideos.length;
      return {
        ...allVideos[index],
        offset,
      };
    });
  };

  const getVideoStyles = (offset: number) => {
    switch (offset) {
      case 0: // المنتصف - الأكبر
        return {
          transform: `translateX(-50%) scale(1.1)`,
          opacity: 1,
          zIndex: 5,
        };
      case -1: // يسار قريب
        return {
          transform: `translateX(calc(-50% - 240px)) scale(1.05)`,
          opacity: 0.75,
          zIndex: 4,
        };
      case 1: // يمين قريب
        return {
          transform: `translateX(calc(-50% + 240px)) scale(1.05)`,
          opacity: 0.75,
          zIndex: 4,
        };
      case -2: // يسار بعيد
        return {
          transform: `translateX(calc(-50% - 450px)) scale(1)`,
          opacity: 0.5,
          zIndex: 3,
        };
      case 2: // يمين بعيد
        return {
          transform: `translateX(calc(-50% + 450px)) scale(1)`,
          opacity: 0.5,
          zIndex: 3,
        };
      default:
        return {
          transform: `translateX(-50%) scale(0.5)`,
          opacity: 0,
          zIndex: 0,
        };
    }
  };

  return (
    <section className="py-20 bg-white overflow-hidden" id="content">
      <Container>
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="relative inline-block overflow-visible">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
              سوشيال
            </h2>
            
            {/* Emoji Explosion */}
            <AnimatePresence>
              {showEmojis && emojis.map((emoji, index) => {
                const pos = getEmojiPosition(index);
                const randomRotation = Math.random() * 720 - 360; // دوران عشوائي
                const IconComponent = emoji.icon;
                return (
                  <motion.div
                    key={`emoji-${index}-${Date.now()}`}
                    className="absolute top-1/2 left-1/2 pointer-events-none"
                    initial={{ 
                      x: '-50%', 
                      y: '-50%',
                      scale: 0,
                      opacity: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      x: `calc(-50% + ${pos.x}px)`,
                      y: `calc(-50% + ${pos.y}px)`,
                      scale: [0, 1.3, 1.1, 0.9, 0],
                      opacity: [0, 1, 1, 0.8, 0],
                      rotate: randomRotation
                    }}
                    exit={{ 
                      scale: 0,
                      opacity: 0
                    }}
                    transition={{
                      duration: 2.5,
                      delay: index * 0.1,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                  >
                    <motion.div
                      animate={{
                        filter: [
                          'hue-rotate(0deg) saturate(2)',
                          'hue-rotate(0deg) saturate(2)',
                          'hue-rotate(0deg) saturate(1)',
                          'hue-rotate(0deg) saturate(1)',
                        ]
                      }}
                      transition={{
                        duration: 2.5,
                        times: [0, 0.3, 0.7, 1]
                      }}
                    >
                      <motion.div
                        animate={{
                          color: emoji.colors
                        }}
                        transition={{
                          duration: 2.5,
                          times: [0, 0.2, 0.4, 1]
                        }}
                      >
                        <IconComponent 
                          size={32} 
                          strokeWidth={2}
                          fill="none"
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto mb-6">
            تابعني, وشاهد أحدث المحتوى
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <a 
            href="https://www.instagram.com/abdullahelkheddr/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 cursor-pointer group/header transition-transform duration-300 hover:scale-105"
          >
            <h3 className="text-2xl font-bold text-secondary font-bristone transition-colors duration-300 group-hover/header:text-pink-600">Instagram</h3>
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg">
              <Instagram size={22} className="text-white" />
            </div>
          </a>

          <div className="w-px h-8 bg-secondary/20" />

          <a 
            href="https://www.tiktok.com/@abdullahelkhedr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 cursor-pointer group/header transition-transform duration-300 hover:scale-105"
          >
            <h3 className="text-2xl font-bold text-black font-bristone">TikTok</h3>
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
          </a>
        </div>

        {/* Carousel Container */}
        <div className="relative py-12" ref={containerRef}>
          {/* Videos Container */}
          <div className="relative h-[600px] flex items-center justify-center">
            <div 
              className="relative w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {allVideos.map((video, index) => {
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                const styles = getPositionStyles(index, isMobile) as React.CSSProperties;
                const normalizedCurrent = ((currentIndex % allVideos.length) + allVideos.length) % allVideos.length;
                const isCenter = index === normalizedCurrent;
                
                // حساب الموقع النسبي للفيديو (يمين أو يسار)
                let position = index - normalizedCurrent;
                if (position > allVideos.length / 2) {
                  position -= allVideos.length;
                } else if (position < -allVideos.length / 2) {
                  position += allVideos.length;
                }
                
                return (
                  <motion.div
                    key={video.id}
                    className="absolute left-1/2 top-1/2 -translate-y-1/2 w-[330px] md:w-[320px]"
                    style={{
                      zIndex: styles.zIndex,
                      pointerEvents: styles.pointerEvents,
                      filter: styles.filter,
                      willChange: hasAnimated ? 'transform, opacity' : 'auto',
                    }}
                    initial={{
                      opacity: 0,
                      y: position === 0 ? 40 : 0,
                      x: '-50%',
                      scale: position === 0 ? 0.95 : 1,
                    }}
                    animate={isInView ? {
                      opacity: styles.opacity,
                      y: 0,
                      x: position === 0 ? '-50%' : `calc(-50% + ${position * (isMobile ? 180 : 240)}px)`,
                      scale: styles.transform ? parseFloat(styles.transform.toString().match(/scale\(([^)]+)\)/)?.[1] || '1') : 1,
                    } : {
                      opacity: 0,
                      y: position === 0 ? 40 : 0,
                      x: '-50%',
                      scale: position === 0 ? 0.95 : 1,
                    }}
                    transition={{
                      duration: hasAnimated ? 0.7 : 0.6,
                      delay: hasAnimated ? 0 : (position === 0 ? 0.3 : 0.7 + Math.abs(position) * 0.15),
                      ease: hasAnimated ? 'easeOut' : [0.25, 0.46, 0.45, 0.94]
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoClick(index);
                    }}
                  >
                    <div className={`relative rounded-2xl overflow-hidden bg-[#ead3b9]/20 border-2 border-[#e8cebc] transition-shadow duration-300 ${
                      isCenter 
                        ? 'shadow-[0_10px_40px_rgba(234,211,185,0.8),0_0_60px_rgba(237,191,140,0.4)]' 
                        : 'shadow-2xl hover:shadow-[0_0_40px_rgba(234,211,185,0.6)] cursor-pointer'
                    }`}>
                      <div className={!isCenter ? 'pointer-events-none' : ''}>
                        <VideoPlayer src={video.src} isActive={isCenter} />
                      </div>
                    
                    {/* Platform Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      {video.platform === 'instagram' ? (
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg">
                          <Instagram size={18} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-lg">
                          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>          {/* Navigation Buttons */}
          <button
            onClick={handleNext}
            className="absolute right-1 md:right-4 top-1/2 md:top-[48%] -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#ead3b9] hover:bg-[#edbf8c] text-secondary flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 z-30 group"
            aria-label="التالي"
          >
            <svg className="w-5 h-5 md:w-7 md:h-7 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-1 md:left-4 top-1/2 md:top-[48%] -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#ead3b9] hover:bg-[#edbf8c] text-secondary flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 z-30 group"
            aria-label="السابق"
          >
            <svg className="w-5 h-5 md:w-7 md:h-7 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {allVideos.map((_, index) => {
              const normalizedIndex = ((currentIndex % allVideos.length) + allVideos.length) % allVideos.length;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === normalizedIndex
                      ? 'w-8 bg-[#edbf8c]'
                      : 'w-2 bg-[#ead3b9] hover:bg-[#edbf8c]/60'
                  }`}
                  aria-label={`اذهب إلى الفيديو ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ContentSection;
