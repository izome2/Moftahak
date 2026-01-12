import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Count users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connected: true,
        userCount,
        databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
      nodeEnv: process.env.NODE_ENV,
    }, { status: 500 });
  }
}
