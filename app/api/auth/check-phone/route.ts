import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    // Normalize phone number to match database format
    const normalizedPhone = normalizePhone(phone);

    // Check if phone exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true },
    });

    return NextResponse.json({
      exists: !!existingUser,
    });
  } catch (error) {
    console.error('Check phone error:', error);
    return NextResponse.json(
      { exists: false },
      { status: 200 }
    );
  }
}
