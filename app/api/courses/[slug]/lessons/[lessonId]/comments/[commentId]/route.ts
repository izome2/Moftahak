import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// DELETE - Delete own comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string; commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const { commentId } = await params;

    // Verify ownership
    const comment = await prisma.lessonComment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Comment not found' }, { status: 404 })
      );
    }

    // Allow author or admin
    if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      );
    }

    await prisma.lessonComment.delete({ where: { id: commentId } });

    return addSecurityHeaders(
      NextResponse.json({ success: true })
    );
  } catch (error) {
    console.error('Delete comment error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}
