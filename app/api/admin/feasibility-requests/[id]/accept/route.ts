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
    
    // الشرائح الأساسية المشتركة
    const baseSlides = [
      {
        id: nanoid(),
        type: 'cover',
        title: 'الغلاف',
        data: {
          title: `دراسة جدوى - ${feasibilityRequest.fullName}`,
          subtitle: `${feasibilityRequest.city} - ${feasibilityRequest.district}`,
        },
      },
      {
        id: nanoid(),
        type: 'introduction',
        title: 'المقدمة',
        data: {
          clientName: feasibilityRequest.fullName,
          propertyType: feasibilityRequest.propertyType,
        },
      },
      {
        id: nanoid(),
        type: 'room-setup',
        title: 'تكوين الشقة',
        data: {
          bedrooms: feasibilityRequest.bedrooms,
          bathrooms: feasibilityRequest.bathrooms,
          livingRooms: feasibilityRequest.livingRooms,
          kitchens: feasibilityRequest.kitchens,
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
        data: { roomNumber: i + 1, items: [] },
      })),
      // غرف المعيشة
      ...Array.from({ length: feasibilityRequest.livingRooms }, (_, i) => ({
        id: nanoid(),
        type: 'living-room',
        title: `غرفة المعيشة ${i + 1}`,
        data: { roomNumber: i + 1, items: [] },
      })),
      // المطابخ
      ...Array.from({ length: feasibilityRequest.kitchens }, (_, i) => ({
        id: nanoid(),
        type: 'kitchen',
        title: `المطبخ ${i + 1}`,
        data: { roomNumber: i + 1, items: [] },
      })),
      // الحمامات
      ...Array.from({ length: feasibilityRequest.bathrooms }, (_, i) => ({
        id: nanoid(),
        type: 'bathroom',
        title: `الحمام ${i + 1}`,
        data: { roomNumber: i + 1, items: [] },
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
          city: feasibilityRequest.city,
          district: feasibilityRequest.district,
        },
      },
      {
        id: nanoid(),
        type: 'map',
        title: 'الخريطة',
        data: {
          latitude: feasibilityRequest.latitude,
          longitude: feasibilityRequest.longitude,
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
        title: `دراسة جدوى - ${feasibilityRequest.fullName}`,
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
