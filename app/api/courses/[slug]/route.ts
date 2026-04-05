import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - تفاصيل دورة واحدة بالـ slug (عام - بدون auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        currency: true,
        thumbnailUrl: true,
        previewVideoUrl: true,
        features: true,
        level: true,
        totalDuration: true,
        lessonsCount: true,
        createdAt: true,
        admin: {
          select: { firstName: true, lastName: true, image: true },
        },
        sections: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            sortOrder: true,
            lessons: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                isFree: true,
                sortOrder: true,
              },
            },
          },
        },
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
    });

    if (!course) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 })
      );
    }

    const avgRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : 0;

    const result = {
      ...course,
      reviews: undefined,
      enrollmentsCount: course._count.enrollments,
      reviewsCount: course._count.reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      _count: undefined,
      instructor: `${course.admin.firstName} ${course.admin.lastName}`,
      instructorImage: course.admin.image,
      admin: undefined,
    };

    return addSecurityHeaders(NextResponse.json({ course: result }));
  } catch (error) {
    console.error('Error fetching course:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    );
  }
}
