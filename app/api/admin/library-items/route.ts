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
      description: string | null;
      roomType: string;
    }> = {};

    customizations.forEach((item) => {
      customizationsMap[item.itemId] = {
        customPrice: item.customPrice,
        image: item.image,
        description: item.description,
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
  console.log('=== POST /api/admin/library-items ===');
  
  try {
    const session = await auth();
    console.log('Session:', session ? 'Found' : 'Not found', 'Role:', session?.user?.role);
    
    if (!session || session.user?.role !== 'ADMIN') {
      console.log('Unauthorized - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, roomType, customPrice, image, description } = body;

    console.log('Request body:', JSON.stringify({ itemId, roomType, customPrice, hasImage: !!image, description }, null, 2));

    if (!itemId || !roomType) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'itemId and roomType are required' },
        { status: 400 }
      );
    }

    console.log('Attempting upsert...');
    
    // تحديث أو إنشاء التخصيص (upsert)
    const customization = await prisma.libraryItemCustomization.upsert({
      where: { itemId },
      update: {
        ...(customPrice !== undefined && { customPrice }),
        ...(image !== undefined && { image }),
        ...(description !== undefined && { description }),
      },
      create: {
        itemId,
        roomType,
        customPrice: customPrice ?? null,
        image: image ?? null,
        description: description ?? null,
      },
    });

    console.log('Upsert successful:', customization.id);

    return NextResponse.json({ 
      success: true, 
      customization: {
        itemId: customization.itemId,
        customPrice: customization.customPrice,
        image: customization.image,
        description: customization.description,
        roomType: customization.roomType,
      }
    });
  } catch (error) {
    console.error('=== ERROR in POST /api/admin/library-items ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Full error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update customization', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name 
      },
      { status: 500 }
    );
  }
}
