import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/session';
import { postInputSchema, postStatusInputSchema } from '@/lib/validation';
import { calculateReadingTime } from '@/lib/reading-time';
import { Prisma } from '@prisma/client';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!post) {
    return NextResponse.json({ message: 'Post não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ data: post });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ message: 'Post não encontrado.' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = postInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
  }

  const data = parsed.data;
  const tags = data.tags.map((tag) => tag.trim()).filter(Boolean);

  try {
    const shouldSetPublishedAt = data.status === 'published' && existing.status === 'draft';
    const updated = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl ?? null,
        coverImagePublicId: data.coverImagePublicId ?? null,
        bookTitle: data.bookTitle ?? null,
        bookAuthor: data.bookAuthor ?? null,
        bookTranslator: data.bookTranslator ?? null,
        bookYear: data.bookYear ?? null,
        bookPublisher: data.bookPublisher ?? null,
        bookPages: data.bookPages ?? null,
        amazonUrl: data.amazonUrl ?? null,
        author: existing.author,
        publishedAt: shouldSetPublishedAt ? new Date() : existing.publishedAt,
        readingTime: calculateReadingTime(data.content),
        tags,
        status: data.status,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'Slug já existente.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Ocorreu um erro.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ message: 'Post não encontrado.' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = postStatusInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
  }

  const nextStatus = parsed.data.status;
  const shouldSetPublishedAt = nextStatus === 'published' && existing.status === 'draft';

  const updated = await prisma.post.update({
    where: { id: params.id },
    data: {
      status: nextStatus,
      publishedAt: shouldSetPublishedAt ? new Date() : existing.publishedAt,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  try {
    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Post não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ocorreu um erro.' }, { status: 500 });
  }
}
