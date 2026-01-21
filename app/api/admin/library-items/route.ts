/**
 * API لإدارة تخصيصات عناصر المكتبة
 * - GET: جلب جميع التخصيصات
 * - POST: تحديث أو إنشاء تخصيص لعنصر
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب جميع تخصيصات العناصر
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customizations = await prisma.libraryItemCustomization.findMany({
      orderBy: { roomType: 'asc' },
    });

    // تحويل إلى كائن للوصول السريع عبر itemId
    const customizationsMap: Record<string, {
      customPrice: number | null;
      image: string | null;
      roomType: string;
    }> = {};

    customizations.forEach((item) => {
      customizationsMap[item.itemId] = {
        customPrice: item.customPrice,
        image: item.image,
        roomType: item.roomType,
      };
    });

    return NextResponse.json({ customizations: customizationsMap });
  } catch (error) {
    console.error('Error fetching library customizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customizations' },
      { status: 500 }
    );
  }
}

// POST - تحديث أو إنشاء تخصيص لعنصر
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, roomType, customPrice, image } = body;

    if (!itemId || !roomType) {
      return NextResponse.json(
        { error: 'itemId and roomType are required' },
        { status: 400 }
      );
    }

    // تحديث أو إنشاء التخصيص (upsert)
    const customization = await prisma.libraryItemCustomization.upsert({
      where: { itemId },
      update: {
        ...(customPrice !== undefined && { customPrice }),
        ...(image !== undefined && { image }),
      },
      create: {
        itemId,
        roomType,
        customPrice: customPrice ?? null,
        image: image ?? null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      customization: {
        itemId: customization.itemId,
        customPrice: customization.customPrice,
        image: customization.image,
        roomType: customization.roomType,
      }
    });
  } catch (error) {
    console.error('Error updating library customization:', error);
    return NextResponse.json(
      { error: 'Failed to update customization' },
      { status: 500 }
    );
  }
}
