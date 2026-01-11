import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { nanoid } from 'nanoid';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// إنشاء الشرائح الافتراضية بناءً على اسم العميل وتكوين الغرف
function createDefaultSlides(clientName: string, roomConfig: { 
  bedrooms: number; 
  livingRooms: number; 
  kitchens: number; 
  bathrooms: number 
}) {
  const slides = [];
  let order = 0;

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
      },
    },
    isLocked: true,
  });

  // شريحة المقدمة - مع اسم العميل
  slides.push({
    id: `introduction-${Date.now()}`,
    type: 'introduction',
    title: 'المقدمة',
    order: order++,
    data: {
      introduction: {
        title: `مرحباً بك ${clientName} في دراسة الجدوى`,
        description: 'تم إعداد هذه الدراسة خصيصاً لمساعدتك في تجهيز شقتك للإيجار السياحي.',
        bulletPoints: [
          'تحليل شامل لاحتياجات الشقة',
          'تكلفة تقديرية للتجهيزات',
          'دراسة المنطقة المحيطة',
          'إحصائيات وتوقعات الإيجار',
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

  // دراسة المنطقة
  slides.push({
    id: `area-study-${Date.now()}`,
    type: 'area-study',
    title: 'دراسة المنطقة',
    order: order++,
    data: {
      areaStudy: {
        title: 'دراسة المناطق المحيطة',
        description: 'تحليل شامل للشقق المحيطة وأسعار الإيجار في المنطقة.',
      },
    },
  });

  // الخريطة
  slides.push({
    id: `map-${Date.now()}`,
    type: 'map',
    title: 'الخريطة',
    order: order++,
    data: {
      map: {
        center: { lat: 30.0444, lng: 31.2357 },
        zoom: 14,
        pins: [],
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

// POST - قبول الاستشارة وإنشاء دراسة جدوى
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }

    const { id } = await params;
    const adminId = session.user.id;

    // جلب الاستشارة
    const consultation = await prisma.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      const response = NextResponse.json(
        { error: 'الاستشارة غير موجودة' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    if (consultation.status === 'ACCEPTED') {
      const response = NextResponse.json(
        { error: 'تم قبول هذه الاستشارة مسبقاً' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // اسم العميل الكامل
    const clientName = `${consultation.firstName} ${consultation.lastName}`;
    
    // تكوين الغرف (استخدم الافتراضي إذا لم يتم التحديد)
    const roomConfig = {
      bedrooms: consultation.bedrooms || 1,
      livingRooms: consultation.livingRooms || 1,
      kitchens: consultation.kitchens || 1,
      bathrooms: consultation.bathrooms || 1,
    };

    // إنشاء الشرائح
    const slides = createDefaultSlides(clientName, roomConfig);

    // إنشاء دراسة الجدوى وتحديث الاستشارة في نفس الوقت
    const [feasibilityStudy] = await prisma.$transaction([
      prisma.feasibilityStudy.create({
        data: {
          title: `دراسة جدوى - ${clientName}`,
          clientName,
          clientEmail: consultation.email,
          slides: slides,
          bedrooms: roomConfig.bedrooms,
          livingRooms: roomConfig.livingRooms,
          kitchens: roomConfig.kitchens,
          bathrooms: roomConfig.bathrooms,
          totalCost: 0,
          status: 'DRAFT',
          shareId: nanoid(12),
          adminId,
          consultationId: consultation.id,
        },
      }),
      prisma.consultation.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      }),
    ]);

    const response = NextResponse.json({
      success: true,
      message: 'تم قبول الاستشارة وإنشاء دراسة الجدوى بنجاح',
      feasibilityStudy: {
        id: feasibilityStudy.id,
        title: feasibilityStudy.title,
        clientName: feasibilityStudy.clientName,
      },
    });
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error accepting consultation:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء قبول الاستشارة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
