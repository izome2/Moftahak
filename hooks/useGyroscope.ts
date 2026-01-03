'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface GyroscopeData {
  rotateX: number;
  rotateY: number;
  isSupported: boolean;
  needsPermission: boolean;
  requestPermission: () => Promise<void>;
}


export function useGyroscope(intensity: number = 1): GyroscopeData {
  const [rotation, setRotation] = useState({
    rotateX: 0,
    rotateY: 0,
    isSupported: false,
  });
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialBetaRef = useRef<number | null>(null);
  const initialGammaRef = useRef<number | null>(null);

  // Main effect that handles gyroscope events
  useEffect(() => {
    // تعطيل على desktop لتقليل الحمل
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      return;
    }
    
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      return;
    }

    const throttleDelay = 32; // ~30fps for smoother performance

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      if (rafIdRef.current === null && now - lastUpdateTimeRef.current >= throttleDelay) {
        rafIdRef.current = requestAnimationFrame(() => {
          const { beta, gamma } = event;

          if (beta !== null && gamma !== null) {
            // حفظ الزاوية الأولية عند أول قراءة
            if (initialBetaRef.current === null) {
              initialBetaRef.current = beta;
              initialGammaRef.current = gamma;
            }

            const maxTilt = 20;
            // حساب الفرق من الزاوية الافتراضية
            const deltaBeta = beta - (initialBetaRef.current || 0);
            const deltaGamma = gamma - (initialGammaRef.current || 0);
            
            const rotateX = Math.max(-maxTilt, Math.min(maxTilt, deltaBeta * 0.8 * intensity));
            const rotateY = Math.max(-maxTilt, Math.min(maxTilt, deltaGamma * 0.8 * intensity));

            setRotation({
              rotateX: -rotateX, 
              rotateY: rotateY,
              isSupported: true,
            });

            // إلغاء المؤقت السابق
            if (resetTimeoutRef.current) {
              clearTimeout(resetTimeoutRef.current);
            }

            // إعادة التعيين بعد ثانية من عدم الحركة
            resetTimeoutRef.current = setTimeout(() => {
              setRotation(prev => ({
                ...prev,
                rotateX: 0,
                rotateY: 0,
              }));
            }, 1000);
          }
          
          lastUpdateTimeRef.current = now;
          rafIdRef.current = null;
        });
      }
    };

    // تحقق إذا كان يحتاج إذن (iOS)
    const needsPermissionCheck = 
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (!needsPermissionCheck) {
      // Android وأجهزة أخرى لا تحتاج إذن - لا تظهر زر الإذن
      window.addEventListener('deviceorientation', handleOrientation);
      setRotation(prev => ({ ...prev, isSupported: true }));
    } else if (permissionGranted) {
      // iOS بعد منح الإذن
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      // iOS يحتاج إذن
      setNeedsPermission(true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [intensity, permissionGranted]);

  const requestPermission = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        
        if (permission === 'granted') {
          setPermissionGranted(true);
          setNeedsPermission(false);
          setRotation(prev => ({ ...prev, isSupported: true }));
        } else {
          setNeedsPermission(false);
        }
      } catch (error) {
        setNeedsPermission(false);
      }
    }
  }, []);

  return {
    ...rotation,
    needsPermission,
    requestPermission,
  };
}


export function useRequestGyroscopePermission() {
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        setPermissionState(permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        setPermissionState('denied');
        return false;
      }
    }
    
    setPermissionState('granted');
    return true;
  };

  return { requestPermission, permissionState };
}
