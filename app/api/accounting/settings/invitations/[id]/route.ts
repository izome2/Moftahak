import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';

// DELETE - حذف/إلغاء دعوة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;

    await prisma.invitation.delete({
      where: { id },
    });

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return errorResponse('حدث خطأ في حذف الدعوة', 500);
  }
}
