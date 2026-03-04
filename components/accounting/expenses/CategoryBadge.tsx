'use client';

import React from 'react';
import {
  Sparkles,
  Wifi,
  Droplets,
  Flame,
  Zap,
  Wrench,
  ShoppingBag,
  Armchair,
  Shirt,
  Bath,
  ChefHat,
  Snowflake,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

export const CATEGORY_MAP: Record<string, CategoryConfig> = {
  CLEANING:          { label: 'تنظيف الشقة',     className: 'bg-primary/10 text-secondary',   icon: Sparkles },
  INTERNET:          { label: 'انترنت',           className: 'bg-primary/10 text-secondary',   icon: Wifi },
  WATER:             { label: 'مياه',             className: 'bg-primary/10 text-secondary',   icon: Droplets },
  GAS:               { label: 'غاز',              className: 'bg-primary/10 text-secondary',   icon: Flame },
  ELECTRICITY:       { label: 'كهرباء',           className: 'bg-primary/10 text-secondary',   icon: Zap },
  MAINTENANCE:       { label: 'صيانة',            className: 'bg-primary/10 text-secondary',   icon: Wrench },
  SUPPLIES:          { label: 'مستلزمات',         className: 'bg-primary/10 text-secondary',   icon: ShoppingBag },
  FURNITURE:         { label: 'أثاث',             className: 'bg-primary/10 text-secondary',   icon: Armchair },
  LAUNDRY:           { label: 'غسيل ملاءات',      className: 'bg-primary/10 text-secondary',   icon: Shirt },
  TOWELS:            { label: 'مناشف حمام',       className: 'bg-primary/10 text-secondary',   icon: Bath },
  KITCHEN_SUPPLIES:  { label: 'مستلزمات المطبخ',  className: 'bg-primary/10 text-secondary',   icon: ChefHat },
  AIR_CONDITIONING:  { label: 'تكييف',            className: 'bg-primary/10 text-secondary',   icon: Snowflake },
  OTHER:             { label: 'أخرى',             className: 'bg-primary/10 text-secondary',   icon: MoreHorizontal },
};

export const CATEGORY_COLORS: Record<string, string> = {
  CLEANING:         '#7a9ab5',
  INTERNET:         '#9a7ab5',
  WATER:            '#6ab5a5',
  GAS:              '#c49a6c',
  ELECTRICITY:      '#c4a86c',
  MAINTENANCE:      '#8a8a8a',
  SUPPLIES:         '#5a9a7a',
  FURNITURE:        '#b5946a',
  LAUNDRY:          '#7a7ab5',
  TOWELS:           '#6aa5a5',
  KITCHEN_SUPPLIES: '#b57a8a',
  AIR_CONDITIONING: '#6a9ab5',
  OTHER:            '#8a857e',
};

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'sm',
  showIcon = true,
}) => {
  const config = CATEGORY_MAP[category] || CATEGORY_MAP.OTHER;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes = { sm: 10, md: 12, lg: 14 };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-dubai font-bold ${config.className} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
};

export default CategoryBadge;
