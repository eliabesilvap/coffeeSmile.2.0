import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logApiError } from '@/lib/logging';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    logApiError('GET /api/health/db', error);
    return NextResponse.json({ status: 'unavailable' }, { status: 503 });
  }
}
