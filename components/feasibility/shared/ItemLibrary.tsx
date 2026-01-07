'use client';

/**
 * ItemLibrary - مكتبة العناصر الموحدة
 * 
 * تعرض قائمة العناصر المتاحة للإضافة في شكل grid
 * تستخدم في جميع شرائح الغرف
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Library, type LucideIcon } from 'lucide-react';
import { 
  SHADOWS, 
  popupVariants,
  overlayVariants,
  containerVariants,
  widgetVariants,
  HOVER_EFFECTS,
  TAP_EFFECTS,
  formatPrice 
} from '@/lib/feasibility/design-system';

// ============================================
// 📋 TYPES
// ============================================

export interface LibraryItem {
  id: string;
  name: string;
  icon: LucideIcon;
  defaultPrice: number;
  category: string;
}

export interface ItemLibraryProps {
  /** هل المكتبة مفتوحة */
  isOpen: boolean;
  /** دالة الإغلاق */
  onClose: () => void;
  /** عنوان المكتبة */
  title: string;
  /** قائمة العناصر */
  items: LibraryItem[];
  /** دالة إضافة عنصر */
  onAddItem: (item: LibraryItem) => void;
  /** أيقونة المكتبة */
  icon?: LucideIcon;
}

// ============================================
// 🎨 COMPONENT
// ============================================

const ItemLibrary: React.FC<ItemLibraryProps> = ({
  isOpen,
  onClose,
  title,
  items,
  onAddItem,
  icon: LibraryIcon = Library,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // فلترة العناصر حسب البحث
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // تجميع العناصر حسب الفئة
  const groupedItems = useMemo(() => {
    const groups: Record<string, LibraryItem[]> = {};
    
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  // إضافة عنصر
  const handleAddItem = (item: LibraryItem) => {
    onAddItem(item);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-9998"
          />
          
          {/* Library Panel */}
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-4 bottom-4 left-4 w-96 max-w-[calc(100vw-2rem)] 
                       bg-white rounded-2xl z-9999 flex flex-col overflow-hidden"
            style={{ boxShadow: SHADOWS.popup }}
          >
            {/* Header */}
            <div className="bg-linear-to-r from-secondary to-secondary/90 text-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <LibraryIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold font-dubai text-lg">{title}</h3>
                    <p className="text-primary/80 text-xs">{items.length} عنصر متاح</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 
                             flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن عنصر..."
                  className="w-full pl-4 pr-10 py-2.5 bg-white/10 border border-white/20 
                             rounded-xl text-white placeholder:text-white/50
                             focus:outline-none focus:bg-white/15 focus:border-primary/50
                             transition-all duration-200 text-sm font-dubai"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4">
              {Object.keys(groupedItems).length === 0 ? (
                <div className="text-center py-12 text-secondary/50">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-dubai">لا توجد نتائج</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category}>
                      {/* Category Title */}
                      <h4 className="text-sm font-bold text-secondary/70 font-dubai mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {category}
                        <span className="text-xs text-secondary/40 font-normal">
                          ({categoryItems.length})
                        </span>
                      </h4>

                      {/* Items Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {categoryItems.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <motion.button
                              key={item.id}
                              variants={widgetVariants}
                              whileHover={HOVER_EFFECTS.lift}
                              whileTap={TAP_EFFECTS.press}
                              onClick={() => handleAddItem(item)}
                              className="bg-white border border-secondary/10 rounded-xl p-3
                                         text-right group transition-all duration-200
                                         hover:border-primary/30"
                              style={{ boxShadow: SHADOWS.soft }}
                            >
                              {/* Icon */}
                              <div className="w-10 h-10 rounded-lg mb-2
                                              bg-linear-to-br from-primary/20 to-primary/10
                                              flex items-center justify-center
                                              group-hover:from-primary/30 group-hover:to-primary/20
                                              transition-all duration-200">
                                <ItemIcon className="w-5 h-5 text-primary" />
                              </div>

                              {/* Name */}
                              <p className="font-dubai font-medium text-secondary text-sm truncate mb-1">
                                {item.name}
                              </p>

                              {/* Price & Add */}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-primary font-bold">
                                  {formatPrice(item.defaultPrice)} ج.م
                                </span>
                                <div className="w-6 h-6 rounded-md bg-primary/10 
                                                flex items-center justify-center
                                                group-hover:bg-primary group-hover:text-white
                                                transition-all duration-200">
                                  <Plus className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-accent/30 px-5 py-3 border-t border-secondary/5">
              <p className="text-xs text-secondary/60 text-center font-dubai">
                اضغط على أي عنصر لإضافته للقائمة
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ItemLibrary;
