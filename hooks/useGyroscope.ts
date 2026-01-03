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
  const isPermissionGrantedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);

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
      if (!isPermissionGrantedRef.current) return;

      const now = Date.now();
      if (rafIdRef.current === null && now - lastUpdateTimeRef.current >= throttleDelay) {
        rafIdRef.current = requestAnimationFrame(() => {
          const { beta, gamma } = event;

          if (beta !== null && gamma !== null) {
            const maxTilt = 15;
            const rotateX = Math.max(-maxTilt, Math.min(maxTilt, (beta - 45) * 0.3 * intensity));
            const rotateY = Math.max(-maxTilt, Math.min(maxTilt, gamma * 0.3 * intensity));

            setRotation({
              rotateX: -rotateX, 
              rotateY: rotateY,
              isSupported: true,
            });
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
      // Android وأجهزة أخرى لا تحتاج إذن
      isPermissionGrantedRef.current = true;
      window.addEventListener('deviceorientation', handleOrientation);
      setRotation(prev => ({ ...prev, isSupported: true }));
    } else {
      setNeedsPermission(true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [intensity]);

  const requestPermission = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        console.log('🎯 طلب إذن الجايروسكوب...');
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        console.log('✅ نتيجة الإذن:', permission);
        
        if (permission === 'granted') {
          isPermissionGrantedRef.current = true;
          console.log('🎉 تم منح الإذن! تفعيل الجايروسكوب...');
          
          const handleOrientation = (event: DeviceOrientationEvent) => {
            const now = Date.now();
            const throttleDelay = 32;
            
            if (rafIdRef.current === null && now - lastUpdateTimeRef.current >= throttleDelay) {
              rafIdRef.current = requestAnimationFrame(() => {
                const { beta, gamma } = event;

                if (beta !== null && gamma !== null) {
                  const maxTilt = 15;
                  const rotateX = Math.max(-maxTilt, Math.min(maxTilt, (beta - 45) * 0.3 * intensity));
                  const rotateY = Math.max(-maxTilt, Math.min(maxTilt, gamma * 0.3 * intensity));

                  console.log('📱 بيانات الجايروسكوب:', { beta, gamma, rotateX, rotateY });

                  setRotation({
                    rotateX: -rotateX, 
                    rotateY: rotateY,
                    isSupported: true,
                  });
                }
                
                lastUpdateTimeRef.current = now;
                rafIdRef.current = null;
              });
            }
          };
          
          window.addEventListener('deviceorientation', handleOrientation);
          setNeedsPermission(false);
          setRotation(prev => ({ ...prev, isSupported: true }));
          console.log('✨ الجايروسكوب مُفعّل ويعمل!');
        }
      } catch (error) {
        console.error('❌ خطأ في طلب إذن الجايروسكوب:', error);
        setNeedsPermission(false);
      }
    }
  }, [intensity]);

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
