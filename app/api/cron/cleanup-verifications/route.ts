import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

/**
 * Cron job to clean up expired email verification records
 * Should be called every 5-10 minutes via Vercel Cron or external scheduler
 * 
 * Vercel Cron configuration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-verifications",
 *     "schedule": "every 10 minutes"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request from Vercel
    // Vercel Cron sends a special header
    const authHeader = request.headers.get('authorization');
    
    // In production, verify the cron secret from Vercel
    // Vercel automatically adds the CRON_SECRET as bearer token
    if (process.env.NODE_ENV === 'production') {
      const expectedAuth = process.env.CRON_SECRET;
      
      // Vercel sends: Authorization: Bearer <CRON_SECRET>
      if (!authHeader || authHeader !== `Bearer ${expectedAuth}`) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid cron secret' },
          { status: 401 }
        );
      }
    }

    // Delete verified records older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const deletedVerified = await prisma.emailVerification.deleteMany({
      where: {
        verified: true,
        verifiedAt: {
          lt: tenMinutesAgo,
        },
      },
    });

    // Delete unverified records that expired
    const deletedExpired = await prisma.emailVerification.deleteMany({
      where: {
        verified: false,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    const response = NextResponse.json({
      success: true,
      deletedVerified: deletedVerified.count,
      deletedExpired: deletedExpired.count,
      timestamp: new Date().toISOString(),
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Cron cleanup error:', error);
    
    const response = NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    
    return addSecurityHeaders(response);
  }
}
