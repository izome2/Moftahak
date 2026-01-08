// أنواع نظام دراسات الجدوى

// أنواع الشرائح المتاحة
export type SlideType =
  | 'cover'           // شريحة الغلاف
  | 'introduction'    // المقدمة الترحيبية
  | 'room-setup'      // إعداد الغرف
  | 'kitchen'         // المطبخ
  | 'bathroom'        // الحمام
  | 'living-room'     // الصالة
  | 'bedroom'         // غرفة النوم
  | 'cost-summary'    // ملخص التكاليف
  | 'area-study'      // دراسة المنطقة
  | 'map'             // الخريطة
  | 'nearby-apartments' // الشقق المحيطة
  | 'statistics'      // الإحصائيات
  | 'footer';         // الخاتمة

// حالة الدراسة
export type StudyStatus = 'draft' | 'sent' | 'viewed';

// عنصر غرفة (مطبخ، حمام، الخ)
export interface RoomItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  quantity: number;
}

// نوع الغرفة
export type RoomType = 'bedroom' | 'living-room' | 'kitchen' | 'bathroom';

// بيانات الغرفة
export interface RoomData {
  id: string;
  type: RoomType;
  name: string;
  number: number; // ترقيم الغرفة (غرفة نوم 1، حمام 2، الخ)
  items: RoomItem[];
  image?: string;
  totalCost: number;
}

// بيانات شريحة الغلاف
export interface CoverSlideData {
  clientName: string;
  studyTitle?: string;
  date?: string;
}

// بيانات شريحة المقدمة
export interface IntroductionSlideData {
  title: string;
  description: string;
  bulletPoints: string[];
}

// بيانات شريحة الغرفة
export interface RoomSlideData {
  room: RoomData;
  showImage: boolean;
  imagePosition: 'left' | 'right';
}

// بيانات شريحة إعداد الغرف
export interface RoomSetupSlideData {
  rooms: {
    bedrooms: number;
    livingRooms: number;
    kitchens: number;
    bathrooms: number;
  };
  slidesGenerated?: boolean;
}

// بيانات شريحة ملخص التكاليف
export interface CostSummarySlideData {
  rooms: RoomData[];
  additionalCosts: { name: string; amount: number }[];
  discount?: number;
}

// بيانات الشقة المحيطة
export interface NearbyApartment {
  id: string;
  name: string;
  price: number;
  rooms: number;
  features: string[];
  rentCount: number;
  highestRent: number;
  location: {
    lat: number;
    lng: number;
  };
  description?: string; // فقرة نصية وصفية
  images?: string[]; // صور الشقة (حتى 4 صور)
}

// بيانات شريحة دراسة المنطقة
export interface AreaStudySlideData {
  title: string;
  description: string;
}

// بيانات شريحة الخريطة
export interface MapSlideData {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  pins: {
    id: string;
    lat: number;
    lng: number;
    apartment: NearbyApartment;
  }[];
}

// بيانات شريحة الشقق المحيطة
export interface NearbyApartmentsSlideData {
  apartments: NearbyApartment[];
  showFromMap?: boolean; // عرض الشقق من الخريطة
}

// بيانات شريحة الإحصائيات
export interface StatisticsSlideData {
  totalCost: number;
  averageRent: number;
  roomsCost: { name: string; cost: number }[];
  comparisonData: { label: string; value: number }[];
}

// بيانات شريحة الخاتمة
export interface FooterSlideData {
  message: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

// بيانات الشريحة العامة
export interface SlideData {
  cover?: CoverSlideData;
  introduction?: IntroductionSlideData;
  roomSetup?: RoomSetupSlideData;
  room?: RoomSlideData;
  costSummary?: CostSummarySlideData;
  areaStudy?: AreaStudySlideData;
  map?: MapSlideData;
  nearbyApartments?: NearbyApartmentsSlideData;
  statistics?: StatisticsSlideData;
  footer?: FooterSlideData;
}

// الشريحة
export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  order: number;
  data: SlideData;
  isLocked?: boolean; // بعض الشرائح مثل الغلاف والخاتمة لا يمكن حذفها
}

// دراسة الجدوى
export interface FeasibilityStudy {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  title: string;
  slides: Slide[];
  rooms: RoomData[];
  totalCost: number;
  status: StudyStatus;
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
}

// إعدادات الشريحة الافتراضية
export interface SlideTemplate {
  type: SlideType;
  title: string;
  icon: string;
  defaultData: SlideData;
  isLocked?: boolean;
}

// حالة المحرر
export interface EditorState {
  study: FeasibilityStudy | null;
  activeSlideIndex: number;
  selectedElementId: string | null;
  zoom: number;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  history: {
    past: FeasibilityStudy[];
    future: FeasibilityStudy[];
  };
}

// إجراءات المحرر
export type EditorAction =
  | { type: 'SET_STUDY'; payload: FeasibilityStudy }
  | { type: 'SET_ACTIVE_SLIDE'; payload: number }
  | { type: 'ADD_SLIDE'; payload: Slide }
  | { type: 'REMOVE_SLIDE'; payload: string }
  | { type: 'UPDATE_SLIDE'; payload: { id: string; data: Partial<Slide> } }
  | { type: 'REORDER_SLIDES'; payload: Slide[] }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR' };
