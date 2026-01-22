import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { nanoid } from 'nanoid';

// POST - قبول الطلب وإنشاء دراسة جدوى
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    const { id } = await params;

    // جلب الطلب
    const feasibilityRequest = await prisma.feasibilityRequest.findUnique({
      where: { id },
    });

    if (!feasibilityRequest) {
      const response = NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // التحقق من أن الطلب لم يتم قبوله مسبقاً
    if (feasibilityRequest.status !== 'PENDING') {
      const response = NextResponse.json(
        { error: 'تم معالجة هذا الطلب مسبقاً' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // إنشاء الشرائح الأولية حسب نوع الدراسة
    const isWithFieldVisit = feasibilityRequest.studyType === 'WITH_FIELD_VISIT';
    
    // إنشاء بيانات شقة العميل للخريطة (إذا كانت الإحداثيات متوفرة)
    const clientApartmentPin = (feasibilityRequest.latitude && feasibilityRequest.longitude) ? {
      id: `pin-client-${nanoid(6)}`,
      lat: feasibilityRequest.latitude,
      lng: feasibilityRequest.longitude,
      apartment: {
        id: `apt-client-${nanoid(6)}`,
        name: 'شقتي',
        price: 0,
        rooms: feasibilityRequest.bedrooms + feasibilityRequest.livingRooms,
        features: [],
        rentCount: 0,
        highestRent: 0,
        location: {
          lat: feasibilityRequest.latitude,
          lng: feasibilityRequest.longitude,
        },
        isClientApartment: true,
      },
    } : null;
    
    // الشرائح الأساسية المشتركة
    const baseSlides = [
      {
        id: nanoid(),
        type: 'cover',
        title: 'الغلاف',
        data: {
          cover: {
            clientName: feasibilityRequest.fullName,
            studyTitle: `دراسة جدوى`,
            subtitle: `${feasibilityRequest.city} - ${feasibilityRequest.district}`,
          },
        },
      },
      {
        id: nanoid(),
        type: 'introduction',
        title: 'المقدمة',
        data: {
          introduction: {
            title: 'مرحباً بك في دراسة الجدوى',
            description: 'تم إعداد هذه الدراسة خصيصاً لمساعدتك في تجهيز شقتك للإيجار السياحي. ستجد فيها كل ما تحتاجه من معلومات وتحليلات.',
            bulletPoints: [
              'تحليل شامل لاحتياجات الشقة',
              'تكلفة تقديرية للتجهيزات',
              'دراسة المنطقة المحيطة',
              'إحصائيات وتوقعات الإيجار',
            ],
          },
        },
      },
      {
        id: nanoid(),
        type: 'room-setup',
        title: 'تكوين الشقة',
        data: {
          roomSetup: {
            rooms: {
              bedrooms: feasibilityRequest.bedrooms,
              bathrooms: feasibilityRequest.bathrooms,
              livingRooms: feasibilityRequest.livingRooms,
              kitchens: feasibilityRequest.kitchens,
            },
            slidesGenerated: true, // التكوين تم بالفعل من بيانات العميل
          },
        },
      },
    ];

    // شرائح الغرف التفصيلية (فقط مع نزول ميداني)
    const roomSlides = isWithFieldVisit ? [
      // غرف النوم
      ...Array.from({ length: feasibilityRequest.bedrooms }, (_, i) => ({
        id: nanoid(),
        type: 'bedroom',
        title: `غرفة النوم ${i + 1}`,
        data: { 
          room: {
            room: {
              id: `bedroom-${i + 1}`,
              type: 'bedroom',
              name: `غرفة النوم ${i + 1}`,
              number: i + 1,
              items: [],
              totalCost: 0,
            },
          },
        },
      })),
      // غرف المعيشة
      ...Array.from({ length: feasibilityRequest.livingRooms }, (_, i) => ({
        id: nanoid(),
        type: 'living-room',
        title: `غرفة المعيشة ${i + 1}`,
        data: { 
          room: {
            room: {
              id: `living-room-${i + 1}`,
              type: 'living-room',
              name: feasibilityRequest.livingRooms === 1 ? 'الصالة' : `صالة ${i + 1}`,
              number: feasibilityRequest.livingRooms === 1 ? 0 : i + 1,
              items: [],
              totalCost: 0,
            },
          },
        },
      })),
      // المطابخ
      ...Array.from({ length: feasibilityRequest.kitchens }, (_, i) => ({
        id: nanoid(),
        type: 'kitchen',
        title: `المطبخ ${i + 1}`,
        data: { 
          room: {
            room: {
              id: `kitchen-${i + 1}`,
              type: 'kitchen',
              name: feasibilityRequest.kitchens === 1 ? 'المطبخ' : `مطبخ ${i + 1}`,
              number: feasibilityRequest.kitchens === 1 ? 0 : i + 1,
              items: [],
              totalCost: 0,
            },
          },
        },
      })),
      // الحمامات
      ...Array.from({ length: feasibilityRequest.bathrooms }, (_, i) => ({
        id: nanoid(),
        type: 'bathroom',
        title: `الحمام ${i + 1}`,
        data: { 
          room: {
            room: {
              id: `bathroom-${i + 1}`,
              type: 'bathroom',
              name: feasibilityRequest.bathrooms === 1 ? 'الحمام' : `حمام ${i + 1}`,
              number: feasibilityRequest.bathrooms === 1 ? 0 : i + 1,
              items: [],
              totalCost: 0,
            },
          },
        },
      })),
      // ملخص التكاليف
      {
        id: nanoid(),
        type: 'cost-summary',
        title: 'ملخص التكاليف',
        data: {},
      },
    ] : [];

    // شرائح دراسة المنطقة
    const areaSlides = [
      {
        id: nanoid(),
        type: 'area-study',
        title: 'دراسة المنطقة',
        data: {
          areaStudy: {
            title: 'دراسة المنطقة المحيطة',
            description: `دراسة منطقة ${feasibilityRequest.district}، ${feasibilityRequest.city}`,
            city: feasibilityRequest.city,
            district: feasibilityRequest.district,
          },
        },
      },
      {
        id: nanoid(),
        type: 'map',
        title: 'الخريطة',
        data: {
          map: {
            // إعداد مركز الخريطة على موقع العميل
            center: (feasibilityRequest.latitude && feasibilityRequest.longitude) ? {
              lat: feasibilityRequest.latitude,
              lng: feasibilityRequest.longitude,
            } : {
              lat: 30.0444, // القاهرة افتراضياً
              lng: 31.2357,
            },
            zoom: 15,
            // إضافة شقة العميل كـ pin
            pins: clientApartmentPin ? [clientApartmentPin] : [],
          },
        },
      },
      {
        id: nanoid(),
        type: 'nearby-apartments',
        title: 'الشقق المجاورة',
        data: {},
      },
      {
        id: nanoid(),
        type: 'statistics',
        title: 'الإحصائيات',
        data: {},
      },
      {
        id: nanoid(),
        type: 'footer',
        title: 'الخاتمة',
        data: {},
      },
    ];

    // دمج جميع الشرائح
    const allSlides = [...baseSlides, ...roomSlides, ...areaSlides];

    // إنشاء دراسة الجدوى
    const study = await prisma.feasibilityStudy.create({
      data: {
        title: `دراسة جدوى`,
        clientName: feasibilityRequest.fullName,
        clientEmail: feasibilityRequest.email,
        studyType: feasibilityRequest.studyType, // حفظ نوع الدراسة
        bedrooms: feasibilityRequest.bedrooms,
        bathrooms: feasibilityRequest.bathrooms,
        livingRooms: feasibilityRequest.livingRooms,
        kitchens: feasibilityRequest.kitchens,
        slides: allSlides,
        status: 'DRAFT',
        shareId: nanoid(10),
        adminId: session.user.id!,
        feasibilityRequestId: feasibilityRequest.id,
      },
    });

    // تحديث حالة الطلب
    await prisma.feasibilityRequest.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'تم قبول الطلب وإنشاء دراسة الجدوى',
      study: {
        id: study.id,
        title: study.title,
      },
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error accepting feasibility request:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء قبول الطلب' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
