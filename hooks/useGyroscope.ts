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
  const [permissionChecked, setPermissionChecked] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialBetaRef = useRef<number | null>(null);
  const initialGammaRef = useRef<number | null>(null);
  const lastBetaRef = useRef<number>(0);
  const lastGammaRef = useRef<number>(0);

  // Check permission from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPermission = localStorage.getItem('gyroPermissionGranted') === 'true';
      if (storedPermission) {
        setPermissionGranted(true);
      }
      setPermissionChecked(true);
    }
  }, []);

  
  useEffect(() => {
    // Wait until permission check is complete
    if (!permissionChecked) {
      return;
    }
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      return;
    }
    
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (rafIdRef.current !== null) {
        return; // Skip if animation frame already scheduled
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const { beta, gamma } = event;

        if (beta !== null && gamma !== null) {
          
          if (initialBetaRef.current === null) {
            initialBetaRef.current = beta;
            initialGammaRef.current = gamma;
          }

          const maxTilt = 20;
          
          const deltaBeta = beta - (initialBetaRef.current || 0);
          const deltaGamma = gamma - (initialGammaRef.current || 0);
          
          
          const betaChanged = Math.abs(beta - lastBetaRef.current) > 0.5;
          const gammaChanged = Math.abs(gamma - lastGammaRef.current) > 0.5;
          
          if (betaChanged || gammaChanged) {
            const rotateX = Math.max(-maxTilt, Math.min(maxTilt, deltaBeta * 0.8 * intensity));
            const rotateY = Math.max(-maxTilt, Math.min(maxTilt, deltaGamma * 0.8 * intensity));

            setRotation({
              rotateX: -rotateX, 
              rotateY: rotateY,
              isSupported: true,
            });

            lastBetaRef.current = beta;
            lastGammaRef.current = gamma;

            
            if (resetTimeoutRef.current) {
              clearTimeout(resetTimeoutRef.current);
            }

            
            resetTimeoutRef.current = setTimeout(() => {
              setRotation(prev => ({
                ...prev,
                rotateX: 0,
                rotateY: 0,
              }));
            }, 1000);
          }
        }
        
        rafIdRef.current = null;
      });
    };

    
    const needsPermissionCheck = 
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (!needsPermissionCheck) {
      // Android and other devices that don't need permission
      window.addEventListener('deviceorientation', handleOrientation);
      setRotation(prev => ({ ...prev, isSupported: true }));
    } else if (permissionGranted) {
      // iOS with granted permission
      window.addEventListener('deviceorientation', handleOrientation);
      setRotation(prev => ({ ...prev, isSupported: true }));
      setNeedsPermission(false);
    } else {
      // iOS without permission - needs user interaction
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
  }, [intensity, permissionGranted, permissionChecked]);

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
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('gyroPermissionGranted', 'true');
          }
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
