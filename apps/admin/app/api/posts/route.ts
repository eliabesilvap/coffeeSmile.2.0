import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postsQuerySchema, postInputSchema } from '@/lib/validation';
import { getAdminSession } from '@/lib/session';
import { calculateReadingTime } from '@/lib/reading-time';
import { Prisma } from '@prisma/client';

const DEFAULT_PAGE_SIZE = 10;

function sanitize(value: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = postsQuerySchema.safeParse({
    q: sanitize(searchParams.get('q')),
    status: sanitize(searchParams.get('status')),
    categoryId: sanitize(searchParams.get('categoryId')),
    page: sanitize(searchParams.get('page')),
    pageSize: sanitize(searchParams.get('pageSize')),
  });

  if (!parsed.success) {
    return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
  }

  const { q, status, categoryId, page, pageSize } = parsed.data;
  const currentPage = page ?? 1;
  const limit = pageSize ?? DEFAULT_PAGE_SIZE;

  const where = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { excerpt: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const total = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const posts = await prisma.post.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { updatedAt: 'desc' },
    skip: (currentPage - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    data: posts,
    meta: {
      page: currentPage,
      pageSize: limit,
      total,
      totalPages,
    },
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = postInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0]?.message ?? 'Dados inválidos.' }, { status: 400 });
  }

  const data = parsed.data;
  const tags = data.tags.map((tag) => tag.trim()).filter(Boolean);

  try {
    const created = await prisma.post.create({
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
        author: 'Administrador',
        publishedAt: new Date(),
        readingTime: calculateReadingTime(data.content),
        tags,
        status: data.status,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'Slug já existente.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Ocorreu um erro.' }, { status: 500 });
  }
}
