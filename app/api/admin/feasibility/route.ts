import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { nanoid } from 'nanoid';

// GET - جلب جميع دراسات الجدوى (للأدمن فقط)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = status ? { status: status as 'DRAFT' | 'SENT' | 'VIEWED' } : {};

    const [studies, total] = await Promise.all([
      prisma.feasibilityStudy.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          clientName: true,
          clientEmail: true,
          status: true,
          totalCost: true,
          bedrooms: true,
          livingRooms: true,
          kitchens: true,
          bathrooms: true,
          shareId: true,
          createdAt: true,
          updatedAt: true,
          sentAt: true,
          consultation: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.feasibilityStudy.count({ where }),
    ]);

    const response = NextResponse.json({
      studies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching studies:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الدراسات' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// POST - إنشاء دراسة جدوى جديدة (بدون ربط باستشارة)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }

    const body = await request.json();
    const { 
      title, 
      clientName, 
      clientEmail, 
      slides, 
      totalCost = 0, 
      bedrooms = 0, 
      livingRooms = 0, 
      kitchens = 0, 
      bathrooms = 0, 
      studyType = 'WITH_FIELD_VISIT',
      // بيانات الموقع والعقار
      latitude,
      longitude,
      city,
      district,
      propertyType,
      // ربط بطلب دراسة الجدوى
      feasibilityRequestId,
    } = body;

    if (!clientName) {
      const response = NextResponse.json(
        { error: 'اسم العميل مطلوب' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // استخدام الشرائح المرسلة أو إنشاء شرائح افتراضية حسب نوع الدراسة
    const locationData = {
      latitude: latitude || null,
      longitude: longitude || null,
      city: city || null,
      district: district || null,
      propertyType: propertyType || null,
    };
    const finalSlides = slides || createDefaultSlides(clientName, { bedrooms, livingRooms, kitchens, bathrooms }, studyType, locationData);

    const study = await prisma.feasibilityStudy.create({
      data: {
        title: title || `دراسة جدوى - ${clientName}`,
        clientName,
        clientEmail: clientEmail || null,
        studyType: studyType as 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT',
        slides: finalSlides,
        bedrooms,
        livingRooms,
        kitchens,
        bathrooms,
        totalCost,
        status: 'DRAFT',
        shareId: nanoid(12),
        adminId: session.user.id!,
        // ربط بطلب دراسة الجدوى إن وجد
        ...(feasibilityRequestId && { feasibilityRequestId }),
      },
    });

    const response = NextResponse.json({
      success: true,
      study: {
        id: study.id,
        title: study.title,
        clientName: study.clientName,
      },
    }, { status: 201 });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating study:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الدراسة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// دالة إنشاء الشرائح الافتراضية
function createDefaultSlides(
  clientName: string, 
  roomConfig: { 
    bedrooms: number; 
    livingRooms: number; 
    kitchens: number; 
    bathrooms: number 
  },
  studyType: string = 'WITH_FIELD_VISIT',
  locationData: {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    district: string | null;
    propertyType: string | null;
  } = { latitude: null, longitude: null, city: null, district: null, propertyType: null }
) {
  const slides = [];
  const isWithFieldVisit = studyType === 'WITH_FIELD_VISIT';
  let order = 0;

  // تحويل نوع العقار للعربية
  const propertyTypeLabels: Record<string, string> = {
    APARTMENT: 'شقة',
    VILLA: 'فيلا',
    STUDIO: 'استوديو',
    DUPLEX: 'دوبلكس',
    PENTHOUSE: 'بنتهاوس',
    CHALET: 'شاليه',
    OTHER: 'عقار',
  };
  const propertyTypeArabic = locationData.propertyType 
    ? propertyTypeLabels[locationData.propertyType] || 'عقار'
    : 'شقة';

  // شريحة الغلاف
  slides.push({
    id: `cover-${Date.now()}`,
    type: 'cover',
    title: 'الغلاف',
    order: order++,
    data: {
      cover: {
        clientName,
        studyTitle: 'دراسة جدوى',
        date: new Date().toLocaleDateString('ar-EG'),
        // معلومات إضافية عن العقار
        propertyInfo: {
          type: propertyTypeArabic,
          city: locationData.city || null,
          district: locationData.district || null,
        },
      },
    },
    isLocked: true,
  });

  // شريحة المقدمة
  const locationText = locationData.city && locationData.district 
    ? `في ${locationData.district}، ${locationData.city}`
    : '';
  
  slides.push({
    id: `introduction-${Date.now()}`,
    type: 'introduction',
    title: 'المقدمة',
    order: order++,
    data: {
      introduction: {
        title: `مرحباً بك ${clientName} في دراسة الجدوى`,
        description: locationText 
          ? `تم إعداد هذه الدراسة خصيصاً لمساعدتك في تجهيز ${propertyTypeArabic}ك ${locationText} للإيجار السياحي.`
          : `تم إعداد هذه الدراسة خصيصاً لمساعدتك في تجهيز ${propertyTypeArabic}ك للإيجار السياحي.`,
        bulletPoints: isWithFieldVisit ? [
          'تحليل شامل لاحتياجات الشقة',
          'تكلفة تقديرية للتجهيزات',
          'دراسة المنطقة المحيطة',
          'إحصائيات وتوقعات الإيجار',
        ] : [
          'دراسة المنطقة المحيطة',
          'تحليل الشقق المنافسة',
          'إحصائيات وتوقعات الإيجار',
          'توصيات عامة',
        ],
      },
    },
    isLocked: true,
  });

  // شريحة تكوين الشقة
  slides.push({
    id: `room-setup-${Date.now()}`,
    type: 'room-setup',
    title: 'تكوين الشقة',
    order: order++,
    data: {
      roomSetup: {
        rooms: {
          bedrooms: roomConfig.bedrooms,
          livingRooms: roomConfig.livingRooms,
          kitchens: roomConfig.kitchens,
          bathrooms: roomConfig.bathrooms,
        },
        slidesGenerated: true,
      },
    },
  });

  // شرائح الغرف وملخص التكاليف فقط مع نزول ميداني
  if (isWithFieldVisit) {
    // المطابخ
    for (let i = 1; i <= roomConfig.kitchens; i++) {
      slides.push({
        id: `kitchen-${Date.now()}-${i}`,
        type: 'kitchen',
        title: roomConfig.kitchens === 1 ? 'المطبخ' : `المطبخ ${i}`,
        order: order++,
        data: {
          room: {
            room: {
              id: `kitchen-${i}`,
              type: 'kitchen',
              name: roomConfig.kitchens === 1 ? 'المطبخ' : `مطبخ ${i}`,
              number: roomConfig.kitchens === 1 ? 0 : i,
              items: [],
              totalCost: 0,
            },
            showImage: false,
            imagePosition: 'right',
          },
        },
      });
    }

    // غرف النوم
    for (let i = 1; i <= roomConfig.bedrooms; i++) {
      slides.push({
        id: `bedroom-${Date.now()}-${i}`,
        type: 'bedroom',
        title: `غرفة نوم ${i}`,
        order: order++,
        data: {
          room: {
            room: {
              id: `bedroom-${i}`,
              type: 'bedroom',
              name: `غرفة نوم ${i}`,
              number: i,
              items: [],
              totalCost: 0,
            },
            showImage: false,
            imagePosition: 'right',
          },
        },
      });
    }

    // الصالات
    for (let i = 1; i <= roomConfig.livingRooms; i++) {
      slides.push({
        id: `living-room-${Date.now()}-${i}`,
        type: 'living-room',
        title: roomConfig.livingRooms === 1 ? 'الصالة' : `الصالة ${i}`,
        order: order++,
        data: {
          room: {
            room: {
              id: `living-room-${i}`,
              type: 'living-room',
              name: roomConfig.livingRooms === 1 ? 'الصالة' : `صالة ${i}`,
              number: roomConfig.livingRooms === 1 ? 0 : i,
              items: [],
              totalCost: 0,
            },
            showImage: false,
            imagePosition: 'right',
          },
        },
      });
    }

    // الحمامات
    for (let i = 1; i <= roomConfig.bathrooms; i++) {
      slides.push({
        id: `bathroom-${Date.now()}-${i}`,
        type: 'bathroom',
        title: roomConfig.bathrooms === 1 ? 'الحمام' : `الحمام ${i}`,
        order: order++,
        data: {
          room: {
            room: {
              id: `bathroom-${i}`,
              type: 'bathroom',
              name: roomConfig.bathrooms === 1 ? 'الحمام' : `حمام ${i}`,
              number: roomConfig.bathrooms === 1 ? 0 : i,
              items: [],
              totalCost: 0,
            },
            showImage: false,
            imagePosition: 'right',
          },
        },
      });
    }

    // ملخص التكاليف
    slides.push({
      id: `cost-summary-${Date.now()}`,
      type: 'cost-summary',
      title: 'ملخص التكاليف',
      order: order++,
      data: {
        costSummary: {
          rooms: [],
          additionalCosts: [],
          discount: 0,
        },
      },
    });
  } // نهاية if (isWithFieldVisit)

  // دراسة المنطقة
  slides.push({
    id: `area-study-${Date.now()}`,
    type: 'area-study',
    title: 'دراسة المنطقة',
    order: order++,
    data: {
      areaStudy: {
        title: 'دراسة المناطق المحيطة',
        description: 'تحليل شامل للشقق المحيطة وأسعار الإيجار في منطقة شقتك الخاصه',
      },
    },
  });

  // الخريطة - استخدام موقع العميل إذا كان متوفراً
  const mapCenter = locationData.latitude && locationData.longitude 
    ? { lat: locationData.latitude, lng: locationData.longitude }
    : { lat: 30.0444, lng: 31.2357 }; // القاهرة كموقع افتراضي
    
  const propertyPin = locationData.latitude && locationData.longitude 
    ? [{
        id: 'property-location',
        lat: locationData.latitude,
        lng: locationData.longitude,
        apartment: {
          id: 'property-location',
          name: 'شقتي',
          price: 0,
          rooms: roomConfig.bedrooms,
          features: [],
          rentCount: 0,
          highestRent: 0,
          location: { lat: locationData.latitude, lng: locationData.longitude },
          isClientApartment: true, // تمييز شقة العميل
        },
      }]
    : [];

  slides.push({
    id: `map-${Date.now()}`,
    type: 'map',
    title: 'الخريطة',
    order: order++,
    data: {
      map: {
        center: mapCenter,
        zoom: 15,
        pins: propertyPin,
        propertyLocation: locationData.latitude && locationData.longitude ? {
          lat: locationData.latitude,
          lng: locationData.longitude,
          city: locationData.city,
          district: locationData.district,
        } : null,
      },
    },
  });

  // الشقق المحيطة
  slides.push({
    id: `nearby-apartments-${Date.now()}`,
    type: 'nearby-apartments',
    title: 'الشقق المحيطة',
    order: order++,
    data: {
      nearbyApartments: {
        apartments: [],
        showFromMap: true,
      },
    },
  });

  // الإحصائيات
  slides.push({
    id: `statistics-${Date.now()}`,
    type: 'statistics',
    title: 'الإحصائيات',
    order: order++,
    data: {
      statistics: {
        totalCost: 0,
        averageRent: 0,
        roomsCost: [],
        comparisonData: [],
      },
    },
  });

  // الخاتمة
  slides.push({
    id: `footer-${Date.now()}`,
    type: 'footer',
    title: 'الخاتمة',
    order: order++,
    data: {
      footer: {
        message: 'شكراً لثقتكم بنا',
        contactInfo: {
          phone: '',
          email: 'info@moftahak.com',
          website: 'www.moftahak.com',
          whatsapp: '',
        },
        socialLinks: {},
      },
    },
    isLocked: true,
  });

  return slides;
}
