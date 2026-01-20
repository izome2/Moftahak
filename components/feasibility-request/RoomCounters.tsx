'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bed, Bath, Sofa, ChefHat, Minus, Plus, Home } from 'lucide-react';

interface RoomCountersProps {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
  onChange: (rooms: {
    bedrooms?: number;
    bathrooms?: number;
    livingRooms?: number;
    kitchens?: number;
  }) => void;
  errors?: Record<string, string>;
  compact?: boolean;
}

interface CounterItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  error?: string;
  compact?: boolean;
}

function CounterItem({ 
  label, 
  value, 
  icon, 
  min = 0, 
  max = 10, 
  onChange,
  error,
  compact = false
}: CounterItemProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  if (compact) {
    return (
      <div className={`
        flex items-center justify-between p-3 rounded-xl bg-white/60 border-2 transition-all
        ${error ? 'border-red-400' : 'border-secondary/10 hover:border-primary/30'}
      `}>
        <div className="flex items-center gap-2">
          <div className="text-primary">
            {icon}
          </div>
          <span className="text-sm font-medium text-secondary font-dubai">{label}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className={`
              w-6 h-6 rounded-md flex items-center justify-center transition-all text-xs
              ${value <= min 
                ? 'bg-secondary/5 text-secondary/30 cursor-not-allowed' 
                : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white'
              }
            `}
          >
            <Minus className="w-3 h-3" />
          </button>
          
          <span className="text-base font-bold text-secondary font-bristone w-5 text-center">
            {value}
          </span>
          
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className={`
              w-6 h-6 rounded-md flex items-center justify-center transition-all text-xs
              ${value >= max 
                ? 'bg-secondary/5 text-secondary/30 cursor-not-allowed' 
                : 'bg-primary text-secondary hover:bg-primary/80'
              }
            `}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Square card design with separate counter bar
  return (
    <div className="flex flex-col">
      {/* Square Icon Card */}
      <motion.div 
        className={`
          relative rounded-xl bg-white p-3 border-2 transition-all
          aspect-square flex flex-col items-center justify-center
          ${error ? 'border-red-400' : 'border-primary/20 hover:border-primary/40'}
        `}
        style={{
          boxShadow: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
        }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {/* Icon with background */}
        <div className="p-4 rounded-lg bg-primary/20 border border-primary/30 mb-2">
          <div className="text-primary">
            {icon}
          </div>
        </div>
        
        {/* Label */}
        <h3 className="text-sm font-bold text-secondary font-dubai text-center leading-tight">
          {label}
        </h3>
      </motion.div>
      
      {/* Counter Bar - Below the card */}
      <div 
        className="mt-1.5 rounded-lg bg-white border-2 border-primary/20 p-2 flex items-center justify-between"
        style={{
          boxShadow: 'rgba(237, 191, 140, 0.1) 0px 2px 10px',
        }}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={`
            w-8 h-8 rounded-md flex items-center justify-center transition-all
            ${value <= min 
              ? 'bg-secondary/5 text-secondary/30 cursor-not-allowed' 
              : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white'
            }
          `}
        >
          <Minus className="w-5 h-5" />
        </button>
        
        <span className="text-lg font-bold text-secondary font-bristone">
          {value}
        </span>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={`
            w-8 h-8 rounded-md flex items-center justify-center transition-all
            ${value >= max 
              ? 'bg-secondary/5 text-secondary/30 cursor-not-allowed' 
              : 'bg-primary text-secondary hover:bg-primary/80'
            }
          `}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-500 font-dubai text-center">{error}</p>
      )}
    </div>
  );
}

export default function RoomCounters({ 
  bedrooms, 
  bathrooms, 
  livingRooms, 
  kitchens, 
  onChange,
  errors = {},
  compact = false
}: RoomCountersProps) {
  const roomItems = [
    {
      key: 'bedrooms',
      label: 'غرف النوم',
      value: bedrooms,
      icon: <Bed className={compact ? "w-5 h-5" : "w-10 h-10"} />,
      min: 0,
      max: 10,
    },
    {
      key: 'bathrooms',
      label: 'الحمامات',
      value: bathrooms,
      icon: <Bath className={compact ? "w-5 h-5" : "w-10 h-10"} />,
      min: 0,
      max: 10,
    },
    {
      key: 'livingRooms',
      label: 'غرف المعيشة',
      value: livingRooms,
      icon: <Sofa className={compact ? "w-5 h-5" : "w-10 h-10"} />,
      min: 0,
      max: 5,
    },
    {
      key: 'kitchens',
      label: 'المطابخ',
      value: kitchens,
      icon: <ChefHat className={compact ? "w-5 h-5" : "w-10 h-10"} />,
      min: 0,
      max: 3,
    },
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        {roomItems.map((item) => (
          <CounterItem
            key={item.key}
            label={item.label}
            value={item.value}
            icon={item.icon}
            min={item.min}
            max={item.max}
            onChange={(val) => onChange({ [item.key]: val })}
            error={errors[item.key]}
            compact
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-linear-to-br from-white/80 to-accent/30 border-2 border-secondary/10 shadow-[0_4px_24px_rgba(16,48,43,0.08)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Home className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-secondary font-dubai">تكوين الشقة</h3>
          <p className="text-sm text-secondary/60 font-dubai">حدد عدد الغرف في شقتك</p>
        </div>
      </div>
      
      {/* Room Grid - 4 columns in one row */}
      <div className="grid grid-cols-4 gap-3">
        {roomItems.map((item) => (
          <CounterItem
            key={item.key}
            label={item.label}
            value={item.value}
            icon={item.icon}
            min={item.min}
            max={item.max}
            onChange={(val) => onChange({ [item.key]: val })}
            error={errors[item.key]}
          />
        ))}
      </div>
    </div>
  );
}
