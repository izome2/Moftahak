'use client';

import { useEffect, useState } from 'react';

interface GyroscopeData {
  rotateX: number;
  rotateY: number;
  isSupported: boolean;
}


export function useGyroscope(intensity: number = 1): GyroscopeData {
  const [rotation, setRotation] = useState<GyroscopeData>({
    rotateX: 0,
    rotateY: 0,
    isSupported: false,
  });

  useEffect(() => {
    // تعطيل على desktop لتقليل الحمل
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      return;
    }
    
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      return;
    }

    let isPermissionGranted = false;
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const throttleDelay = 32; // ~30fps for smoother performance

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!isPermissionGranted) return;

      const now = Date.now();
      if (rafId === null && now - lastUpdateTime >= throttleDelay) {
        rafId = requestAnimationFrame(() => {
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
          
          lastUpdateTime = now;
          rafId = null;
        });
      }
    };

    
    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            isPermissionGranted = true;
            window.addEventListener('deviceorientation', handleOrientation);
            setRotation(prev => ({ ...prev, isSupported: true }));
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        
        isPermissionGranted = true;
        window.addEventListener('deviceorientation', handleOrientation);
        setRotation(prev => ({ ...prev, isSupported: true }));
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [intensity]);

  return rotation;
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
