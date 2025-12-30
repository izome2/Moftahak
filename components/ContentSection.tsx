'use client';

import React, { useState, useRef } from 'react';
import { Play, Heart, MessageCircle, Repeat2, Instagram } from 'lucide-react';
import Container from './ui/Container';

interface Video {
  id: number;
  src: string;
}

const VideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

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
        className="w-full rounded-xl"
        src={src}
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
          <div className="w-18 h-18 rounded-full bg-[#ead3b9]/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-[#ead3b9]/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
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
  const instagramVideos: Video[] = [
    { id: 1, src: '/videos/instagram-1.mp4' },
    { id: 2, src: '/videos/instagram-2.mp4' },
    { id: 3, src: '/videos/instagram-3.mp4' },
  ];

  const tiktokVideos: Video[] = [
    { id: 4, src: '/videos/tiktok-1.mp4' },
    { id: 5, src: '/videos/tiktok-2.mp4' },
    { id: 6, src: '/videos/tiktok-3.mp4' },
  ];

  return (
    <section className="py-20 bg-white" id="content">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
            سوشيال
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto mb-6">
            تابعني, وشاهد أحدث المحتوى
          </p>
        </div>

        {/* Instagram Section */}
        <div className="mb-16">
          {/* Instagram Header */}
          <a 
            href="https://www.instagram.com/abdullahelkheddr/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 mb-8 cursor-pointer group/header transition-transform duration-300 hover:scale-105"
          >
            <h3 className="text-3xl font-bold text-secondary font-bristone transition-colors duration-300 group-hover/header:text-pink-600">Instagram</h3>
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg">
              <Instagram size={28} className="text-white" />
            </div>
          </a>

          {/* Instagram Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instagramVideos.map((video, index) => (
              <div
                key={video.id}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl bg-[#ead3b9]/20 border-2 border-[#ead3b9] group hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <VideoPlayer src={video.src} />
              </div>
            ))}
          </div>
        </div>

        {/* TikTok Section */}
        <div>
          {/* TikTok Header */}
          <a 
            href="https://www.tiktok.com/@abdullahelkhedr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 mb-8 cursor-pointer group/header transition-transform duration-300 hover:scale-105"
          >
            <h3 className="text-3xl font-bold text-black font-bristone transition-colors duration-300 group-hover/header:text-black">TikTok</h3>
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
          </a>

          {/* TikTok Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tiktokVideos.map((video, index) => (
              <div
                key={video.id}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl bg-[#ead3b9]/20 border-2 border-[#ead3b9] group hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <VideoPlayer src={video.src} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ContentSection;
