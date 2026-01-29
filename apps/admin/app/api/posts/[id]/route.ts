import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { proxyApiRequest } from '@/lib/api-proxy';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  return proxyApiRequest(_request, `/posts/${params.id}`);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  return proxyApiRequest(request, `/posts/${params.id}`);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  return proxyApiRequest(request, `/posts/${params.id}`);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  return proxyApiRequest(_request, `/posts/${params.id}`);
}
