'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2, AlertCircle, Link2, Plus, Layers } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

// Map Events Handler Component
const MapEventsHandler = dynamic(
  () => Promise.resolve(function MapEventsHandlerComponent({ onClick }: { onClick: (e: any) => void }) {
    const { useMapEvents } = require('react-leaflet');
    useMapEvents({
      click: onClick,
    });
    return null;
  }),
  { ssr: false }
);

// Map Controller Component - to enable/disable interactions
const MapController = dynamic(
  () => Promise.resolve(function MapControllerComponent({ isActive }: { isActive: boolean }) {
    const { useMap } = require('react-leaflet');
    const map = useMap();
    
    React.useEffect(() => {
      if (isActive) {
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
      } else {
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
      }
    }, [map, isActive]);
    
    return null;
  }),
  { ssr: false }
);

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  error?: string;
}

// Egypt center coordinates
const EGYPT_CENTER = { lat: 30.0444, lng: 31.2357 };
const DEFAULT_ZOOM = 13;

// Create custom marker icon
const createMarkerIcon = () => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  
  return L.divIcon({
    className: 'custom-location-pin',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(180deg, #1a4a42, #10302b);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(16, 48, 43, 0.5);
        border: 2px solid #edbf8c;
        animation: pinDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">
        <svg style="transform: rotate(45deg);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#edbf8c" stroke-width="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <style>
        @keyframes pinDrop {
          0% { 
            opacity: 0;
            margin-top: -10px;
          }
          100% { 
            opacity: 1;
            margin-top: 0;
          }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

export default function LocationPicker({ 
  latitude, 
  longitude, 
  onChange,
  error 
}: LocationPickerProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isMapActive, setIsMapActive] = useState(false);
  const mapRef = useRef<any>(null);

  // Check if location is selected
  const hasLocation = latitude !== undefined && longitude !== undefined;

  // Get current location using Geolocation API
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onChange(lat, lng);
        setIsLocating(false);
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 16, { duration: 1 });
        }
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('تم رفض الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError('الموقع غير متاح حالياً');
            break;
          case err.TIMEOUT:
            setLocationError('انتهت مهلة تحديد الموقع');
            break;
          default:
            setLocationError('حدث خطأ أثناء تحديد الموقع');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onChange]);

  // Extract coordinates from Google Maps link
  const extractCoordsFromLink = useCallback((url: string): { lat: number; lng: number } | null => {
    try {
      // Pattern 1: @lat,lng in URL (e.g., @30.269029,31.7635614)
      const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const atMatch = url.match(atPattern);
      if (atMatch) {
        return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
      }

      // Pattern 2: /search/lat,lng or /search/lat,+lng (from short URL redirect)
      const searchPattern = /\/search\/(-?\d+\.?\d*),\+?(-?\d+\.?\d*)/;
      const searchMatch = url.match(searchPattern);
      if (searchMatch) {
        return { lat: parseFloat(searchMatch[1]), lng: parseFloat(searchMatch[2]) };
      }

      // Pattern 3: Coordinates in path (e.g., /place/30°16'08.5"N+31°45'46.5"E)
      const dmsPattern = /(\d+)°(\d+)'([\d.]+)"([NS]).*?(\d+)°(\d+)'([\d.]+)"([EW])/;
      const dmsMatch = url.match(dmsPattern);
      if (dmsMatch) {
        const latDeg = parseFloat(dmsMatch[1]);
        const latMin = parseFloat(dmsMatch[2]);
        const latSec = parseFloat(dmsMatch[3]);
        const latDir = dmsMatch[4];
        
        const lngDeg = parseFloat(dmsMatch[5]);
        const lngMin = parseFloat(dmsMatch[6]);
        const lngSec = parseFloat(dmsMatch[7]);
        const lngDir = dmsMatch[8];
        
        let lat = latDeg + latMin / 60 + latSec / 3600;
        let lng = lngDeg + lngMin / 60 + lngSec / 3600;
        
        if (latDir === 'S') lat = -lat;
        if (lngDir === 'W') lng = -lng;
        
        return { lat, lng };
      }

      // Pattern 4: q=lat,lng or ll=lat,lng
      const qPattern = /[?&](q|ll)=(-?\d+\.?\d*),\+?(-?\d+\.?\d*)/;
      const qMatch = url.match(qPattern);
      if (qMatch) {
        return { lat: parseFloat(qMatch[2]), lng: parseFloat(qMatch[3]) };
      }

      // Pattern 5: !3d lat !4d lng (data parameter)
      const dataPattern = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
      const dataMatch = url.match(dataPattern);
      if (dataMatch) {
        return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
      }

      // Pattern 6: Plain coordinates like "30.015789, 31.228574" or "30.015789,31.228574"
      const plainCoordsPattern = /(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/;
      const plainMatch = url.match(plainCoordsPattern);
      if (plainMatch) {
        const lat = parseFloat(plainMatch[1]);
        const lng = parseFloat(plainMatch[2]);
        // Make sure it's a valid coordinate (lat: -90 to 90, lng: -180 to 180)
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  // Add location from Google Maps link
  const addLocationFromLink = useCallback(async () => {
    if (!linkInput.trim()) return;

    setIsAddingLink(true);
    setLocationError(null);

    try {
      let urlToProcess = linkInput.trim();
      let coords = null;
      
      // If it's a shortened URL (goo.gl), try to expand it via API
      if (urlToProcess.includes('goo.gl') || urlToProcess.includes('maps.app.goo.gl')) {
        try {
          // Use our API to expand the URL and extract coordinates
          const response = await fetch(`/api/expand-url?url=${encodeURIComponent(urlToProcess)}`);
          const data = await response.json();
          
          if (response.ok && data.coordinates) {
            // Use coordinates extracted by the API
            coords = data.coordinates;
          } else if (response.ok && data.expandedUrl) {
            // Try to parse the expanded URL
            urlToProcess = data.expandedUrl;
            coords = extractCoordsFromLink(urlToProcess);
          }
        } catch (err) {
          console.error('API Error:', err);
          // If expansion fails, try to parse the original URL
          coords = extractCoordsFromLink(urlToProcess);
        }
      } else {
        // Not a shortened URL, try direct extraction
        coords = extractCoordsFromLink(urlToProcess);
      }
      
      if (coords) {
        onChange(coords.lat, coords.lng);
        setLinkInput('');
        
        if (mapRef.current) {
          mapRef.current.flyTo([coords.lat, coords.lng], 16, { duration: 1 });
        }
      } else {
        setLocationError('لم يتم العثور على الموقع من خلال الرابط. استخدم الخريطة الموجودة أمامك');
      }
    } catch {
      setLocationError('حدث خطأ أثناء معالجة الرابط');
    } finally {
      setIsAddingLink(false);
    }
  }, [linkInput, extractCoordsFromLink, onChange]);

  // Handle map click
  const handleMapClick = useCallback((e: any) => {
    const { lat, lng } = e.latlng;
    onChange(lat, lng);
  }, [onChange]);

  // Initialize map ready state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMapReady(true);
    }
  }, []);

  return (
    <div className="md:p-6 md:rounded-2xl md:bg-linear-to-br md:from-white/80 md:to-accent/30 md:border-2 md:border-secondary/10 md:shadow-[0_4px_24px_rgba(16,48,43,0.08)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
          <MapPin className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-bold text-secondary font-dubai">موقع الشقة</h3>
          <p className="text-xs md:text-sm text-secondary/60 font-dubai">انقر على الخريطة أو أضف رابط الموقع</p>
        </div>
      </div>

      {/* Link Input & Action Buttons */}
      <div className="mb-3 md:mb-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="url"
              dir="ltr"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLocationFromLink()}
              placeholder="https://maps.google.com/..."
              className="w-full pr-10 pl-4 py-2.5 md:py-2 rounded-lg border-2 border-secondary/20 bg-white/70 
                focus:outline-none focus:border-primary
                transition-all font-dubai text-sm text-left"
            />
            <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
          </div>
          <div className="flex gap-2">
          <button
            type="button"
            onClick={addLocationFromLink}
            disabled={isAddingLink || !linkInput.trim()}
            className="flex-1 md:flex-none px-3 py-2.5 md:py-2 rounded-lg bg-secondary text-white font-dubai text-sm
              hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-1.5"
          >
            {isAddingLink ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                إضافة
              </>
            )}
          </button>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="flex-1 md:flex-none px-3 py-2.5 md:py-2 rounded-lg bg-primary text-secondary font-dubai text-sm
              hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-1.5"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                موقعي
              </>
            )}
          </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        className={`relative rounded-xl overflow-hidden border-2 h-[280px] md:h-[400px] transition-all ${
          error ? 'border-red-400' : 'border-secondary/10'
        }`}
      >
        {isMapReady ? (
          <>
            <MapContainer
              center={hasLocation ? [latitude!, longitude!] : [EGYPT_CENTER.lat, EGYPT_CENTER.lng]}
              zoom={hasLocation ? 16 : DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              attributionControl={false}
              zoomControl={false}
              scrollWheelZoom={false}
              dragging={false}
              doubleClickZoom={false}
              touchZoom={false}
            >
              <TileLayer
                url={isSatellite 
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
              
              {/* Map Controller - to enable/disable interactions */}
              <MapController isActive={isMapActive} />
              
              {/* Click Handler */}
              <MapEventsHandler onClick={handleMapClick} />
              
              {/* Marker */}
              {hasLocation && (
                <Marker
                  position={[latitude!, longitude!]}
                  icon={createMarkerIcon()}
                />
              )}
            </MapContainer>
            
            {/* Click to Activate Overlay */}
            {!isMapActive && (
              <div 
                className="absolute inset-0 bg-secondary/5 backdrop-blur-[0.5px] flex items-center justify-center z-[500] cursor-pointer"
                onClick={() => setIsMapActive(true)}
              >
                <motion.div 
                  className="bg-white/95 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl text-center pointer-events-none"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="text-secondary font-dubai font-bold text-lg mb-1">انقر لتفعيل الخريطة</p>
                  <p className="text-secondary/60 font-dubai text-sm">اضغط على الخريطة للتفاعل معها</p>
                </motion.div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/5">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        )}

        {/* Map Controls */}
        {isMapReady && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-[1000]">
            {/* Zoom In */}
            <button
              type="button"
              onClick={() => mapRef.current?.zoomIn()}
              className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-md flex items-center justify-center text-secondary hover:bg-white transition-all border border-secondary/10"
            >
              <Plus className="w-4 h-4" />
            </button>
            {/* Zoom Out */}
            <button
              type="button"
              onClick={() => mapRef.current?.zoomOut()}
              className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-md flex items-center justify-center text-secondary hover:bg-white transition-all border border-secondary/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {/* Toggle Satellite */}
            <button
              type="button"
              onClick={() => setIsSatellite(!isSatellite)}
              className={`w-8 h-8 backdrop-blur-sm rounded-lg shadow-md flex items-center justify-center transition-all border ${
                isSatellite 
                  ? 'bg-secondary text-white border-secondary' 
                  : 'bg-white/95 text-secondary hover:bg-white border-secondary/10'
              }`}
              title={isSatellite ? 'عرض الخريطة' : 'عرض القمر الصناعي'}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overlay Instruction */}
        {!hasLocation && isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-secondary/5">
            <motion.div 
              className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Navigation className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-secondary font-dubai font-medium">انقر على الخريطة لتحديد موقع شقتك</p>
            </motion.div>
          </div>
        )}

        {/* Location Loading Overlay */}
        {isLocating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-2" />
              <p className="text-secondary font-dubai">جاري تحديد موقعك...</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages - Only errors */}
      {(locationError || error) && (
        <motion.div 
          className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 font-dubai">{locationError || error}</p>
        </motion.div>
      )}
    </div>
  );
}
