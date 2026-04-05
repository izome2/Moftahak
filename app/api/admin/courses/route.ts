import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { createCourseSchema } from '@/lib/validations/courses';
import { generateSlug } from '@/lib/courses/utils';

// GET - قائمة الدورات (للأدمن)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'published' | 'draft'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status === 'published') where.isPublished = true;
    if (status === 'draft') where.isPublished = false;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              enrollments: { where: { status: 'CONFIRMED' } },
              reviews: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const coursesWithStats = courses.map((course) => {
      const avgRating = course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : 0;
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        price: course.price,
        currency: course.currency,
        thumbnailUrl: course.thumbnailUrl,
        level: course.level,
        isPublished: course.isPublished,
        totalDuration: course.totalDuration,
        lessonsCount: course.lessonsCount,
        sortOrder: course.sortOrder,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        enrollmentsCount: course._count.enrollments,
        reviewsCount: course._count.reviews,
        averageRating: Math.round(avgRating * 10) / 10,
      };
    });

    return addSecurityHeaders(NextResponse.json({
      courses: coursesWithStats,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}

// POST - إنشاء دورة جديدة
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'بيانات غير صالحة', details: parsed.error.issues },
        { status: 400 }
      ));
    }

    const data = parsed.data;

    // التأكد من وجود المستخدم في قاعدة البيانات
    const adminUser = await prisma.user.findUnique({ where: { id: session.user.id! } });
    if (!adminUser) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'الجلسة منتهية، يرجى تسجيل الخروج وإعادة الدخول' },
        { status: 401 }
      ));
    }

    let slug = generateSlug(data.title);

    // التأكد من عدم تكرار الـ slug
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        level: data.level,
        features: data.features || [],
        thumbnailUrl: data.thumbnailUrl || null,
        previewVideoUrl: data.previewVideoUrl || null,
        isPublished: false,
        adminId: session.user.id!,
      },
    });

    return addSecurityHeaders(NextResponse.json({
      success: true,
      course: { id: course.id, slug: course.slug, title: course.title },
    }, { status: 201 }));
  } catch (error: any) {
    console.error('Error creating course:', error?.message || error);
    const detail = error?.message || 'خطأ غير معروف';
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الدورة', detail }, { status: 500 }));
  }
}
