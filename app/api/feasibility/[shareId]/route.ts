import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

interface RouteParams {
  params: Promise<{ shareId: string }>;
}

// GET - جلب دراسة الجدوى العامة عبر رابط المشاركة
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { shareId } = await params;
    
    // التحقق من وجود shareId
    if (!shareId) {
      const response = NextResponse.json(
        { error: 'رابط المشاركة مطلوب' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }
    
    // البحث عن الدراسة باستخدام shareId
    const study = await prisma.feasibilityStudy.findUnique({
      where: { shareId },
      select: {
        id: true,
        title: true,
        clientName: true,
        slides: true,
        totalCost: true,
        status: true,
        studyType: true,
        currency: true,
        createdAt: true,
      },
    });

    // التحقق من وجود الدراسة
    if (!study) {
      const response = NextResponse.json(
        { error: 'الدراسة غير موجودة أو الرابط غير صحيح' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // التحقق من أن الدراسة لديها shareId (تم مشاركتها)
    // نتجاهل الحالة لأن وجود shareId يعني أنها جاهزة للعرض
    if (!study.status || study.status === 'DRAFT') {
      // فقط تحديث الحالة إلى SENT إذا كانت DRAFT
      await prisma.feasibilityStudy.update({
        where: { shareId },
        data: { 
          status: 'SENT',
          sentAt: new Date(),
        },
      });
    }

    // تحديث حالة الدراسة إلى "مشاهدة" إذا كانت مرسلة
    if (study.status === 'SENT') {
      await prisma.feasibilityStudy.update({
        where: { shareId },
        data: { 
          status: 'VIEWED',
          viewedAt: new Date(),
        },
      });
    }

    // إرجاع البيانات
    const response = NextResponse.json({ 
      study: {
        id: study.id,
        title: study.title,
        clientName: study.clientName,
        slides: study.slides,
        totalCost: study.totalCost,
        createdAt: study.createdAt,
        studyType: study.studyType,
        currency: study.currency,
      }
    });
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching public study:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الدراسة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
