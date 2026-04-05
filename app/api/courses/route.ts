import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - قائمة الدورات المنشورة (عام - بدون auth)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        price: true,
        currency: true,
        thumbnailUrl: true,
        level: true,
        totalDuration: true,
        lessonsCount: true,
        sortOrder: true,
        createdAt: true,
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
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.course.count({ where: { isPublished: true } });

    const coursesWithStats = courses.map((course) => {
      const avgRating =
        course.reviews.length > 0
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
        totalDuration: course.totalDuration,
        lessonsCount: course.lessonsCount,
        enrollmentsCount: course._count.enrollments,
        reviewsCount: course._count.reviews,
        averageRating: Math.round(avgRating * 10) / 10,
      };
    });

    return addSecurityHeaders(
      NextResponse.json({ courses: coursesWithStats, total, page, limit })
    );
  } catch (error) {
    console.error('Error fetching public courses:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    );
  }
}
