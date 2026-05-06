import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import AirbnbCourseLandingPage from '@/components/courses/airbnb/AirbnbCourseLandingPage';
import { prisma } from '@/lib/prisma';
import {
  AIRBNB_COURSE_TITLE,
  AIRBNB_FALLBACK_SLUG,
  AIRBNB_SLUG_CANDIDATES,
} from '@/lib/courses/airbnb-landing';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'كورس تعلم واحتراف مجال AirBNB | مفتاحك',
  description:
    'صفحة كورس عملي مع عبد الله الخضر لتعلم مجال AirBNB والإيجار قصير الأجل بخطوات واضحة.',
};

async function getAirbnbCourseSlug(): Promise<string> {
  const course = await prisma.course.findFirst({
    where: {
      isPublished: true,
      OR: [
        { title: AIRBNB_COURSE_TITLE },
        ...AIRBNB_SLUG_CANDIDATES.map((slug) => ({ slug })),
      ],
    },
    select: { slug: true },
  });

  return course?.slug ?? AIRBNB_FALLBACK_SLUG;
}

export default async function AirbnbLandingRoute() {
  const courseSlug = await getAirbnbCourseSlug();

  return (
    <div className="min-h-screen bg-[#faf7f2]" dir="rtl">
      <Navbar variant="airbnbLanding" />
      <AirbnbCourseLandingPage courseSlug={courseSlug} />
    </div>
  );
}
