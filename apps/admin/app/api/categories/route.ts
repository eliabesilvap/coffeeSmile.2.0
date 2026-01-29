import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { proxyApiRequest } from '@/lib/api-proxy';

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  return proxyApiRequest(request, '/categories');
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  return proxyApiRequest(request, '/categories');
}
