'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit2, X, Building2, DollarSign, Bed, Star, Hash, Save, Map, Navigation, Sparkles, MousePointer2, Wand2, ExternalLink, Link2, Loader2, AlertCircle, CheckCircle2, Copy, Search, Home, Users, Bath, Layers, Minus, Satellite } from 'lucide-react';
import { MapSlideData, NearbyApartment } from '@/types/feasibility';
import dynamic from 'next/dynamic';
import { formatPrice } from '@/lib/utils';


type AdditionMode = 'selection' | 'manual' | 'auto';


const SHADOWS = {
  card: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  cardHover: '0 12px 40px rgba(16, 48, 43, 0.15), 0 4px 12px rgba(237, 191, 140, 0.1)',
  icon: '0 4px 12px rgba(237, 191, 140, 0.3)',
  button: '0 4px 16px rgba(237, 191, 140, 0.4)',
  modal: '0 25px 60px rgba(16, 48, 43, 0.25)',
};


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



const createCustomIcon = (type: 'my' | 'airbnb' | 'manual' = 'manual') => {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  
  if (type === 'my') {
    
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
  } else if (type === 'airbnb') {
    
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #FF5A5F, #E04850);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(255, 90, 95, 0.4);
          border: 3px solid #C44449;
        ">
          <svg style="transform: rotate(45deg);" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
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
  } else {
    
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


interface PinFormData {
  name: string;
  price: number;
  rooms: number;
  guests: number;
  beds: number;
  bathrooms: number;
  rating: number;
  features: string;
  rentCount: number;
  highestRent: number;
}

const defaultFormData: PinFormData = {
  name: '',
  price: 0,
  rooms: 1,
  guests: 2,
  beds: 1,
  bathrooms: 1,
  rating: 0,
  features: '',
  rentCount: 0,
  highestRent: 0,
};

const defaultData: MapSlideData = {
  center: {
    lat: 30.0444, 
    lng: 31.2357,
  },
  zoom: 13,
  pins: [],
};


const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

export default function MapSlide({ data = defaultData, isEditing = false, onUpdate }: MapSlideProps) {
  const [mapData, setMapData] = useState<MapSlideData>(data);
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [editingPin, setEditingPin] = useState<string | null>(null);
  const [formData, setFormData] = useState<PinFormData>(defaultFormData);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingClientLocation, setPendingClientLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');
  const mapRef = useRef<any>(null);
  
  
  const [additionMode, setAdditionMode] = useState<AdditionMode>('selection');
  
  
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [isLoadingAirbnb, setIsLoadingAirbnb] = useState(false);
  const [airbnbError, setAirbnbError] = useState<string | null>(null);
  const [quickAddForm, setQuickAddForm] = useState<PinFormData>(defaultFormData);
  const [addedApartments, setAddedApartments] = useState<NearbyApartment[]>([]);
  
  
  const [airbnbListings, setAirbnbListings] = useState<NearbyApartment[]>([]);
  const [selectedAirbnbListings, setSelectedAirbnbListings] = useState<Set<string>>(new Set());
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  
  const [lookupUrl, setLookupUrl] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<NearbyApartment | null>(null);

  
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    
    const timer = setTimeout(() => setIsMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  
  const isInitialMount = useRef(true);
  useEffect(() => {
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (onUpdateRef.current) {
      onUpdateRef.current(mapData);
    }
  }, [mapData]);

  
  const handleMapClick = useCallback((e: any) => {
    if (!isEditing || mapData.pins.length >= 10) return;
    
    
    if (mapData.pins.length === 0) {
      setPendingClientLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      return;
    }
    
    setPendingLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    setFormData(defaultFormData);
    setEditingPin(null);
    setShowAddPinModal(true);
  }, [isEditing, mapData.pins.length]);

  
  const handleSaveClientApartment = useCallback(() => {
    if (!pendingClientLocation) return;
    
    const newApartment: NearbyApartment = {
      id: `pin-${Date.now()}`,
      name: 'شقتي',
      price: 0,
      rooms: 1,
      features: [],
      rentCount: 0,
      highestRent: 0,
      location: pendingClientLocation,
      isClientApartment: true, // تمييز شقة العميل
    };
    
    setMapData(prev => ({
      ...prev,
      pins: [
        {
          id: newApartment.id,
          lat: pendingClientLocation.lat,
          lng: pendingClientLocation.lng,
          apartment: newApartment,
        },
      ],
    }));
    
    setPendingClientLocation(null);
    setAdditionMode('selection'); 
  }, [pendingClientLocation]);

  
  const handleSavePin = () => {
    if (!formData.name.trim()) return;

    // الحصول على بيانات الشقة الأصلية إذا كنا نعدل pin موجود
    const existingPin = editingPin ? mapData.pins.find(p => p.id === editingPin) : null;
    const existingApartment = existingPin?.apartment;

    const newApartment: NearbyApartment = {
      id: editingPin || `pin-${Date.now()}`,
      name: formData.name,
      price: formData.price,
      rooms: formData.rooms,
      guests: formData.guests,
      beds: formData.beds,
      bathrooms: formData.bathrooms,
      rating: formData.rating,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      rentCount: formData.rentCount,
      highestRent: formData.highestRent,
      location: pendingLocation || existingApartment?.location || { lat: mapData.center.lat, lng: mapData.center.lng },
      // الحفاظ على الخصائص الأصلية عند التعديل
      airbnbUrl: existingApartment?.airbnbUrl,
      thumbnailUrl: existingApartment?.thumbnailUrl,
      images: existingApartment?.images,
      description: existingApartment?.description,
      isClientApartment: existingApartment?.isClientApartment,
      subtitle: existingApartment?.subtitle,
      reviewsCount: existingApartment?.reviewsCount,
    };

    if (editingPin) {
      
      setMapData(prev => ({
        ...prev,
        pins: prev.pins.map(pin =>
          pin.id === editingPin
            ? { ...pin, apartment: newApartment }
            : pin
        ),
      }));
    } else if (pendingLocation) {
      
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

  
  const handleEditPin = (pinId: string) => {
    const pin = mapData.pins.find(p => p.id === pinId);
    if (!pin || !pin.apartment) return;

    setFormData({
      name: pin.apartment.name || '',
      price: pin.apartment.price || 0,
      rooms: pin.apartment.rooms || 1,
      guests: pin.apartment.guests || 2,
      beds: pin.apartment.beds || 1,
      bathrooms: pin.apartment.bathrooms || 1,
      rating: pin.apartment.rating || 0,
      features: (pin.apartment.features || []).join(', '),
      rentCount: pin.apartment.rentCount || 0,
      highestRent: pin.apartment.highestRent || 0,
    });
    setPendingLocation({ lat: pin.lat, lng: pin.lng });
    setEditingPin(pinId);
    setShowAddPinModal(true);
  };

  
  const handleDeletePin = (pinId: string) => {
    setMapData(prev => ({
      ...prev,
      pins: prev.pins.filter(pin => pin.id !== pinId),
    }));
    setSelectedPin(null);
  };

  
  const handlePinCardClick = useCallback((pin: typeof mapData.pins[0]) => {
    setSelectedPin(pin.id);
    
    
    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo([pin.lat, pin.lng], 15, {
        duration: 0.8,
      });
      
      
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
  }, []);

  
  const handleOpenAirbnb = useCallback(() => {
    const { center, zoom } = mapData;
    
    
    const latOffset = 0.02 * (14 - Math.min(zoom, 14));
    const lngOffset = 0.02 * (14 - Math.min(zoom, 14));
    
    const params = new URLSearchParams({
      'refinement_paths[]': '/homes',
      'adults': '2',
      'place_id': '',
      'search_mode': 'regular_search',
      'price_filter_input_type': '2',
      'channel': 'EXPLORE',
      'ne_lat': String(center.lat + latOffset),
      'ne_lng': String(center.lng + lngOffset),
      'sw_lat': String(center.lat - latOffset),
      'sw_lng': String(center.lng - lngOffset),
      'zoom': String(zoom),
      'zoom_level': String(zoom),
      'search_by_map': 'true',
      'search_type': 'user_map_move',
    });
    
    const airbnbUrl = `https://ar.airbnb.com/s/homes?${params.toString()}`;
    window.open(airbnbUrl, '_blank', 'noopener,noreferrer');
  }, [mapData]);

  
  const handleQuickAddApartment = useCallback(() => {
    if (!quickAddForm.name.trim()) return;

    const newApartment: NearbyApartment = {
      id: `pin-${Date.now()}`,
      name: quickAddForm.name,
      price: quickAddForm.price,
      rooms: quickAddForm.rooms,
      guests: quickAddForm.guests,
      beds: quickAddForm.beds,
      bathrooms: quickAddForm.bathrooms,
      rating: quickAddForm.rating,
      features: quickAddForm.features.split(',').map(f => f.trim()).filter(Boolean),
      rentCount: quickAddForm.rentCount,
      highestRent: quickAddForm.highestRent,
      location: { lat: mapData.center.lat, lng: mapData.center.lng },
    };

    
    setAddedApartments(prev => [...prev, newApartment]);
    
    
    setQuickAddForm(defaultFormData);
  }, [quickAddForm, mapData.center]);

  
  const handleSaveAutoApartments = useCallback(() => {
    if (addedApartments.length === 0) return;

    
    const newPins = addedApartments.map((apartment) => ({
      id: apartment.id,
      lat: apartment.location.lat,
      lng: apartment.location.lng,
      apartment,
    }));

    setMapData(prev => ({
      ...prev,
      pins: [...prev.pins, ...newPins],
    }));

    
    setAddedApartments([]);
    setAdditionMode('manual');
  }, [addedApartments]);

  
  const handleRemoveAutoApartment = useCallback((id: string) => {
    setAddedApartments(prev => prev.filter(a => a.id !== id));
  }, []);

  
  const handleLookupApartment = useCallback(async () => {
    if (!lookupUrl.trim()) return;
    
    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);
    
    try {
      const response = await fetch(`/api/feasibility/airbnb-lookup?url=${encodeURIComponent(lookupUrl)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'فشل في جلب معلومات الشقة');
      }
      
      if (data.listing) {
        const listing = data.listing;
        const apartment: NearbyApartment = {
          id: `airbnb-${listing.id}`,
          name: listing.name || 'شقة Airbnb',
          price: 0,
          rooms: listing.bedrooms || 1,
          features: [],
          rentCount: listing.reviewsCount || 0,
          highestRent: 0,
          location: {
            lat: listing.location.lat,
            lng: listing.location.lng,
          },
          airbnbUrl: listing.airbnbUrl,
          guests: listing.guests,
          beds: listing.beds,
          bathrooms: listing.bathrooms,
          rating: listing.rating,
          thumbnailUrl: listing.thumbnailUrl,
        };
        
        setLookupResult(apartment);
        
        
        if (mapRef.current) {
          mapRef.current.flyTo([listing.location.lat, listing.location.lng], 15, {
            animate: true,
            duration: 1.5,
          });
        }
      }
    } catch (error: any) {
      console.error('Error looking up apartment:', error);
      setLookupError(error.message || 'فشل في جلب معلومات الشقة');
    } finally {
      setIsLookingUp(false);
    }
  }, [lookupUrl]);

  
  const handleAddLookupResult = useCallback(() => {
    if (!lookupResult) return;
    
    
    setAddedApartments(prev => [...prev, lookupResult]);
    
    
    setLookupUrl('');
    setLookupResult(null);
  }, [lookupResult]);

  
  const mapBoundsRef = useRef<{ne_lat: number, ne_lng: number, sw_lat: number, sw_lng: number} | null>(null);

  
  const handleSearchAirbnb = useCallback(async (loadMore: boolean = false) => {
    setIsLoadingAirbnb(true);
    setAirbnbError(null);
    
    
    if (!loadMore) {
      setAirbnbListings([]);
    }
    
    try {
      
      let searchBounds = mapBoundsRef.current;
      
      
      if (!searchBounds) {
        const { center, zoom } = mapData;
        const latOffset = 0.02 * Math.pow(2, 14 - Math.min(zoom, 14));
        const lngOffset = 0.025 * Math.pow(2, 14 - Math.min(zoom, 14));
        searchBounds = {
          ne_lat: center.lat + latOffset,
          ne_lng: center.lng + lngOffset,
          sw_lat: center.lat - latOffset,
          sw_lng: center.lng - lngOffset,
        };
      }
      
      
      const existingIds = loadMore ? airbnbListings.map(a => a.id.replace('airbnb-', '')) : [];
      
      const response = await fetch('/api/feasibility/airbnb-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...searchBounds,
          adults: 2,
          thoroughness: 'normal',
          excludeIds: existingIds, 
          searchStrategy: loadMore ? 'micro-grid' : 'normal',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'فشل في جلب البيانات');
      }
      
      if (data.listings && data.listings.length > 0) {
        
        const clientPin = mapData.pins.find(p => p.apartment.isClientApartment === true);
        const clientApartment = clientPin || mapData.pins[0];
        
        
        let newApartments: NearbyApartment[] = data.listings.map((listing: any) => ({
          id: `airbnb-${listing.id}`,
          name: listing.name || 'شقة Airbnb',
          price: listing.price || 0,
          rooms: listing.bedrooms || 1,
          features: [],
          rentCount: listing.reviewsCount || 0,
          highestRent: listing.price || 0,
          location: {
            lat: listing.lat,
            lng: listing.lng,
          },
          airbnbUrl: `https://ar.airbnb.com/rooms/${listing.id}`,
          
          guests: listing.guests,
          beds: listing.beds,
          bathrooms: listing.bathrooms,
          subtitle: listing.subtitle,
          rating: listing.rating,
          reviewsCount: listing.reviewsCount,
          thumbnailUrl: listing.imageUrl,
        }));
        
        
        if (clientApartment) {
          newApartments = newApartments.sort((a, b) => {
            const distA = calculateDistance(
              clientApartment.lat, clientApartment.lng,
              a.location.lat, a.location.lng
            );
            const distB = calculateDistance(
              clientApartment.lat, clientApartment.lng,
              b.location.lat, b.location.lng
            );
            return distA - distB;
          });
        }
        
        if (loadMore) {
          
          setAirbnbListings(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const uniqueNewApartments = newApartments.filter(a => !existingIds.has(a.id));
            return [...prev, ...uniqueNewApartments];
          });
        } else {
          
          const uniqueApartments = newApartments.filter((apartment, index, self) => 
            index === self.findIndex(a => a.id === apartment.id)
          );
          setAirbnbListings(uniqueApartments);
        }
      } else if (!loadMore) {
        setAirbnbError('لم يتم العثور على شقق في هذه المنطقة. جرب تكبير أو تصغير الخريطة.');
      } else {
        setAirbnbError('لم يتم العثور على شقق إضافية. جرب تحريك الخريطة قليلاً.');
      }
    } catch (error) {
      console.error('Airbnb search error:', error);
      setAirbnbError(error instanceof Error ? error.message : 'حدث خطأ أثناء البحث');
    } finally {
      setIsLoadingAirbnb(false);
    }
  }, [mapData, airbnbListings]);

  
  const toggleAirbnbListing = useCallback((id: string) => {
    setSelectedAirbnbListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  
  const selectAllAirbnbListings = useCallback(() => {
    setSelectedAirbnbListings(new Set(airbnbListings.map(l => l.id)));
  }, [airbnbListings]);

  
  const deselectAllAirbnbListings = useCallback(() => {
    setSelectedAirbnbListings(new Set());
  }, []);

  
  const selectNearest10 = useCallback(() => {
    
    const nearest10Ids = airbnbListings.slice(0, 10).map(l => l.id);
    setSelectedAirbnbListings(new Set(nearest10Ids));
  }, [airbnbListings]);

  
  const fetchApartmentDetails = async (listingId: string): Promise<{ guests: number; beds: number; bathrooms: number; rating: number; reviewsCount: number; name: string } | null> => {
    try {
      
      const cleanId = listingId.replace('airbnb-', '');
      const response = await fetch(`/api/feasibility/airbnb-details?id=${cleanId}`);
      if (!response.ok) return null;
      const data = await response.json();
      if (data.success && data.details) {
        return {
          guests: data.details.guests || 0,
          beds: data.details.beds || 0,
          bathrooms: data.details.bathrooms || 0,
          rating: data.details.rating || 0,
          reviewsCount: data.details.reviewsCount || 0,
          name: data.details.name || '',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching apartment details:', error);
      return null;
    }
  };

  
  const handleAddSelectedAirbnbListings = useCallback(async () => {
    const selectedListings = airbnbListings.filter(l => selectedAirbnbListings.has(l.id));
    
    if (selectedListings.length === 0) return;
    
    setIsFetchingDetails(true);
    setAirbnbError(null);
    
    try {
      
      const enrichedListings = await Promise.all(
        selectedListings.map(async (listing) => {
          const details = await fetchApartmentDetails(listing.id);
          if (details) {
            return {
              ...listing,
              guests: details.guests || listing.guests,
              beds: details.beds || listing.beds,
              bathrooms: details.bathrooms || listing.bathrooms,
              rating: details.rating || listing.rating,
              reviewsCount: details.reviewsCount || listing.reviewsCount,
              name: details.name || listing.name,
            };
          }
          return listing;
        })
      );
      
      setAddedApartments(prev => [...prev, ...enrichedListings]);
      setSelectedAirbnbListings(new Set());
      setAirbnbListings([]);
    } catch (error) {
      console.error('Error enriching listings:', error);
      
      setAddedApartments(prev => [...prev, ...selectedListings]);
      setSelectedAirbnbListings(new Set());
      setAirbnbListings([]);
    } finally {
      setIsFetchingDetails(false);
    }
  }, [airbnbListings, selectedAirbnbListings]);

  
  const MapEventsHandler = useMemo(() => {
    return dynamic(
      () => import('react-leaflet').then(mod => {
        const { useMapEvents } = mod;
        
        return function MapEventsComponent({ 
          onMapClick, 
          onMapChange 
        }: { 
          onMapClick: (e: any) => void;
          onMapChange: (center: {lat: number, lng: number}, zoom: number, bounds: {ne_lat: number, ne_lng: number, sw_lat: number, sw_lng: number}) => void;
        }) {
          const map = useMapEvents({
            click: onMapClick,
            moveend: () => {
              const center = map.getCenter();
              const zoom = map.getZoom();
              const mapBounds = map.getBounds();
              onMapChange(
                { lat: center.lat, lng: center.lng }, 
                zoom,
                {
                  ne_lat: mapBounds.getNorthEast().lat,
                  ne_lng: mapBounds.getNorthEast().lng,
                  sw_lat: mapBounds.getSouthWest().lat,
                  sw_lng: mapBounds.getSouthWest().lng,
                }
              );
            },
            zoomend: () => {
              const center = map.getCenter();
              const zoom = map.getZoom();
              const mapBounds = map.getBounds();
              onMapChange(
                { lat: center.lat, lng: center.lng }, 
                zoom,
                {
                  ne_lat: mapBounds.getNorthEast().lat,
                  ne_lng: mapBounds.getNorthEast().lng,
                  sw_lat: mapBounds.getSouthWest().lat,
                  sw_lng: mapBounds.getSouthWest().lng,
                }
              );
            },
          });
          return null;
        };
      }),
      { ssr: false }
    );
  }, []);

  
  const handleMapChange = useCallback((
    center: {lat: number, lng: number}, 
    zoom: number,
    bounds: {ne_lat: number, ne_lng: number, sw_lat: number, sw_lng: number}
  ) => {
    setMapData(prev => {
      
      if (
        prev.center.lat === center.lat &&
        prev.center.lng === center.lng &&
        prev.zoom === zoom
      ) {
        return prev; 
      }
      return {
        ...prev,
        center,
        zoom,
      };
    });
    
    // استخدام ref بدلاً من state لتجنب re-render
    mapBoundsRef.current = bounds;
  }, []);

  
  if (isEditing && additionMode === 'selection' && mapData.pins.length === 0) {
    return (
      <div className="min-h-full p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {}
          <div
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
              <Map className="w-56 h-56 text-primary" strokeWidth={1.5} />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <MapPin className="w-8 h-8 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                    خريطة المنطقة
                  </h2>
                  <p className="text-secondary/60 font-dubai text-sm">
                    حدد موقع شقة العميل أولاً على الخريطة
                  </p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div
            onClick={() => setAdditionMode('manual')}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20 cursor-pointer group hover:border-primary/50 max-w-2xl mx-auto"
            style={{ boxShadow: SHADOWS.card }}
          >
            {}
            <div className="absolute -top-10 -right-10 opacity-[0.08] pointer-events-none group-hover:opacity-[0.1]">
              <Home className="w-48 h-48 text-primary" strokeWidth={1.5} />
            </div>
            
            {}
            <div className="relative z-10 text-center">
              <div 
                className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center mb-5 mx-auto"
                style={{ boxShadow: SHADOWS.icon }}
              >
                <Home className="w-10 h-10 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold text-secondary font-dubai mb-3">
                حدد موقع شقة العميل
              </h3>
              <p className="text-secondary/60 font-dubai text-sm leading-relaxed mb-5 max-w-md mx-auto">
                انقر على الخريطة لتحديد موقع شقة العميل. بعد ذلك ستتمكن من البحث عن الشقق المحيطة من Airbnb أو إضافتها يدوياً.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-primary font-dubai text-sm font-bold">
                <span>انقر للبدء</span>
                <span>←</span>
              </div>
            </div>
          </div>

          {}
          <div
            className="relative rounded-xl bg-accent/30 border-2 border-primary/10 p-4 flex items-start gap-3 max-w-2xl mx-auto"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-dubai font-bold text-secondary text-sm mb-1">الخطوة الأولى</h4>
              <p className="font-dubai text-secondary/60 text-xs leading-relaxed">
                حدد موقع شقة العميل على الخريطة أولاً. سيتم تمييزها بدبوس أخضر خاص، ثم يمكنك إضافة الشقق المحيطة للمقارنة.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  if (isEditing && additionMode === 'selection' && mapData.pins.length === 1) {
    return (
      <div className="min-h-full p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
              <Map className="w-56 h-56 text-primary" strokeWidth={1.5} />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <CheckCircle2 className="w-8 h-8 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                    تم تحديد شقة العميل ✓
                  </h2>
                  <p className="text-secondary/60 font-dubai text-sm">
                    اختر الآن طريقة إضافة الشقق المحيطة للمقارنة
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {}
            <motion.div
              initial={{ opacity: 0, x: -50, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
              onClick={() => setAdditionMode('manual')}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20 cursor-pointer group hover:border-primary/50"
              style={{ boxShadow: SHADOWS.card }}
            >
              {}
              <div className="absolute -top-10 -right-10 opacity-[0.08] pointer-events-none group-hover:opacity-[0.1]">
                <MousePointer2 className="w-48 h-48 text-primary" strokeWidth={1.5} />
              </div>

              <div className="relative z-10">
                <div 
                  className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center mb-5"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <MousePointer2 className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-xl font-bold text-secondary font-dubai mb-2">
                  إضافة يدوية
                </h3>
                <p className="text-secondary/60 font-dubai text-sm leading-relaxed mb-4">
                  انقر على الخريطة لتحديد مواقع الشقق المحيطة يدوياً وأدخل تفاصيلها بنفسك
                </p>
                
                <div className="flex items-center gap-2 text-primary font-dubai text-sm font-bold">
                  <span>ابدأ الآن</span>
                  <span>←</span>
                </div>
              </div>
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0, x: 50, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
              onClick={() => setAdditionMode('auto')}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20 cursor-pointer group hover:border-primary/50"
              style={{ boxShadow: SHADOWS.card }}
            >
              {}
              <div className="absolute -top-10 -right-10 opacity-[0.08] pointer-events-none group-hover:opacity-[0.1]">
                <Wand2 className="w-48 h-48 text-primary" strokeWidth={1.5} />
              </div>

              <div className="relative z-10">
                <div 
                  className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#FF5A5F]/30 flex items-center justify-center mb-5"
                  style={{ boxShadow: '0 4px 12px rgba(255, 90, 95, 0.3)' }}
                >
                  <img src="/images/airbnb-logo.jpg" alt="Airbnb" className="w-full h-full object-cover" />
                </div>
                
                <h3 className="text-xl font-bold text-secondary font-dubai mb-2">
                  إضافة من Airbnb
                </h3>
                <p className="text-secondary/60 font-dubai text-sm leading-relaxed mb-4">
                  ابحث تلقائياً عن الشقق المحيطة من Airbnb مباشرة على الخريطة واختر ما يناسبك
                </p>
                
                <div className="flex items-center gap-2 text-secondary font-dubai text-sm font-bold">
                  <span>ابدأ الآن</span>
                  <span>←</span>
                </div>
              </div>
            </motion.div>
          </div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative rounded-xl bg-accent/30 border-2 border-primary/10 p-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-dubai font-bold text-secondary text-sm mb-1">نصيحة</h4>
              <p className="font-dubai text-secondary/60 text-xs leading-relaxed">
                يمكنك البحث مباشرة عن الشقق المحيطة من Airbnb. حرك الخريطة للمنطقة المطلوبة واضغط "بحث في المنطقة" لجلب الشقق تلقائياً.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  
  if (isEditing && additionMode === 'auto') {
    return (
      <div className="min-h-full p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-5 sm:p-6 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (addedApartments.length > 0) {
                      if (confirm('لديك شقق لم يتم حفظها. هل تريد المتابعة؟')) {
                        setAdditionMode('selection');
                        setAddedApartments([]);
                        setAirbnbListings([]);
                      }
                    } else {
                      setAdditionMode('selection');
                      setAirbnbListings([]);
                    }
                  }}
                  className="p-3 rounded-xl bg-accent/50 border-2 border-primary/20 text-secondary hover:bg-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-secondary font-dubai">
                    البحث التلقائي من Airbnb
                  </h2>
                  <p className="text-secondary/60 font-dubai text-xs sm:text-sm">
                    ابحث واختر الشقق من Airbnb مباشرة
                  </p>
                </div>
              </div>
              
              {}
              <div className="flex items-center gap-2">
                {}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearchAirbnb(airbnbListings.length > 0)}
                  disabled={isLoadingAirbnb}
                  className="flex items-center gap-2 px-5 py-3 bg-[#FF5A5F] text-white rounded-xl font-dubai font-bold transition-[background-color,opacity] duration-200 disabled:opacity-70 hover:bg-[#E04850]"
                  style={{ boxShadow: '0 4px 16px rgba(255, 90, 95, 0.4)' }}
                >
                  {isLoadingAirbnb ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري البحث...
                    </>
                  ) : airbnbListings.length > 0 ? (
                    <>
                      <Plus className="w-5 h-5" />
                      تحميل المزيد
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      بحث في المنطقة
                    </>
                  )}
                </motion.button>
                
                {}
                {airbnbListings.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSearchAirbnb(false)}
                    disabled={isLoadingAirbnb}
                    className="flex items-center gap-2 px-4 py-3 bg-secondary/10 text-secondary rounded-xl font-dubai font-bold transition-[background-color,opacity] duration-200 disabled:opacity-70 hover:bg-secondary/20"
                  >
                    <Search className="w-4 h-4" />
                    بحث جديد
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="bg-linear-to-r from-primary/30 to-primary/10 px-3 py-2 border-b-2 border-primary/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-primary" />
                    <span className="font-dubai font-bold text-secondary text-sm">حدد المنطقة</span>
                  </div>
                  
                  {}
                  {lookupResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-2 py-1 bg-[#FF5A5F]/10 border border-[#FF5A5F]/30 rounded-lg"
                    >
                      <span className="font-dubai text-xs text-secondary truncate">{lookupResult.name}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddLookupResult}
                        className="flex items-center gap-1 px-2 py-1 bg-[#FF5A5F] hover:bg-[#E04850] text-white rounded font-dubai font-bold text-xs transition-colors duration-150 shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        أضف
                      </motion.button>
                      <button
                        onClick={() => {
                          setLookupResult(null);
                          setLookupUrl('');
                        }}
                        className="text-secondary/40 hover:text-secondary/60 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                  
                  {}
                  {lookupError && (
                    <span className="font-dubai text-xs text-red-500">{lookupError}</span>
                  )}
                </div>
                
                {}
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLookupApartment}
                    disabled={isLookingUp || !lookupUrl.trim()}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#FF5A5F] hover:bg-[#E04850] text-white rounded-lg font-dubai font-bold text-xs transition-[background-color,opacity] duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLookingUp ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5" />
                    )}
                  </motion.button>
                  <div className="relative w-64">
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <Link2 className="w-3.5 h-3.5 text-[#FF5A5F]" />
                    </div>
                    <input
                      type="text"
                      value={lookupUrl}
                      onChange={(e) => setLookupUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookupApartment()}
                      placeholder="رابط Airbnb..."
                      className="w-full pr-8 pl-2 py-1.5 bg-white border border-[#FF5A5F]/30 rounded-lg font-dubai text-xs text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-[#FF5A5F] transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ height: '480px' }} className="relative">
              {isMapReady && typeof window !== 'undefined' && (
                <>
                  <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                  />
                  <style>{`
                    .leaflet-control-zoom {
                      display: none !important;
                    }
                  `}</style>
                  
                  {/* أزرار التحكم المخصصة */}
                  <div className="absolute top-4 left-4 z-1000 flex flex-col gap-2">
                    {/* زر تبديل نوع الخريطة */}
                    <button
                      onClick={() => setMapLayer(prev => prev === 'street' ? 'satellite' : 'street')}
                      className="w-10 h-10 bg-white border-2 border-primary rounded-xl flex items-center justify-center text-secondary hover:bg-primary/20 transition-colors"
                      style={{ boxShadow: SHADOWS.button }}
                      title={mapLayer === 'street' ? 'عرض القمر الصناعي' : 'عرض الخريطة العادية'}
                    >
                      {mapLayer === 'street' ? (
                        <Satellite className="w-5 h-5" />
                      ) : (
                        <Map className="w-5 h-5" />
                      )}
                    </button>
                    
                    {/* أزرار التكبير والتصغير */}
                    <div className="flex flex-col bg-white border-2 border-primary rounded-xl overflow-hidden" style={{ boxShadow: SHADOWS.button }}>
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.setZoom(mapRef.current.getZoom() + 1);
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-primary/20 transition-colors border-b border-primary/30"
                        title="تكبير"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.setZoom(mapRef.current.getZoom() - 1);
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-primary/20 transition-colors"
                        title="تصغير"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <MapContainer
                    center={[mapData.center.lat, mapData.center.lng]}
                    zoom={mapData.zoom}
                    style={{ width: '100%', height: '100%' }}
                    ref={mapRef}
                    attributionControl={false}
                  >
                    <TileLayer
                      attribution={mapLayer === 'street' 
                        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        : '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                      }
                      url={mapLayer === 'street'
                        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      }
                    />
                    <MapEventsHandler 
                      onMapClick={handleMapClick} 
                      onMapChange={handleMapChange}
                    />
                    {}
                    {(() => {
                      const clientPin = mapData.pins.find(p => p.apartment?.isClientApartment === true) || mapData.pins[0];
                      return clientPin ? (
                        <Marker
                          position={[clientPin.lat, clientPin.lng]}
                          icon={createCustomIcon('my')}
                        >
                          <Popup>
                            <div className="min-w-40 p-2 text-right" dir="rtl">
                              <h4 className="font-dubai font-bold text-secondary text-sm">🏠 شقة العميل</h4>
                              <p className="font-dubai text-secondary/60 text-xs">الموقع المرجعي للبحث</p>
                            </div>
                          </Popup>
                        </Marker>
                      ) : null;
                    })()}
                    {}
                    {airbnbListings.map((listing) => {
                      const customIcon = createCustomIcon('airbnb');
                      const isSelected = selectedAirbnbListings.has(listing.id);
                      return (
                        <Marker
                          key={listing.id}
                          position={[listing.location.lat, listing.location.lng]}
                          icon={customIcon}
                          eventHandlers={{
                            click: () => toggleAirbnbListing(listing.id),
                          }}
                        >
                          <Popup>
                            <div className="min-w-40 p-2 text-right" dir="rtl">
                              <h4 className="font-dubai font-bold text-secondary text-sm mb-2">{listing.name}</h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toggleAirbnbListing(listing.id)}
                                  className={`flex-1 px-3 py-1.5 rounded-lg font-dubai text-xs font-bold transition-colors duration-150 ${
                                    isSelected 
                                      ? 'bg-primary text-secondary' 
                                      : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                                  }`}
                                >
                                  {isSelected ? '✓ محددة' : 'تحديد'}
                                </button>
                                {listing.airbnbUrl && (
                                  <button
                                    onClick={() => window.open(listing.airbnbUrl, '_blank', 'noopener,noreferrer')}
                                    className="px-3 py-1.5 bg-[#FF5A5F]/10 hover:bg-[#FF5A5F]/20 text-[#FF5A5F] rounded-lg font-dubai text-xs font-bold transition-colors duration-150"
                                    title="عرض في Airbnb"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                    {}
                    {addedApartments.map((apartment) => {
                      const customIcon = createCustomIcon('airbnb');
                      return (
                        <Marker
                          key={apartment.id}
                          position={[apartment.location.lat, apartment.location.lng]}
                          icon={customIcon}
                        >
                          <Popup>
                            <div className="min-w-40 p-2 text-right" dir="rtl">
                              <h4 className="font-dubai font-bold text-secondary text-sm">{apartment.name}</h4>
                              <p className="font-dubai text-secondary/60 text-xs">تمت الإضافة ✓</p>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                    {}
                    {lookupResult && (
                      <Marker
                        position={[lookupResult.location.lat, lookupResult.location.lng]}
                        icon={createCustomIcon('airbnb')}
                      >
                        <Popup>
                          <div className="min-w-48 p-2 text-right" dir="rtl">
                            <h4 className="font-dubai font-bold text-secondary text-sm mb-1">{lookupResult.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-secondary/60 font-dubai mb-2">
                              <span>{lookupResult.guests} ضيوف</span>
                              <span>•</span>
                              <span>{lookupResult.rooms} غرف</span>
                              {(lookupResult.rating ?? 0) > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    {(lookupResult.rating ?? 0).toFixed(1)}
                                  </span>
                                </>
                              )}
                            </div>
                            <button
                              onClick={handleAddLookupResult}
                              className="w-full px-3 py-1.5 bg-[#FF5A5F] hover:bg-[#E04850] text-white rounded-lg font-dubai text-xs font-bold transition-colors duration-150"
                            >
                              <Plus className="w-3.5 h-3.5 inline ml-1" />
                              إضافة للقائمة
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </>
              )}
            </div>
          </motion.div>

          {}
          {airbnbError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-dubai font-bold text-red-700 text-sm">خطأ في البحث</h4>
                <p className="font-dubai text-red-600 text-xs">{airbnbError}</p>
              </div>
            </motion.div>
          )}

          {}
          {airbnbListings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
              style={{ boxShadow: SHADOWS.card }}
            >
              <div className="bg-linear-to-l from-[#FF5A5F]/20 to-[#FF5A5F]/5 p-4 border-b-2 border-[#FF5A5F]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5A5F]/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#FF5A5F]" />
                    </div>
                    <div>
                      <h3 className="font-dubai font-bold text-secondary">نتائج البحث من Airbnb</h3>
                      <p className="font-dubai text-secondary/60 text-xs">
                        {airbnbListings.length} شقة • {selectedAirbnbListings.size} محددة
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={selectAllAirbnbListings}
                      className="px-3 py-1.5 bg-primary/20 text-secondary rounded-lg font-dubai text-xs font-bold hover:bg-primary/30 transition-colors"
                    >
                      تحديد الكل
                    </button>
                    <button
                      onClick={selectNearest10}
                      className="px-3 py-1.5 bg-[#FF5A5F]/20 text-[#FF5A5F] rounded-lg font-dubai text-xs font-bold hover:bg-[#FF5A5F]/30 transition-colors"
                    >
                      أقرب 10
                    </button>
                    <button
                      onClick={deselectAllAirbnbListings}
                      className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg font-dubai text-xs font-bold hover:bg-secondary/20 transition-colors"
                    >
                      إلغاء الكل
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {airbnbListings.map((listing) => {
                    const isSelected = selectedAirbnbListings.has(listing.id);
                    return (
                      <motion.div
                        key={listing.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleAirbnbListing(listing.id)}
                        className={`relative p-3 rounded-xl border-2 cursor-pointer transition-[border-color,background-color] duration-200 ${
                          isSelected 
                            ? 'border-[#FF5A5F] bg-[#FF5A5F]/10' 
                            : 'border-primary/20 bg-primary/5 hover:border-primary/40'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF5A5F] rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <h4 className="font-dubai font-bold text-secondary text-sm truncate mb-1">
                          {listing.name}
                        </h4>
                        {listing.rentCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="font-dubai text-secondary/50 text-[10px]">
                              {listing.rentCount} تقييم
                            </span>
                          </div>
                        )}
                        {listing.airbnbUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(listing.airbnbUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-[#FF5A5F]/10 hover:bg-[#FF5A5F]/20 text-[#FF5A5F] rounded-lg font-dubai text-[10px] font-bold transition-colors duration-150"
                          >
                            <ExternalLink className="w-3 h-3" />
                            عرض في Airbnb
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {}
              {selectedAirbnbListings.size > 0 && (
                <div className="p-4 border-t-2 border-primary/10">
                  <motion.button
                    whileHover={{ scale: isFetchingDetails ? 1 : 1.02, y: isFetchingDetails ? 0 : -2 }}
                    whileTap={{ scale: isFetchingDetails ? 1 : 0.98 }}
                    onClick={handleAddSelectedAirbnbListings}
                    disabled={isFetchingDetails}
                    className={`w-full px-6 py-3.5 bg-[#FF5A5F] text-white rounded-xl font-dubai font-bold transition-[background-color,opacity,transform] duration-200 flex items-center justify-center gap-2 ${
                      isFetchingDetails ? 'opacity-80 cursor-wait' : ''
                    }`}
                    style={{ boxShadow: '0 4px 16px rgba(255, 90, 95, 0.4)' }}
                  >
                    {isFetchingDetails ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري جلب التفاصيل...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        إضافة {selectedAirbnbListings.size} شقة للقائمة
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {}
          {addedApartments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
              style={{ boxShadow: SHADOWS.card }}
            >
              <div className="bg-linear-to-r from-secondary to-secondary/90 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-dubai font-bold text-white">الشقق الجاهزة للحفظ</h3>
                      <p className="font-dubai text-white/60 text-xs">{addedApartments.length} شقة بمواقعها الحقيقية</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {addedApartments.map((apartment, index) => (
                    <div
                      key={apartment.id}
                      className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center font-bristone font-bold text-secondary text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-dubai font-bold text-secondary text-sm">{apartment.name}</h4>
                          <p className="font-dubai text-secondary/50 text-xs">
                            {apartment.rooms} غرف • {formatPrice(apartment.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {apartment.airbnbUrl && (
                          <button
                            onClick={() => window.open(apartment.airbnbUrl, '_blank', 'noopener,noreferrer')}
                            className="w-8 h-8 bg-[#FF5A5F]/10 hover:bg-[#FF5A5F]/20 rounded-lg flex items-center justify-center text-[#FF5A5F] transition-colors duration-150"
                            title="عرض في Airbnb"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveAutoApartment(apartment.id)}
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-secondary/60 hover:text-red-500 transition-colors duration-150"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t-2 border-primary/10">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveAutoApartments}
                  className="w-full px-6 py-3.5 bg-secondary text-white rounded-xl font-dubai font-bold transition-[background-color,transform] duration-200 flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 4px 16px rgba(16, 48, 43, 0.3)' }}
                >
                  <Save className="w-5 h-5 text-primary" />
                  حفظ {addedApartments.length} شقة في الخريطة
                </motion.button>
              </div>
            </motion.div>
          )}

          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={() => setAdditionMode('manual')}
              className="font-dubai text-secondary/60 text-sm hover:text-primary transition-colors underline underline-offset-4"
            >
              أو التبديل للإضافة اليدوية على الخريطة
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {}
          <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
            <Map className="w-56 h-56 text-primary" strokeWidth={1.5} />
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
                  {isEditing 
                    ? (mapData.pins.length === 0 
                        ? 'انقر على الخريطة لتحديد موقع شقة العميل' 
                        : 'انقر على الخريطة لإضافة شقق محيطة')
                    : 'عرض الشقق المحيطة بالموقع'}
                </p>
              </div>
            </div>

            {}
            <div className="flex items-center gap-3">
              {}
              {isEditing && mapData.pins.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAdditionMode('auto')}
                  className="flex flex-col items-center justify-center gap-1 w-20 h-20 bg-[#FF5A5F] text-white rounded-xl font-dubai font-bold text-xs transition-[background-color,transform] duration-200 text-center leading-tight"
                  style={{ boxShadow: '0 4px 12px rgba(255, 90, 95, 0.3)' }}
                >
                  <Wand2 className="w-5 h-5" />
                  <span>إضافة من<br />Airbnb</span>
                </motion.button>
              )}
              
              <div 
                className="text-center px-4 py-2 bg-accent/40 rounded-xl border-2 border-primary/20"
                style={{ boxShadow: SHADOWS.card }}
              >
                <span className="block text-2xl font-bold text-secondary font-bristone">{Math.max(0, mapData.pins.length - 1)}</span>
                <span className="text-xs text-secondary/60 font-dubai">شقة محيطة</span>
              </div>
              <div 
                className="text-center px-4 py-2 bg-primary/20 rounded-xl border-2 border-primary/30"
                style={{ boxShadow: SHADOWS.icon }}
              >
                <span className="block text-xl font-bold text-primary font-bristone">9</span>
                <span className="text-xs text-secondary/60 font-dubai">الحد الأقصى</span>
              </div>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          <div style={{ height: '480px' }} className="relative">
        {isMapReady && typeof window !== 'undefined' && (
          <>
            {}
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
                display: none !important;
              }
            `}</style>
            
            {/* أزرار التحكم المخصصة */}
            <div className="absolute top-4 left-4 z-1000 flex flex-col gap-2">
              {/* زر تبديل نوع الخريطة */}
              <button
                onClick={() => setMapLayer(prev => prev === 'street' ? 'satellite' : 'street')}
                className="w-10 h-10 bg-white border-2 border-primary rounded-xl flex items-center justify-center text-secondary hover:bg-primary/20 transition-colors"
                style={{ boxShadow: SHADOWS.button }}
                title={mapLayer === 'street' ? 'عرض القمر الصناعي' : 'عرض الخريطة العادية'}
              >
                {mapLayer === 'street' ? (
                  <Satellite className="w-5 h-5" />
                ) : (
                  <Map className="w-5 h-5" />
                )}
              </button>
              
              {/* أزرار التكبير والتصغير */}
              <div className="flex flex-col bg-white border-2 border-primary rounded-xl overflow-hidden" style={{ boxShadow: SHADOWS.button }}>
                <button
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-primary/20 transition-colors border-b border-primary/30"
                  title="تكبير"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-primary/20 transition-colors"
                  title="تصغير"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <MapContainer
              center={[mapData.center.lat, mapData.center.lng]}
              zoom={mapData.zoom}
              style={{ width: '100%', height: '100%' }}
              ref={mapRef}
              attributionControl={false}
            >
              <TileLayer
                attribution={mapLayer === 'street' 
                  ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  : '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                }
                url={mapLayer === 'street'
                  ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                }
              />
              <MapEventsHandler 
                onMapClick={handleMapClick} 
                onMapChange={handleMapChange}
              />
              
              {}
              {pendingClientLocation && (
                <Marker
                  position={[pendingClientLocation.lat, pendingClientLocation.lng]}
                  icon={createCustomIcon('my')}
                >
                  <Popup>
                    <div className="min-w-40 p-2 text-right" dir="rtl">
                      <h4 className="font-dubai font-bold text-secondary text-sm">🏠 شقة العميل</h4>
                      <p className="font-dubai text-secondary/60 text-xs">انقر حفظ لتأكيد الموقع</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {}
              {mapData.pins.filter(p => p.apartment).map((pin, index) => {
                // تحقق من وجود apartment وخاصية isClientApartment
                const isMyApartment = pin.apartment?.isClientApartment === true || 
                  (index === 0 && !pin.apartment?.airbnbUrl); // fallback للـ pins القديمة
                
                const pinType: 'my' | 'airbnb' | 'manual' = isMyApartment 
                  ? 'my' 
                  : pin.apartment?.airbnbUrl 
                    ? 'airbnb' 
                    : 'manual';
                const customIcon = createCustomIcon(pinType);
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
          
          {}
          {isEditing && mapData.pins.length === 0 && !pendingClientLocation && (
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
                <p className="font-dubai text-secondary/60 text-sm">لتحديد موقع شقة العميل</p>
              </div>
            </motion.div>
          )}
          
          {}
          {pendingClientLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveClientApartment}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-dubai font-bold text-sm text-secondary transition-[background-color,transform] duration-200"
                style={{
                  background: 'linear-gradient(135deg, #f5d4a8 0%, #edbf8c 50%, #e5b07a 100%)',
                  boxShadow: '0 6px 24px rgba(237, 191, 140, 0.45), 0 3px 12px rgba(16, 48, 43, 0.1)',
                  border: '2px solid rgba(201, 154, 95, 0.5)',
                }}
              >
                <Save className="w-4 h-4" />
                <span>حفظ</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {}
        {mapData.pins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`
            min-h-40 p-6 rounded-2xl sm:rounded-3xl border-2
            ${mapData.pins.length > 1 
              ? 'border-primary/20 bg-white/50' 
              : 'border-dashed border-secondary/20 bg-white/30'
            }
          `}
          style={{ boxShadow: mapData.pins.length > 1 ? SHADOWS.card : 'none' }}
        >
          {mapData.pins.length <= 1 ? (
            
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
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 bg-primary rounded-full" />
                <h4 className="font-dubai font-bold text-secondary text-sm">الشقق المحيطة ({Math.max(0, mapData.pins.filter(p => p.apartment && !p.apartment.isClientApartment).length)})</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {mapData.pins.filter(p => p.apartment && !p.apartment.isClientApartment).map((pin, index) => (
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
                      {}
                      <motion.div 
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ 
                          opacity: 1,
                          boxShadow: `${SHADOWS.cardHover}, inset 0 0 0 2px rgba(237, 191, 140, 0.3)`,
                        }}
                      />

                      {}
                      <div className="absolute -top-4 -left-4 z-0 opacity-[0.10] pointer-events-none">
                        <Building2 className="w-24 h-24 text-primary" strokeWidth={1.5} />
                      </div>

                      {}
                      {isEditing && (
                        <div className="absolute -top-2 -right-2 flex z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {}
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
                          
                          {}
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

                      {}
                      <div className="relative z-10">
                        {}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border-2 border-primary/30">
                            <span className="font-bristone font-bold text-secondary text-lg">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-secondary font-dubai truncate">
                              {pin.apartment.name}
                            </h3>
                            <p className="text-secondary/50 text-xs font-dubai">
                              {pin.apartment.guests || 0} ضيف • {pin.apartment.rooms} غرف • {pin.apartment.beds || 0} سرير • {pin.apartment.reviewsCount || 0} تقييم
                            </p>
                          </div>
                        </div>

                        {}
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

                        {}
                        {(pin.apartment.features?.length || 0) > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {(pin.apartment.features || []).slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-accent/50 text-secondary/70 font-dubai text-[10px] rounded-md"
                              >
                                {feature}
                              </span>
                            ))}
                            {(pin.apartment.features?.length || 0) > 3 && (
                              <span className="px-2 py-0.5 bg-primary/20 text-primary font-dubai text-[10px] rounded-md">
                                +{(pin.apartment.features?.length || 0) - 3}
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
        )}

        {}
        {mapData.pins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-r from-secondary to-secondary/90 p-6 text-white"
            style={{ boxShadow: SHADOWS.modal }}
          >
            {}
            <div className="absolute -top-10 -left-10 opacity-10 pointer-events-none">
              <Map className="w-40 h-40 text-white" strokeWidth={1.5} />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-dubai font-bold text-xl">ملخص المنطقة</h4>
                  {}
                  <span className="text-white/70 text-sm font-dubai">{Math.max(0, mapData.pins.length - 1)} شقة محيطة</span>
                </div>
              </div>
              
              {}
              {(() => {
                const nearbyPins = mapData.pins.slice(1); 
                const avgPrice = nearbyPins.length > 0 
                  ? Math.round(nearbyPins.reduce((sum, p) => sum + p.apartment.price, 0) / nearbyPins.length)
                  : 0;
                const maxRent = nearbyPins.length > 0
                  ? Math.max(...nearbyPins.map(p => p.apartment.highestRent || p.apartment.price))
                  : 0;
                return (
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <span className="block font-bristone font-bold text-2xl text-primary">
                        {formatPrice(avgPrice)}
                      </span>
                      <span className="text-white/60 text-xs font-dubai">متوسط السعر</span>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div>
                      <span className="block font-bristone font-bold text-2xl text-primary">
                        {formatPrice(maxRent)}
                      </span>
                      <span className="text-white/60 text-xs font-dubai">أعلى إيجار</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </motion.div>

      {}
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
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden max-w-sm w-full"
              style={{ boxShadow: SHADOWS.modal }}
              onClick={e => e.stopPropagation()}
            >
              {}
              <div className="bg-white p-3 flex items-center justify-between relative overflow-hidden border-b-2 border-primary/20">
                <div className="absolute inset-0 opacity-[0.03]">
                  <Building2 className="absolute -top-8 -right-8 w-32 h-32 text-primary" />
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center border-2 border-primary/30" style={{ boxShadow: SHADOWS.icon }}>
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-dubai font-bold text-secondary text-base">
                      {editingPin ? 'تعديل معلومات الشقة' : 'إضافة شقة جديدة'}
                    </h3>
                    <p className="text-secondary/60 text-xs font-dubai">أدخل تفاصيل الشقة المحيطة</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddPinModal(false)}
                  className="w-8 h-8 bg-accent/50 rounded-lg text-secondary flex items-center justify-center hover:bg-accent transition-colors relative z-10" style={{ boxShadow: SHADOWS.card }}
                >
                  <X size={16} />
                </motion.button>
              </div>

              {}
              <div className="p-4 space-y-3 bg-linear-to-b from-accent/20 to-white">
                {}
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1.5 font-dubai">
                    <Building2 className="w-3 h-3 inline-block ml-1 text-primary" />
                    اسم الشقة
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                    placeholder="مثال: شقة الزهراء"
                  />
                </div>

                {}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5 font-dubai">
                      <DollarSign className="w-3 h-3 inline-block ml-1 text-primary" />
                      السعر (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5 font-dubai">
                      <Bed className="w-3 h-3 inline-block ml-1 text-primary" />
                      عدد الغرف
                    </label>
                    <input
                      type="number"
                      value={formData.rooms}
                      onChange={e => setFormData(prev => ({ ...prev, rooms: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                      min="1"
                    />
                  </div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5 font-dubai">
                      <Users className="w-3 h-3 inline-block ml-1 text-primary" />
                      عدد الضيوف
                    </label>
                    <input
                      type="number"
                      value={formData.guests}
                      onChange={e => setFormData(prev => ({ ...prev, guests: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5 font-dubai">
                      <Bed className="w-3 h-3 inline-block ml-1 text-primary" />
                      عدد الأسرّة
                    </label>
                    <input
                      type="number"
                      value={formData.beds}
                      onChange={e => setFormData(prev => ({ ...prev, beds: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                      min="1"
                    />
                  </div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5 font-dubai">
                      <Bath className="w-3 h-3 inline-block ml-1 text-primary" />
                      عدد الحمامات
                    </label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={e => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5 font-dubai">
                      <Star className="w-3 h-3 inline-block ml-1 text-primary" />
                      التقييم (من 5)
                    </label>
                    <input
                      type="number"
                      value={formData.rating}
                      onChange={e => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>

                {}
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1.5 font-dubai">
                    <Sparkles className="w-3 h-3 inline-block ml-1 text-primary" />
                    المميزات (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={formData.features}
                    onChange={e => setFormData(prev => ({ ...prev, features: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm text-secondary font-dubai focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                    placeholder="مثال: مفروشة، تكييف، واي فاي"
                  />
                </div>

                {}
                <div className="flex gap-2 pt-3 border-t border-primary/10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSavePin}
                    disabled={!formData.name.trim()}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-primary to-primary/80 text-secondary rounded-lg text-sm font-dubai font-bold transition-[background-color,opacity] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 border-2 border-primary/30"
                    style={{ boxShadow: SHADOWS.button }}
                  >
                    <Save className="w-4 h-4" />
                    {editingPin ? 'حفظ التعديلات' : 'إضافة الشقة'}
                  </motion.button>
                  <button
                    onClick={() => setShowAddPinModal(false)}
                    className="px-4 py-2.5 bg-white border-2 border-primary/30 text-secondary rounded-lg text-sm font-dubai font-bold hover:border-primary/50 hover:bg-accent/30 transition-[border-color,background-color] duration-200"
                    style={{ boxShadow: SHADOWS.card }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


interface PinPopupContentProps {
  apartment: NearbyApartment;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function PinPopupContent({ apartment, isEditing, onEdit, onDelete }: PinPopupContentProps) {
  return (
    <div className="min-w-52 max-w-64" dir="rtl">
      {}
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
      
      {}
      <div className="p-3 space-y-2 bg-linear-to-b from-accent/10 to-white">
        {}
        <div className="flex items-center justify-between bg-primary/15 rounded-lg p-2 border border-primary/20">
          <span className="font-dubai text-secondary/70 text-xs">سعر الليلة</span>
          <span className="font-dubai font-bold text-secondary text-sm">{apartment.price.toLocaleString('ar-EG')} <span className="text-[10px] text-primary font-bold">ج.م</span></span>
        </div>
        
        {}
        <div className="grid grid-cols-3 gap-1.5">
          {}
          <div className="flex flex-col items-center bg-white border border-primary/15 rounded-lg p-1.5">
            <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center mb-1">
              <Home className="w-3 h-3 text-primary" />
            </div>
            <span className="font-dubai font-bold text-secondary text-xs">{apartment.rooms} غرف</span>
          </div>
          {}
          <div className="flex flex-col items-center bg-white border border-primary/15 rounded-lg p-1.5">
            <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center mb-1">
              <Users className="w-3 h-3 text-primary" />
            </div>
            <span className="font-dubai font-bold text-secondary text-xs">{apartment.guests || 0} ضيف</span>
          </div>
          {}
          <div className="flex flex-col items-center bg-white border border-primary/15 rounded-lg p-1.5">
            <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center mb-1">
              <Bed className="w-3 h-3 text-primary" />
            </div>
            <span className="font-dubai font-bold text-secondary text-xs">{apartment.beds || 0} سرير</span>
          </div>
          {}
          <div className={`flex flex-col items-center bg-white border border-primary/15 rounded-lg p-1.5 ${!apartment.airbnbUrl ? 'col-span-3' : ''}`}>
            <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center mb-1">
              <Bath className="w-3 h-3 text-primary" />
            </div>
            <span className="font-dubai font-bold text-secondary text-xs">{apartment.bathrooms || 0} حمام</span>
          </div>
          {}
          {apartment.airbnbUrl && (
            <div className="flex flex-col items-center bg-accent/40 border border-primary/15 rounded-lg p-1.5">
              <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center mb-1">
                <Star className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="font-dubai font-bold text-secondary text-[10px]">
                {apartment.rating ? apartment.rating.toFixed(1) : '0'} ({apartment.reviewsCount || 0})
              </span>
            </div>
          )}
          {}
          {apartment.airbnbUrl && (
            <a
              href={apartment.airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-[#FF5A5F]/10 border border-[#FF5A5F]/30 rounded-lg p-1.5 cursor-pointer hover:bg-[#FF5A5F]/20 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-dubai font-bold text-[#FF5A5F] text-xs">BNB</span>
            </a>
          )}
        </div>

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
              className="flex-1 px-2 py-1.5 bg-white text-secondary font-dubai text-xs rounded-lg transition-[background-color,border-color] duration-150 flex items-center justify-center gap-1 font-bold border border-secondary/20 hover:bg-accent/30"
            >
              <Edit2 className="w-3 h-3" />
              تعديل
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-2 py-1.5 bg-white text-secondary font-dubai text-xs rounded-lg transition-[background-color,border-color] duration-150 flex items-center justify-center gap-1 font-bold border border-secondary/20 hover:bg-accent/30"
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
