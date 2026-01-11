import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { randomBytes } from 'crypto';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - إنشاء أو تجديد رابط المشاركة
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
    
    // التحقق من وجود الدراسة
    const existingStudy = await prisma.feasibilityStudy.findUnique({
      where: { id },
      select: { id: true, shareId: true },
    });

    if (!existingStudy) {
      const response = NextResponse.json(
        { error: 'الدراسة غير موجودة' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // إنشاء رابط جديد فريد
    const shareId = randomBytes(16).toString('hex');

    // تحديث الدراسة بالرابط الجديد وتغيير الحالة إلى "مرسلة"
    const study = await prisma.feasibilityStudy.update({
      where: { id },
      data: { 
        shareId,
        status: 'SENT',
        sentAt: new Date(),
      },
      select: {
        id: true,
        shareId: true,
        status: true,
        sentAt: true,
      },
    });

    // بناء الرابط الكامل
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullShareUrl = `${baseUrl}/study/${shareId}`;

    const response = NextResponse.json({ 
      success: true,
      message: 'تم إنشاء رابط المشاركة بنجاح',
      shareId: study.shareId,
      shareUrl: fullShareUrl,
      status: study.status,
    });
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating share link:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء رابط المشاركة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// GET - جلب رابط المشاركة الحالي
export async function GET(request: NextRequest, { params }: RouteParams) {
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
    
    const study = await prisma.feasibilityStudy.findUnique({
      where: { id },
      select: { 
        id: true, 
        shareId: true,
        status: true,
        sentAt: true,
        viewedAt: true,
      },
    });

    if (!study) {
      const response = NextResponse.json(
        { error: 'الدراسة غير موجودة' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // بناء الرابط الكامل إذا وجد
    let fullShareUrl = null;
    if (study.shareId) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      fullShareUrl = `${baseUrl}/study/${study.shareId}`;
    }

    const response = NextResponse.json({ 
      shareId: study.shareId,
      shareUrl: fullShareUrl,
      status: study.status,
      sentAt: study.sentAt,
      viewedAt: study.viewedAt,
    });
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error getting share link:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب رابط المشاركة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// DELETE - إلغاء رابط المشاركة
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    
    // إزالة رابط المشاركة وإعادة الحالة إلى مسودة
    const study = await prisma.feasibilityStudy.update({
      where: { id },
      data: { 
        shareId: null,
        status: 'DRAFT',
        sentAt: null,
        viewedAt: null,
      },
      select: {
        id: true,
        status: true,
      },
    });

    const response = NextResponse.json({ 
      success: true,
      message: 'تم إلغاء رابط المشاركة',
      status: study.status,
    });
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error deleting share link:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء إلغاء رابط المشاركة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
