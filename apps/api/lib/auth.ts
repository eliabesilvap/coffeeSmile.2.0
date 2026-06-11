import { createHash, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

function hashSecret(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export function requireAdminAuth(request: Request): NextResponse | null {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) {
    console.error('[auth] ADMIN_API_SECRET não configurada — recusando operação de escrita.');
    return NextResponse.json({ message: 'Erro de configuração do servidor.' }, { status: 500 });
  }

  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const hasToken = token.length > 0;

  let authorized = false;
  if (hasToken) {
    try {
      authorized = timingSafeEqual(hashSecret(secret), hashSecret(token));
    } catch {
      authorized = false;
    }
  }

  if (!authorized) {
    const path = new URL(request.url).pathname;
    const ip = request.headers.get('x-forwarded-for') ?? 'desconhecido';
    console.warn(`[auth] 401 ${request.method} ${path} — ip=${ip} hasToken=${hasToken}`);
    return NextResponse.json({ message: 'Nao autorizado.' }, { status: 401 });
  }

  return null;
}

export function isAdminAuth(request: Request): boolean {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return false;

  try {
    return timingSafeEqual(hashSecret(secret), hashSecret(token));
  } catch {
    return false;
  }
}
