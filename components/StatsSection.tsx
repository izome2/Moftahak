'use client';

import React, { useRef } from 'react';
import { Moon, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCounter } from '@/hooks/useCounter';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useScrollAnimation(sectionRef, { threshold: 0.3, once: true });

  const nightsCount = useCounter({ start: 0, end: 3000, duration: 2500 }, isVisible);
  const clientsCount = useCounter({ start: 0, end: 1200, duration: 2500 }, isVisible);
  const yearsCount = useCounter({ start: 0, end: 5, duration: 2000 }, isVisible);

  const stats = [
    {
      icon: Moon,
      count: nightsCount,
      label: 'ليلة',
      description: 'ليالي إقامة تمت إدارتها بنجاح',
      delay: 0.1,
    },
    {
      icon: Users,
      count: clientsCount,
      label: 'عميل راضي',
      description: 'عملاء سعداء بخدماتنا المتميزة',
      delay: 0.2,
    },
    {
      icon: Award,
      count: yearsCount,
      label: 'سنين خبرة',
      description: 'خبرة متراكمة في السوق العقاري',
      delay: 0.3,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative pt-12 bg-white sm:hidden"
      aria-label="إحصائياتنا"
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden bg-white border border-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer p-4 rounded-xl shadow-md text-center group"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: stat.delay }}
            >
              {/* Background Icon - Large and Transparent */}
              <div className="absolute -bottom-14 left-9 opacity-5 pointer-events-none">
                <stat.icon className="w-52 h-52 text-primary" strokeWidth={1.5} />
              </div>

              {/* Icon */}
              <div className="relative flex justify-center mb-3">
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-secondary group-hover:scale-105">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Counter */}
              <div className="relative flex items-center justify-center gap-1.5 mb-2">
                <span className="text-2xl font-bold text-secondary font-bristone group-hover:text-primary transition-colors duration-300">
                  {stat.count}
                </span>
                <span className="text-base font-semibold text-secondary/70">
                  {stat.label}
                </span>
              </div>

              {/* Description */}
              <p className="relative text-sm text-secondary/60 leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
