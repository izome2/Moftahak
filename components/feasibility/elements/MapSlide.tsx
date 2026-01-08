'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit2, X, Building2, DollarSign, Bed, Star, Hash, Save, Map, Navigation, Sparkles } from 'lucide-react';
import { MapSlideData, NearbyApartment } from '@/types/feasibility';
import dynamic from 'next/dynamic';
import { formatPrice } from '@/lib/utils';

// الظلال المتناسقة مع باقي الصفحات
const SHADOWS = {
  card: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  cardHover: '0 12px 40px rgba(16, 48, 43, 0.15), 0 4px 12px rgba(237, 191, 140, 0.1)',
  icon: '0 4px 12px rgba(237, 191, 140, 0.3)',
  button: '0 4px 16px rgba(237, 191, 140, 0.4)',
  modal: '0 25px 60px rgba(16, 48, 43, 0.25)',
};

// تحميل الخريطة ديناميكياً لأن leaflet يحتاج window
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
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

// أيقونة دبوس مخصصة
const createCustomIcon = (isMyApartment: boolean = false) => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  
  if (isMyApartment) {
    // دبوس شقتي - لون أخضر
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #10302b, #1a4a42);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(16, 48, 43, 0.4);
          border: 3px solid #0d2520;
        ">
          <svg style="transform: rotate(45deg);" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#edbf8c" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  } else {
    // دبابيس الشقق الأخرى - لون #faeee2
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: #faeee2;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: rgba(237, 191, 140, 0.3) 0px 4px 12px;
          border: 3px solid #c99a5f;
        ">
          <svg style="transform: rotate(45deg);" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10302b" stroke-width="2">
            <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
            <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
            <path d="M10 12h4"/>
            <path d="M10 8h4"/>
            <path d="M14 21v-3a2 2 0 0 0-4 0v3"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }
};

interface MapSlideProps {
  data?: MapSlideData;
  isEditing?: boolean;
  onUpdate?: (data: MapSlideData) => void;
}

// النافذة المنبثقة للدبوس
interface PinFormData {
  name: string;
  price: number;
  rooms: number;
  features: string;
  rentCount: number;
  highestRent: number;
}

const defaultFormData: PinFormData = {
  name: '',
  price: 0,
  rooms: 1,
  features: '',
  rentCount: 0,
  highestRent: 0,
};

const defaultData: MapSlideData = {
  center: {
    lat: 30.0444, // القاهرة كموقع افتراضي
    lng: 31.2357,
  },
  zoom: 13,
  pins: [],
};

