'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  X, 
  Save, 
  DollarSign, 
  Bed, 
  Hash, 
  Star, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import { NearbyApartmentsSlideData, NearbyApartment } from '@/types/feasibility';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import ApartmentCard from './ApartmentCard';

interface NearbyApartmentsSlideProps {
  data?: NearbyApartmentsSlideData;
  isEditing?: boolean;
  onUpdate?: (data: NearbyApartmentsSlideData) => void;
}

interface ApartmentFormData {
  name: string;
  price: number;
  rooms: number;
  features: string;
  rentCount: number;
  highestRent: number;
}

const defaultFormData: ApartmentFormData = {
  name: '',
  price: 0,
  rooms: 1,
  features: '',
  rentCount: 0,
  highestRent: 0,
};

const defaultData: NearbyApartmentsSlideData = {
  apartments: [],
  showFromMap: false,
};

export default function NearbyApartmentsSlide({
  data = defaultData,
  isEditing = false,
  onUpdate,
}: NearbyApartmentsSlideProps) {
  const [slideData, setSlideData] = useState<NearbyApartmentsSlideData>(data);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApartment, setEditingApartment] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApartmentFormData>(defaultFormData);

  // حفظ مرجع لـ onUpdate لتجنب infinite loop
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // تحديث البيانات عند التغيير
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (onUpdateRef.current) {
      onUpdateRef.current(slideData);
    }
  }, [slideData]);

  // إضافة شقة جديدة
  const handleAddApartment = () => {
    setFormData(defaultFormData);
    setEditingApartment(null);
    setShowAddModal(true);
  };

  // تعديل شقة
  const handleEditApartment = (apartmentId: string) => {
    const apartment = slideData.apartments.find(a => a.id === apartmentId);
    if (!apartment) return;

    setFormData({
      name: apartment.name,
      price: apartment.price,
      rooms: apartment.rooms,
      features: apartment.features.join(', '),
      rentCount: apartment.rentCount,
      highestRent: apartment.highestRent,
    });
    setEditingApartment(apartmentId);
    setShowAddModal(true);
  };

  // حذف شقة
  const handleDeleteApartment = (apartmentId: string) => {
    setSlideData(prev => ({
      ...prev,
      apartments: prev.apartments.filter(a => a.id !== apartmentId),
    }));
  };

  // حفظ الشقة
  const handleSaveApartment = () => {
    if (!formData.name.trim()) return;

    const newApartment: NearbyApartment = {
      id: editingApartment || `apartment-${Date.now()}`,
      name: formData.name,
      price: formData.price,
      rooms: formData.rooms,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      rentCount: formData.rentCount,
      highestRent: formData.highestRent,
      location: { lat: 30.0444, lng: 31.2357 }, // موقع افتراضي
    };

    if (editingApartment) {
      setSlideData(prev => ({
        ...prev,
        apartments: prev.apartments.map(a =>
          a.id === editingApartment ? newApartment : a
        ),
      }));
    } else {
      setSlideData(prev => ({
        ...prev,
        apartments: [...prev.apartments, newApartment],
      }));
    }

    setShowAddModal(false);
    setEditingApartment(null);
    setFormData(defaultFormData);
  };

  return (
    <div className="w-full h-full flex flex-col p-8 bg-linear-to-br from-accent/30 via-white/50 to-accent/20">
      {/* العنوان */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-medium">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-secondary font-dubai">الشقق المحيطة</h2>
        <p className="text-secondary/60 text-sm mt-1">
          {isEditing
            ? `قم بإضافة الشقق المحيطة للمقارنة (${slideData.apartments.length}/10)`
            : 'مقارنة أسعار ومميزات الشقق في المنطقة'}
        </p>
      </motion.div>

      {/* زر إضافة شقة */}
      {isEditing && slideData.apartments.length < 10 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-6"
        >
          <button
            onClick={handleAddApartment}
            className="px-6 py-2.5 bg-linear-to-r from-secondary to-secondary/90 text-primary rounded-xl font-medium hover:shadow-glow transition-all flex items-center gap-2 font-dubai"
          >
            <Plus className="w-5 h-5" />
            إضافة شقة
          </button>
        </motion.div>
      )}

      {/* قائمة الشقق */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-auto"
      >
        {slideData.apartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slideData.apartments.map((apartment, index) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                index={index}
                isEditing={isEditing}
                onEdit={() => handleEditApartment(apartment.id)}
                onDelete={() => handleDeleteApartment(apartment.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-secondary/40" />
            </div>
            <p className="text-secondary/50 font-dubai">
              {isEditing
                ? 'لم تتم إضافة أي شقق بعد. انقر على "إضافة شقة" للبدء.'
                : 'لا توجد شقق محيطة للعرض'}
            </p>
          </div>
        )}
      </motion.div>

      {/* ملخص الإحصائيات */}
      {slideData.apartments.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-black/5"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* عدد الشقق */}
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{slideData.apartments.length}</div>
              <div className="text-xs text-secondary/60 font-dubai">عدد الشقق</div>
            </div>
            
            {/* متوسط السعر */}
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {Math.round(
                  slideData.apartments.reduce((sum, a) => sum + a.price, 0) / slideData.apartments.length
                ).toLocaleString('ar-EG')}
              </div>
              <div className="text-xs text-secondary/60 font-dubai">متوسط الإيجار (ج.م)</div>
            </div>
            
            {/* أقل سعر */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.min(...slideData.apartments.map(a => a.price)).toLocaleString('ar-EG')}
              </div>
              <div className="text-xs text-secondary/60 font-dubai">أقل إيجار (ج.م)</div>
            </div>
            
            {/* أعلى سعر */}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Math.max(...slideData.apartments.map(a => a.price)).toLocaleString('ar-EG')}
              </div>
              <div className="text-xs text-secondary/60 font-dubai">أعلى إيجار (ج.م)</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* نافذة إضافة/تعديل الشقة */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-secondary font-dubai">
                  {editingApartment ? 'تعديل بيانات الشقة' : 'إضافة شقة جديدة'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* اسم الشقة */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1 font-dubai">
                    <Building2 className="w-4 h-4 inline-block ml-1" />
                    اسم الشقة
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-accent/30 border border-secondary/10 rounded-xl text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-dubai"
                    placeholder="مثال: شقة الزهراء"
                  />
                </div>

                {/* السعر وعدد الغرف */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1 font-dubai">
                      <DollarSign className="w-4 h-4 inline-block ml-1" />
                      السعر (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-accent/30 border border-secondary/10 rounded-xl text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-dubai"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1 font-dubai">
                      <Bed className="w-4 h-4 inline-block ml-1" />
                      عدد الغرف
                    </label>
                    <input
                      type="number"
                      value={formData.rooms}
                      onChange={e => setFormData(prev => ({ ...prev, rooms: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-accent/30 border border-secondary/10 rounded-xl text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-dubai"
                      min="1"
                    />
                  </div>
                </div>

                {/* عدد مرات التأجير وأعلى سعر */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1 font-dubai">
                      <Hash className="w-4 h-4 inline-block ml-1" />
                      مرات التأجير
                    </label>
                    <input
                      type="number"
                      value={formData.rentCount}
                      onChange={e => setFormData(prev => ({ ...prev, rentCount: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-accent/30 border border-secondary/10 rounded-xl text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-dubai"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1 font-dubai">
                      <TrendingUp className="w-4 h-4 inline-block ml-1" />
                      أعلى إيجار (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formData.highestRent}
                      onChange={e => setFormData(prev => ({ ...prev, highestRent: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-accent/30 border border-secondary/10 rounded-xl text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-dubai"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* المميزات */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1 font-dubai">
                    <Star className="w-4 h-4 inline-block ml-1" />
                    المميزات (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={formData.features}
                    onChange={e => setFormData(prev => ({ ...prev, features: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-accent/30 border border-secondary/10 rounded-xl text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-dubai"
                    placeholder="مثال: مفروشة، تكييف، واي فاي"
                  />
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveApartment}
                    disabled={!formData.name.trim()}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-secondary to-secondary/90 text-primary rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-dubai"
                  >
                    <Save className="w-4 h-4" />
                    {editingApartment ? 'حفظ التعديلات' : 'إضافة الشقة'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 bg-secondary/10 text-secondary rounded-xl font-medium hover:bg-secondary/20 transition-colors font-dubai"
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
