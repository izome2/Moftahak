'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { slideInLeft } from '@/lib/animations/modalVariants';

const AuthBackground: React.FC = () => {
  return (
    <motion.div
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-r-3xl"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/Backgroud_hero.jpg"
          alt="خلفية"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-secondary/90 via-secondary/60 to-secondary/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end p-12 w-full">
        {/* Blurred Action Cards */}
        <div className="space-y-4">
          {/* تعرف أكثر Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="backdrop-blur-lg bg-white/20 rounded-2xl p-6 border border-white/30"
          >
            <h3 className="text-white font-bold text-xl mb-2 font-dubai">
              اكتشف عالم العقارات الفاخرة
            </h3>
            <p className="text-white/90 text-sm mb-4 font-dubai leading-relaxed">
              انضم إلى مفتاحك واستمتع بتجربة عقارية استثنائية مع خدمات مخصصة لك
            </p>
            <Button
              variant="outline"
              className="w-full bg-white/10 border-white/40 text-white hover:bg-white/20"
            >
              تعرف أكثر
            </Button>
          </motion.div>

          {/* تواصل معنا Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="backdrop-blur-lg bg-white/20 rounded-2xl p-6 border border-white/30"
          >
            <h3 className="text-white font-bold text-xl mb-2 font-dubai">
              هل لديك استفسار؟
            </h3>
            <p className="text-white/90 text-sm mb-4 font-dubai leading-relaxed">
              فريقنا جاهز لمساعدتك في إيجاد العقار المثالي
            </p>
            <Button
              variant="outline"
              className="w-full bg-white/10 border-white/40 text-white hover:bg-white/20"
            >
              تواصل معنا
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthBackground;
