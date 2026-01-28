import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categoryInputSchema } from '@/lib/validation';
import { getAdminSession } from '@/lib/session';
import { Prisma } from '@prisma/client';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const updated = await prisma.category.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'Slug já existente.' }, { status: 409 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ocorreu um erro.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const postsCount = await prisma.post.count({ where: { categoryId: params.id } });
  if (postsCount > 0) {
    return NextResponse.json(
      { message: 'Não é possível apagar uma categoria com posts associados.' },
      { status: 409 }
    );
  }

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ocorreu um erro.' }, { status: 500 });
  }
}
