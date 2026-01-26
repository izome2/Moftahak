'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';
import { 
  kitchenItems, 
  kitchenCategoryNames, 
  getKitchenItemsGrouped,
  type KitchenCategory,
  type KitchenItemDefinition 
} from '@/lib/feasibility/kitchen-items';

interface KitchenItemsLibraryProps {
  onItemSelect?: (item: KitchenItemDefinition) => void;
}

// مكون العنصر الفردي القابل للسحب
const DraggableKitchenItem: React.FC<{ item: KitchenItemDefinition; onSelect?: () => void }> = ({ 
  item, 
  onSelect 
}) => {
  const { currencySymbol } = useCurrencyFormatter();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `kitchen-${item.id}`,
    data: {
      id: item.id,
      type: 'room-item',
      name: item.name,
      icon: item.icon,
      price: item.defaultPrice,
      category: 'kitchen',
      sourceId: 'kitchen-library',
    },
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        flex items-center gap-2 p-2 bg-white border border-accent cursor-grab active:cursor-grabbing
        hover:border-primary/50 hover:shadow-md transition-all
        ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}
      `}
    >
      <span className="text-xl">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-dubai font-medium text-secondary truncate">
          {item.name}
        </p>
        <p className="text-xs text-secondary/60 font-dubai">
          {item.defaultPrice.toLocaleString('ar-EG')} {currencySymbol}
        </p>
      </div>
    </motion.div>
  );
};

const KitchenItemsLibrary: React.FC<KitchenItemsLibraryProps> = ({ onItemSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<KitchenCategory, boolean>>({
    appliances: true,
    cookware: false,
    utensils: false,
    storage: false,
    essentials: false,
  });

  const groupedItems = getKitchenItemsGrouped();

  // تبديل حالة التوسيع للتصنيف
  const toggleCategory = (category: KitchenCategory) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // فلترة العناصر حسب البحث
  const filterItems = (items: KitchenItemDefinition[]) => {
    if (!searchQuery) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // حساب عدد العناصر المطابقة في كل تصنيف
  const getCategoryMatchCount = (category: KitchenCategory) => {
    return filterItems(groupedItems[category]).length;
  };

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* شريط البحث */}
      <div className="p-3 border-b border-accent">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
          <input
            type="text"
            placeholder="ابحث عن عنصر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2 text-sm bg-accent/50 border border-accent focus:border-primary/50 outline-none font-dubai"
          />
        </div>
      </div>

      {/* قائمة التصنيفات والعناصر */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {(Object.keys(groupedItems) as KitchenCategory[]).map((category) => {
          const items = filterItems(groupedItems[category]);
          const matchCount = getCategoryMatchCount(category);
          const isExpanded = expandedCategories[category];

          // إخفاء التصنيفات الفارغة عند البحث
          if (searchQuery && matchCount === 0) return null;

          return (
            <div key={category} className="border-b border-accent last:border-b-0">
              {/* عنوان التصنيف */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <span className="font-dubai font-medium text-secondary text-sm">
                  {kitchenCategoryNames[category]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-secondary/10 text-secondary/70 px-2 py-0.5 font-dubai">
                    {matchCount}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-secondary/50" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-secondary/50" />
                  )}
                </div>
              </button>

              {/* عناصر التصنيف */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 grid grid-cols-1 gap-2">
                      {items.map((item) => (
                        <DraggableKitchenItem
                          key={item.id}
                          item={item}
                          onSelect={() => onItemSelect?.(item)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* رسالة عدم وجود نتائج */}
        {searchQuery && kitchenItems.filter((item) => 
          item.name.includes(searchQuery) || item.description?.includes(searchQuery)
        ).length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-secondary/50 font-dubai">
              لا توجد عناصر مطابقة للبحث
            </p>
          </div>
        )}
      </div>

      {/* تعليمات */}
      <div className="p-3 border-t border-accent bg-accent/20">
        <p className="text-xs text-secondary/50 font-dubai text-center">
          اسحب العناصر وأفلتها في منطقة المطبخ
        </p>
      </div>
    </div>
  );
};

export default KitchenItemsLibrary;