export default function MapSlide({ data = defaultData, isEditing = false, onUpdate }: MapSlideProps) {
  const [mapData, setMapData] = useState<MapSlideData>(data);
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [editingPin, setEditingPin] = useState<string | null>(null);
  const [formData, setFormData] = useState<PinFormData>(defaultFormData);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<any>(null);

  // حفظ مرجع لـ onUpdate لتجنب infinite loop
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    // تأخير قليل لضمان تحميل Leaflet CSS
    const timer = setTimeout(() => setIsMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // تحديث البيانات عند التغيير (بدون onUpdate في dependencies)
  const isInitialMount = useRef(true);
  useEffect(() => {
    // تجاهل التحديث الأول لتجنب استدعاء غير ضروري
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (onUpdateRef.current) {
      onUpdateRef.current(mapData);
    }
  }, [mapData]);

  // إضافة دبوس جديد
  const handleMapClick = useCallback((e: any) => {
    if (!isEditing || mapData.pins.length >= 10) return;
    
    setPendingLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    
    // إذا كان أول دبوس، اجعله باسم "شقتي" واحفظه مباشرة بدون نافذة
    if (mapData.pins.length === 0) {
      const newApartment: NearbyApartment = {
        id: `pin-${Date.now()}`,
        name: 'شقتي',
        price: 0,
        rooms: 1,
        features: [],
        rentCount: 0,
        highestRent: 0,
        location: { lat: e.latlng.lat, lng: e.latlng.lng },
      };
      
      setMapData(prev => ({
        ...prev,
        pins: [
          {
            id: newApartment.id,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            apartment: newApartment,
          },
        ],
      }));
      
      setPendingLocation(null);
      return;
    }
    
    setFormData(defaultFormData);
    setEditingPin(null);
    setShowAddPinModal(true);
  }, [isEditing, mapData.pins.length]);

  // حفظ الدبوس
  const handleSavePin = () => {
    if (!formData.name.trim()) return;

    const newApartment: NearbyApartment = {
      id: editingPin || `pin-${Date.now()}`,
      name: formData.name,
      price: formData.price,
      rooms: formData.rooms,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      rentCount: formData.rentCount,
      highestRent: formData.highestRent,
      location: pendingLocation || { lat: mapData.center.lat, lng: mapData.center.lng },
    };

    if (editingPin) {
      // تعديل دبوس موجود
      setMapData(prev => ({
        ...prev,
        pins: prev.pins.map(pin =>
          pin.id === editingPin
            ? { ...pin, apartment: newApartment }
            : pin
        ),
      }));
    } else if (pendingLocation) {
      // إضافة دبوس جديد
      setMapData(prev => ({
        ...prev,
        pins: [
          ...prev.pins,
          {
            id: newApartment.id,
            lat: pendingLocation.lat,
            lng: pendingLocation.lng,
            apartment: newApartment,
          },
        ],
      }));
    }

    setShowAddPinModal(false);
    setPendingLocation(null);
    setEditingPin(null);
    setFormData(defaultFormData);
  };

  // تعديل دبوس
  const handleEditPin = (pinId: string) => {
    const pin = mapData.pins.find(p => p.id === pinId);
    if (!pin) return;

    setFormData({
      name: pin.apartment.name,
      price: pin.apartment.price,
      rooms: pin.apartment.rooms,
      features: pin.apartment.features.join(', '),
      rentCount: pin.apartment.rentCount,
      highestRent: pin.apartment.highestRent,
    });
    setPendingLocation({ lat: pin.lat, lng: pin.lng });
    setEditingPin(pinId);
    setShowAddPinModal(true);
  };

  // حذف دبوس
  const handleDeletePin = (pinId: string) => {
    setMapData(prev => ({
      ...prev,
      pins: prev.pins.filter(pin => pin.id !== pinId),
    }));
    setSelectedPin(null);
  };

  // التوجه للشقة على الخريطة وفتح نافذتها
  const handlePinCardClick = useCallback((pin: typeof mapData.pins[0]) => {
    setSelectedPin(pin.id);
    
    // التوجه للموقع على الخريطة
    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo([pin.lat, pin.lng], 15, {
        duration: 0.8,
      });
      
      // فتح popup بعد انتهاء الحركة
      setTimeout(() => {
        map.eachLayer((layer: any) => {
          if (layer.getLatLng && layer.openPopup) {
            const layerLatLng = layer.getLatLng();
            if (layerLatLng.lat === pin.lat && layerLatLng.lng === pin.lng) {
              layer.openPopup();
            }
          }
        });
      }, 850);
    }
  }, []);  // مكون الخريطة مع التفاعل
  const MapEvents = dynamic(
    () => import('react-leaflet').then(mod => {
      const { useMapEvents } = mod;
      return function MapEventsComponent() {
        useMapEvents({
          click: handleMapClick,
        });
        return null;
      };
    }),
    { ssr: false }
  );

  return (
    <div className="min-h-full p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Background Icon */}
          <div className="absolute -top-8 -left-8 opacity-[0.05] pointer-events-none">
            <Map className="w-48 h-48 text-primary" strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                style={{ boxShadow: SHADOWS.icon }}
              >
                <MapPin className="w-8 h-8 text-primary" strokeWidth={2} />
              </motion.div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                  خريطة المنطقة
                </h2>
                <p className="text-secondary/60 font-dubai text-sm">
                  {isEditing ? 'انقر على الخريطة لإضافة شقق محيطة' : 'عرض الشقق المحيطة بالموقع'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-accent/30 rounded-xl">
                <span className="block text-2xl font-bold text-secondary font-bristone">{mapData.pins.length}</span>
                <span className="text-xs text-secondary/60 font-dubai">شقة</span>
              </div>
              <div className="text-center px-4 py-2 bg-primary/20 rounded-xl">
                <span className="block text-xl font-bold text-primary font-bristone">10</span>
                <span className="text-xs text-secondary/60 font-dubai">الحد الأقصى</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          <div style={{ height: '480px' }}>
        {isMapReady && typeof window !== 'undefined' && (
          <>
            {/* استيراد CSS الخاص بـ Leaflet */}
            <link
              rel="stylesheet"
              href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
              integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
              crossOrigin=""
            />
            <style>{`
              .leaflet-popup-content-wrapper {
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(16, 48, 43, 0.2);
                border: 2px solid #edbf8c;
                padding: 0;
                overflow: hidden;
              }
              .leaflet-popup-content {
                margin: 0;
                font-family: var(--font-dubai), sans-serif;
              }
              .leaflet-popup-tip-container {
                display: none;
              }
              .leaflet-popup-close-button {
                color: #10302b !important;
                font-size: 18px !important;
                padding: 4px 6px !important;
                top: 8px !important;
                left: 8px !important;
                right: auto !important;
                width: 24px !important;
                height: 24px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }
              .leaflet-popup-close-button:hover {
                color: #edbf8c !important;
              }
              .leaflet-control-zoom {
                border: 2px solid #edbf8c !important;
                border-radius: 12px !important;
                overflow: hidden;
              }
              .leaflet-control-zoom a {
                color: #10302b !important;
                background: white !important;
              }
              .leaflet-control-zoom a:hover {
                background: #ead3b9 !important;
              }
            `}</style>
            <MapContainer
              center={[mapData.center.lat, mapData.center.lng]}
              zoom={mapData.zoom}
              style={{ width: '100%', height: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapEvents />
              
              {/* عرض الدبابيس */}
              {mapData.pins.map((pin, index) => {
                // أول دبوس هو شقتي
                const isMyApartment = index === 0;
                const customIcon = createCustomIcon(isMyApartment);
                return (
                  <Marker
                    key={pin.id}
                    position={[pin.lat, pin.lng]}
                    icon={customIcon}
                    eventHandlers={{
                      click: () => setSelectedPin(pin.id),
                    }}
                  >
                    <Popup>
                      <PinPopupContent
                        apartment={pin.apartment}
                        isEditing={isEditing}
                        onEdit={() => handleEditPin(pin.id)}
                        onDelete={() => handleDeletePin(pin.id)}
                      />
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </>
        )}
          </div>
          
          {/* Map Overlay Hint */}
          {isEditing && mapData.pins.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-secondary/5 pointer-events-none"
            >
              <div className="text-center p-6 bg-white/90 rounded-2xl shadow-lg border-2 border-primary/20">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Navigation className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="font-dubai font-bold text-secondary text-lg">انقر على الخريطة</p>
                <p className="font-dubai text-secondary/60 text-sm">لإضافة موقع شقة جديدة</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Apartments List Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`
            min-h-40 p-6 rounded-2xl sm:rounded-3xl border-2
            ${mapData.pins.length > 0 
              ? 'border-primary/20 bg-white/50' 
              : 'border-dashed border-secondary/20 bg-white/30'
            }
          `}
          style={{ boxShadow: mapData.pins.length > 0 ? SHADOWS.card : 'none' }}
        >
          {mapData.pins.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-32 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mb-4"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl" />
                <div 
                  className="relative w-20 h-20 bg-linear-to-br from-primary/30 to-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <Building2 className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </div>
              </motion.div>
              
              <h4 className="font-dubai font-bold text-secondary text-lg mb-1">
                لا توجد شقق مضافة
              </h4>
              <p className="font-dubai text-secondary/50 text-sm max-w-sm">
                انقر على الخريطة لإضافة شقق محيطة للمقارنة
              </p>
            </motion.div>
          ) : (
            /* Apartments Grid */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 bg-primary rounded-full" />
                <h4 className="font-dubai font-bold text-secondary text-sm">الشقق المحيطة ({mapData.pins.length})</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {mapData.pins.map((pin, index) => (
                    <motion.div
                      key={pin.id}
                      layout="position"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25, layout: { duration: 0 } }}
                      className="relative rounded-2xl bg-primary/20 p-4 sm:p-5 border-2 border-primary/30 cursor-pointer group"
                      style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
                      onClick={() => handlePinCardClick(pin)}
                    >
                      {/* Hover Glow Effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ 
                          opacity: 1,
                          boxShadow: `${SHADOWS.cardHover}, inset 0 0 0 2px rgba(237, 191, 140, 0.3)`,
                        }}
                      />

                      {/* Background Icon */}
                      <div className="absolute -top-4 -left-4 z-0 opacity-[0.07] pointer-events-none">
                        <Building2 className="w-24 h-24 text-primary" strokeWidth={1} />
                      </div>

                      {/* Shimmer Effect on Hover */}
                      <motion.div
                        className="absolute inset-0 z-20 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
                        }}
                        initial={{ opacity: 0, x: '-100%' }}
                        whileHover={{ opacity: 1, x: '100%' }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                      />

                      {/* Action Buttons - visible on hover */}
                      {isEditing && (
                        <div className="absolute -top-2 -right-2 flex z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Edit Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPin(pin.id);
                            }}
                            className="w-7 h-7 text-secondary rounded-lg flex items-center justify-center border-2 border-primary/30 hover:opacity-80 transition-colors"
                            style={{ backgroundColor: '#faeee2', boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
                          >
                            <Edit2 size={13} />
                          </motion.button>
                          
                          {/* Delete Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePin(pin.id);
                            }}
                            className="w-7 h-7 text-secondary rounded-lg flex items-center justify-center border-2 border-primary/30 hover:opacity-80 transition-colors"
                            style={{ backgroundColor: '#faeee2', boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Number Badge & Name */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border-2 border-primary/30">
                            <span className="font-bristone font-bold text-secondary text-lg">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-secondary font-dubai truncate">
                              {pin.apartment.name}
                            </h3>
                            <p className="text-secondary/50 text-xs font-dubai">
                              {pin.apartment.rooms} غرف • {pin.apartment.rentCount} تأجير
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-3 border-t border-secondary/10">
                          <span className="text-sm text-secondary/60 font-dubai">سعر الليلة</span>
                          <motion.span 
                            className="font-dubai font-bold text-primary text-lg"
                            key={pin.apartment.price}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                          >
                            {formatPrice(pin.apartment.price)}
                          </motion.span>
                        </div>

                        {/* Features Preview */}
                        {pin.apartment.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {pin.apartment.features.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-accent/50 text-secondary/70 font-dubai text-[10px] rounded-md"
                              >
                                {feature}
                              </span>
                            ))}
                            {pin.apartment.features.length > 3 && (
                              <span className="px-2 py-0.5 bg-primary/20 text-primary font-dubai text-[10px] rounded-md">
                                +{pin.apartment.features.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* Summary Card */}
        {mapData.pins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-r from-secondary to-secondary/90 p-6 text-white"
            style={{ boxShadow: SHADOWS.modal }}
          >
            {/* Background Pattern */}
            <div className="absolute -top-10 -left-10 opacity-10 pointer-events-none">
              <Map className="w-40 h-40 text-white" strokeWidth={1} />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-dubai font-bold text-xl">ملخص المنطقة</h4>
                  <span className="text-white/70 text-sm font-dubai">{mapData.pins.length} شقة محيطة</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="block font-bristone font-bold text-2xl text-primary">
                    {formatPrice(Math.round(mapData.pins.reduce((sum, p) => sum + p.apartment.price, 0) / mapData.pins.length))}
                  </span>
                  <span className="text-white/60 text-xs font-dubai">متوسط السعر</span>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <span className="block font-bristone font-bold text-2xl text-primary">
                    {formatPrice(Math.max(...mapData.pins.map(p => p.apartment.highestRent || p.apartment.price)))}
                  </span>
                  <span className="text-white/60 text-xs font-dubai">أعلى إيجار</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* نافذة إضافة/تعديل الدبوس */}
      <AnimatePresence>
        {showAddPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4"
            onClick={() => setShowAddPinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden max-w-md w-full"
              style={{ boxShadow: SHADOWS.modal }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-white p-5 flex items-center justify-between relative overflow-hidden border-b-2 border-primary/20">
                <div className="absolute inset-0 opacity-[0.03]">
                  <Building2 className="absolute -top-10 -right-10 w-40 h-40 text-primary" />
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/30" style={{ boxShadow: SHADOWS.icon }}>
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-dubai font-bold text-secondary text-xl">
                      {editingPin ? 'تعديل معلومات الشقة' : 'إضافة شقة جديدة'}
                    </h3>
                    <p className="text-secondary/60 text-sm font-dubai">أدخل تفاصيل الشقة المحيطة</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddPinModal(false)}
                  className="w-10 h-10 bg-accent/50 rounded-xl text-secondary flex items-center justify-center hover:bg-accent transition-colors relative z-10" style={{ boxShadow: SHADOWS.card }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 bg-linear-to-b from-accent/20 to-white">
                {/* اسم الشقة */}
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                    <Building2 className="w-4 h-4 inline-block ml-1 text-primary" />
                    اسم الشقة
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: شقة الزهراء"
                  />
                </div>

                {/* السعر وعدد الغرف */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                      <DollarSign className="w-4 h-4 inline-block ml-1 text-primary" />
                      السعر (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                      <Bed className="w-4 h-4 inline-block ml-1 text-primary" />
                      عدد الغرف
                    </label>
                    <input
                      type="number"
                      value={formData.rooms}
                      onChange={e => setFormData(prev => ({ ...prev, rooms: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      min="1"
                    />
                  </div>
                </div>

                {/* عدد مرات التأجير وأعلى سعر */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                      <Hash className="w-4 h-4 inline-block ml-1 text-primary" />
                      مرات التأجير
                    </label>
                    <input
                      type="number"
                      value={formData.rentCount}
                      onChange={e => setFormData(prev => ({ ...prev, rentCount: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                      <Star className="w-4 h-4 inline-block ml-1 text-primary" />
                      أعلى إيجار (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formData.highestRent}
                      onChange={e => setFormData(prev => ({ ...prev, highestRent: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* المميزات */}
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                    <Sparkles className="w-4 h-4 inline-block ml-1 text-primary" />
                    المميزات (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={formData.features}
                    onChange={e => setFormData(prev => ({ ...prev, features: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: مفروشة، تكييف، واي فاي"
                  />
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 pt-5 border-t border-primary/10">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSavePin}
                    disabled={!formData.name.trim()}
                    className="flex-1 px-6 py-3.5 bg-linear-to-r from-primary to-primary/80 text-secondary rounded-xl font-dubai font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-primary/30"
                    style={{ boxShadow: SHADOWS.button }}
                  >
                    <Save className="w-5 h-5" />
                    {editingPin ? 'حفظ التعديلات' : 'إضافة الشقة'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddPinModal(false)}
                    className="px-6 py-3.5 bg-white border-2 border-primary/30 text-secondary rounded-xl font-dubai font-bold hover:border-primary/50 hover:bg-accent/30 transition-all"
                    style={{ boxShadow: SHADOWS.card }}
                  >
                    إلغاء
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// محتوى النافذة المنبثقة للدبوس
interface PinPopupContentProps {
  apartment: NearbyApartment;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function PinPopupContent({ apartment, isEditing, onEdit, onDelete }: PinPopupContentProps) {
  return (
    <div className="min-w-48 max-w-56" dir="rtl">
      {/* Header */}
      <div className="bg-linear-to-r from-primary/30 to-primary/10 px-3 py-2 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary/30 rounded-lg flex items-center justify-center border border-primary/40">
            <Building2 className="w-3.5 h-3.5 text-secondary" />
          </div>
          <h4 className="font-dubai font-bold text-secondary text-sm truncate">
            {apartment.name}
          </h4>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 space-y-2 bg-linear-to-b from-accent/10 to-white">
        {/* السعر الرئيسي */}
        <div className="flex items-center justify-between bg-primary/15 rounded-lg p-2 border border-primary/20">
          <span className="font-dubai text-secondary/70 text-xs">سعر الليلة</span>
          <span className="font-dubai font-bold text-secondary text-sm">{apartment.price.toLocaleString('ar-EG')} <span className="text-[10px] text-primary font-bold">ج.م</span></span>
        </div>
        
        {/* التفاصيل */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5 bg-white border border-primary/15 rounded-lg p-1.5">
            <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">
              <Bed className="w-3 h-3 text-primary" />
            </div>
            <span className="font-dubai font-bold text-secondary text-xs">{apartment.rooms} غرف</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-primary/15 rounded-lg p-1.5">
            <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">
              <Hash className="w-3 h-3 text-primary" />
            </div>
            <span className="font-dubai font-bold text-secondary text-xs">{apartment.rentCount} تأجير</span>
          </div>
        </div>
        
        {apartment.highestRent > 0 && (
          <div className="flex items-center justify-between bg-accent/40 rounded-lg p-2">
            <span className="font-dubai text-secondary/70 flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-primary" />
              أعلى إيجار
            </span>
            <span className="font-dubai font-bold text-secondary text-xs">{apartment.highestRent.toLocaleString('ar-EG')} ج.م</span>
          </div>
        )}

        {apartment.features.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-primary/10">
            {apartment.features.slice(0, 4).map((feature, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-primary/25 text-secondary font-dubai text-[10px] rounded border border-primary/30 font-bold"
              >
                {feature}
              </span>
            ))}
            {apartment.features.length > 4 && (
              <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary/60 font-dubai text-[10px] rounded font-bold">
                +{apartment.features.length - 4}
              </span>
            )}
          </div>
        )}

        {isEditing && (
          <div className="flex gap-1.5 pt-2 border-t border-primary/10">
            <button
              onClick={onEdit}
              className="flex-1 px-2 py-1.5 bg-white text-secondary font-dubai text-xs rounded-lg transition-all flex items-center justify-center gap-1 font-bold border border-secondary/20 hover:bg-accent/30"
            >
              <Edit2 className="w-3 h-3" />
              تعديل
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-2 py-1.5 bg-white text-secondary font-dubai text-xs rounded-lg transition-all flex items-center justify-center gap-1 font-bold border border-secondary/20 hover:bg-accent/30"
            >
              <Trash2 className="w-3 h-3" />
              حذف
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
