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
    
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      return;
    }

    let isPermissionGranted = false;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!isPermissionGranted) return;

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
