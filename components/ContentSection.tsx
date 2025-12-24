'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Clock, Eye, ArrowLeft, Youtube } from 'lucide-react';
import Container from './ui/Container';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface Video {
  id: number;
  thumbnail: string;
  title: string;
  description: string;
  duration: string;
  views: string;
  url: string;
}

const ContentSection: React.FC = () => {
  const videos: Video[] = [
    {
      id: 1,
      thumbnail: '/images/courses/video-1.jpg',
      title: 'كيف بدأت مشروع الإيجار القصير من الصفر',
      description: 'رحلتي الكاملة من البداية حتى بناء عملية ضيافة ناجحة',
      duration: '12:45',
      views: '15K',
      url: 'https://youtube.com',
    },
    {
      id: 2,
      thumbnail: '/images/courses/video-2.jpg',
      title: '5 أخطاء شائعة في استضافة Airbnb وكيف تتجنبها',
      description: 'نصائح عملية لتجنب المشاكل الشائعة في الاستضافة',
      duration: '8:30',
      views: '22K',
      url: 'https://youtube.com',
    },
    {
      id: 3,
      thumbnail: '/images/courses/video-3.jpg',
      title: 'جولة في وحدة فندقية جاهزة للضيوف',
      description: 'تفاصيل وأسرار إعداد وحدة إيجار قصير احترافية',
      duration: '6:15',
      views: '18K',
      url: 'https://youtube.com',
    },
  ];

  return (
    <section className="py-20 bg-accent/10" id="content">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
            المحتوى والموارد التعليمية
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto mb-6">
            فيديوهات، مقالات، وموارد مجانية لمساعدتك في رحلتك
          </p>
          <Button variant="outline" size="md" rightIcon={<ArrowLeft size={18} />}>
            شاهد كل المحتوى
          </Button>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {videos.map((video, index) => (
            <Card
              key={video.id}
              padding="sm"
              className="group cursor-pointer animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => window.open(video.url, '_blank')}
            >
              {/* Thumbnail with Play Button */}
              <div className="relative h-52 rounded-xl overflow-hidden mb-4">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-secondary/40 group-hover:bg-secondary/60 transition-colors duration-300" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary">
                    <Play size={28} className="text-secondary fill-secondary ml-1" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" size="sm" className="bg-secondary/80 backdrop-blur-sm">
                    <Clock size={12} className="mr-1" />
                    {video.duration}
                  </Badge>
                </div>

                {/* YouTube Badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="warning" size="sm">
                    <Youtube size={12} className="mr-1" />
                    YouTube
                  </Badge>
                </div>
              </div>

              {/* Video Info */}
              <div>
                <h3 className="text-lg font-bold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {video.title}
                </h3>
                <p className="text-sm text-secondary/70 mb-3 line-clamp-2">
                  {video.description}
                </p>
                
                {/* Views */}
                <div className="flex items-center gap-2 text-sm text-secondary/60">
                  <Eye size={16} className="text-primary" />
                  <span>{video.views} مشاهدة</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <Card padding="md" className="text-center bg-primary/5 border-2 border-primary/30">
            <Youtube size={40} className="text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-secondary mb-2">قناة اليوتيوب</h3>
            <p className="text-secondary/70 mb-4">اشترك في القناة ليصلك كل جديد</p>
            <Button variant="primary" size="md" rightIcon={<ArrowLeft size={16} />}>
              اشترك الآن
            </Button>
          </Card>

          <Card padding="md" className="text-center bg-secondary/5 border-2 border-secondary/30">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-secondary mb-2">المدونة</h3>
            <p className="text-secondary/70 mb-4">تابع المدونة للمقالات التفصيلية</p>
            <Button variant="secondary" size="md" rightIcon={<ArrowLeft size={16} />}>
              اقرأ المزيد
            </Button>
          </Card>
        </div>
      </Container>
    </section>
  );
};

export default ContentSection;
