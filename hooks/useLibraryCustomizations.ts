/**
 * Hook لإدارة تخصيصات عناصر المكتبة
 * يقوم بجلب الأسعار والصور المخصصة من قاعدة البيانات
 * وتحديثها عند تعديل العناصر
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ItemCustomization {
  customPrice: number | null;
  image: string | null;
  roomType: string;
}

export type CustomizationsMap = Record<string, ItemCustomization>;

interface UseLibraryCustomizationsReturn {
  customizations: CustomizationsMap;
  isLoading: boolean;
  error: string | null;
  getCustomPrice: (itemId: string, defaultPrice: number) => number;
  getCustomImage: (itemId: string) => string | null;
  updateItemPrice: (itemId: string, roomType: string, price: number) => Promise<void>;
  updateItemImage: (itemId: string, roomType: string, image: string | null) => Promise<void>;
  refreshCustomizations: () => Promise<void>;
}

// Cache للتخصيصات على مستوى التطبيق
let globalCustomizations: CustomizationsMap = {};
let isFetched = false;
let fetchPromise: Promise<void> | null = null;

export function useLibraryCustomizations(): UseLibraryCustomizationsReturn {
  const [customizations, setCustomizations] = useState<CustomizationsMap>(globalCustomizations);
  const [isLoading, setIsLoading] = useState(!isFetched);
  const [error, setError] = useState<string | null>(null);
  const updateQueue = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // جلب التخصيصات من الخادم
  const fetchCustomizations = useCallback(async () => {
    // إذا كان الجلب جارياً، انتظر
    if (fetchPromise) {
      await fetchPromise;
      setCustomizations(globalCustomizations);
      setIsLoading(false);
      return;
    }

    // إذا تم الجلب مسبقاً، استخدم الـ cache
    if (isFetched) {
      setCustomizations(globalCustomizations);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchPromise = (async () => {
      try {
        const response = await fetch('/api/admin/library-items');
        
        if (!response.ok) {
          throw new Error('Failed to fetch customizations');
        }

        const data = await response.json();
        globalCustomizations = data.customizations || {};
        isFetched = true;
        setCustomizations(globalCustomizations);
      } catch (err) {
        console.error('Error fetching library customizations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
        fetchPromise = null;
      }
    })();

    await fetchPromise;
  }, []);

  // جلب التخصيصات عند التحميل
  useEffect(() => {
    fetchCustomizations();
  }, [fetchCustomizations]);

  // الحصول على السعر المخصص أو الافتراضي
  const getCustomPrice = useCallback((itemId: string, defaultPrice: number): number => {
    const customization = customizations[itemId];
    return customization?.customPrice ?? defaultPrice;
  }, [customizations]);

  // الحصول على الصورة المخصصة
  const getCustomImage = useCallback((itemId: string): string | null => {
    const customization = customizations[itemId];
    return customization?.image ?? null;
  }, [customizations]);

  // تحديث السعر مع debounce
  const updateItemPrice = useCallback(async (
    itemId: string, 
    roomType: string, 
    price: number
  ): Promise<void> => {
    // تحديث محلي فوري
    const newCustomizations = {
      ...globalCustomizations,
      [itemId]: {
        ...globalCustomizations[itemId],
        customPrice: price,
        roomType,
        image: globalCustomizations[itemId]?.image ?? null,
      },
    };
    globalCustomizations = newCustomizations;
    setCustomizations(newCustomizations);

    // إلغاء التحديث السابق إذا كان موجوداً (debounce)
    const existingTimeout = updateQueue.current.get(`price-${itemId}`);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // تأخير إرسال الطلب لتجنب الطلبات المتكررة
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch('/api/admin/library-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, roomType, customPrice: price }),
        });

        if (!response.ok) {
          throw new Error('Failed to update price');
        }
      } catch (err) {
        console.error('Error updating item price:', err);
      } finally {
        updateQueue.current.delete(`price-${itemId}`);
      }
    }, 500);

    updateQueue.current.set(`price-${itemId}`, timeout);
  }, []);

  // تحديث الصورة
  const updateItemImage = useCallback(async (
    itemId: string, 
    roomType: string, 
    image: string | null
  ): Promise<void> => {
    // تحديث محلي فوري
    const newCustomizations = {
      ...globalCustomizations,
      [itemId]: {
        ...globalCustomizations[itemId],
        image,
        roomType,
        customPrice: globalCustomizations[itemId]?.customPrice ?? null,
      },
    };
    globalCustomizations = newCustomizations;
    setCustomizations(newCustomizations);

    // إرسال الطلب فوراً للصور
    try {
      const response = await fetch('/api/admin/library-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, roomType, image }),
      });

      if (!response.ok) {
        throw new Error('Failed to update image');
      }
    } catch (err) {
      console.error('Error updating item image:', err);
    }
  }, []);

  // إعادة جلب التخصيصات
  const refreshCustomizations = useCallback(async () => {
    isFetched = false;
    await fetchCustomizations();
  }, [fetchCustomizations]);

  // تنظيف الـ timeouts عند إلغاء التحميل
  useEffect(() => {
    return () => {
      updateQueue.current.forEach((timeout) => clearTimeout(timeout));
      updateQueue.current.clear();
    };
  }, []);

  return {
    customizations,
    isLoading,
    error,
    getCustomPrice,
    getCustomImage,
    updateItemPrice,
    updateItemImage,
    refreshCustomizations,
  };
}

// دالة مساعدة لإعادة تعيين الـ cache (للاختبارات)
export function resetCustomizationsCache() {
  globalCustomizations = {};
  isFetched = false;
  fetchPromise = null;
}
