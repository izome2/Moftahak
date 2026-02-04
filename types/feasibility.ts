


export type SlideType =
  | 'cover'           
  | 'introduction'    
  | 'room-setup'      
  | 'kitchen'         
  | 'bathroom'        
  | 'living-room'     
  | 'bedroom'         
  | 'cost-summary'    
  | 'area-study'      
  | 'map'             
  | 'nearby-apartments' 
  | 'statistics'      
  | 'footer';         


export type StudyStatus = 'draft' | 'sent' | 'viewed';


export interface RoomItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  quantity: number;
  image?: string; // صورة العنصر (اختياري)
  description?: string; // وصف العنصر (اختياري)
}


export type RoomType = 'bedroom' | 'living-room' | 'kitchen' | 'bathroom';


export interface RoomData {
  id: string;
  type: RoomType;
  name: string;
  number: number; 
  items: RoomItem[];
  image?: string;
  totalCost: number;
}


export interface CoverSlideData {
  clientName: string;
  studyTitle?: string;
  date?: string;
  backgroundImage?: string;
  imageOpacity?: number;
}


export interface IntroductionSlideData {
  title: string;
  description: string;
  bulletPoints?: string[]; // Optional for backward compatibility with legacy data
}


export interface RoomSlideData {
  room: RoomData;
  showImage: boolean;
  imagePosition: 'left' | 'right';
}


export interface RoomSetupSlideData {
  rooms: {
    bedrooms: number;
    livingRooms: number;
    kitchens: number;
    bathrooms: number;
  };
  slidesGenerated?: boolean;
}


export interface CostSummarySlideData {
  rooms: RoomData[];
  additionalCosts: { name: string; amount: number }[];
  discount?: number;
}


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
  description?: string; 
  images?: string[]; 
  airbnbUrl?: string; 
  
  guests?: number; 
  beds?: number; 
  bathrooms?: number; 
  subtitle?: string; 
  rating?: number; 
  reviewsCount?: number;
  thumbnailUrl?: string;
  isClientApartment?: boolean; // هل هذه شقة العميل؟
  occupancy?: number; // نسبة الإشغال (0-100)
  annualRevenue?: number; // العوائد السنوية
}


export interface AreaStudySlideData {
  title: string;
  description: string;
}


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


export interface NearbyApartmentsSlideData {
  apartments: NearbyApartment[];
  showFromMap?: boolean; 
}


export interface AreaStatistics {
  averageDailyRate: number; // متوسط سعر الليلة
  averageOccupancy: number; // متوسط نسبة الاشغال (0-100)
  averageAnnualRevenue: number; // متوسط العوائد السنوية
}

export interface MonthlyOccupancyData {
  month: string; // اسم الشهر بالعربي
  occupancy: number; // نسبة الإشغال (0-100)
}

export interface StatisticsSlideData {
  totalCost: number;
  averageRent: number;
  roomsCost: { name: string; cost: number }[];
  // المصاريف التشغيلية (إيجار، إنترنت، مياه، كهرباء، بواب...)
  operationalCosts?: { name: string; cost: number }[];
  // إحصائيات المنطقة (للشقق المحيطة)
  areaStatistics?: AreaStatistics;
  // بيانات شارت الإشغال الشهري
  monthlyOccupancy?: MonthlyOccupancyData[];
  // سنة الإشغال
  year?: string;
  // الملاحظات الإضافية (مدمجة أسفل ملخص الدراسة)
  notesTitle?: string;
  notesContent?: string; // محتوى HTML مع التنسيق
  showNotesSection?: boolean;
}

// @deprecated - تم دمج الملاحظات في شريحة الإحصائيات
// بيانات شريحة الملاحظات الإضافية (فقرة واحدة مع تنسيق)
export interface NotesSlideData {
  title: string;
  content?: string; // محتوى HTML مع التنسيق
  showDecoration?: boolean; // إظهار زخارف الخلفية
}


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


export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  order: number;
  data: SlideData;
  isLocked?: boolean; 
}


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


export interface SlideTemplate {
  type: SlideType;
  title: string;
  icon: string;
  defaultData: SlideData;
  isLocked?: boolean;
}


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
