import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';
import { randomBytes } from 'crypto';

const VALID_ROLES = ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] as const;

// GET - قائمة الدعوات
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  try {
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return errorResponse('حدث خطأ في تحميل الدعوات', 500);
  }
}

// POST - إنشاء دعوة جديدة
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 20 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const { role: inviteRole } = body;

    if (!inviteRole || !VALID_ROLES.includes(inviteRole)) {
      return errorResponse('دور غير صالح');
    }

    // Generate unique code (URL-safe)
    const code = randomBytes(24).toString('base64url');

    // Expires in 3 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    // Get creator name
    const creator = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { firstName: true, lastName: true },
    });
    const createdByName = creator
      ? `${creator.firstName} ${creator.lastName}`.trim()
      : 'مدير';

    const invitation = await prisma.invitation.create({
      data: {
        code,
        role: inviteRole,
        createdBy: authResult.userId,
        createdByName,
        expiresAt,
      },
    });

    return successResponse({ invitation }, 201);
  } catch (error) {
    console.error('Error creating invitation:', error);
    return errorResponse('حدث خطأ في إنشاء الدعوة', 500);
  }
}
