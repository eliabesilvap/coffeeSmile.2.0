import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categoryInputSchema } from '@/lib/validation';
import { getAdminSession } from '@/lib/session';
import { Prisma } from '@prisma/client';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = categoryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
  }

  try {
    const created = await prisma.category.create({ data: parsed.data });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'Slug já existente.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Ocorreu um erro.' }, { status: 500 });
  }
}
