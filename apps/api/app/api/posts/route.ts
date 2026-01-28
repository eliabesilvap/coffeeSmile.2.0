import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/api-error';
import { postsQuerySchema, postsResponseSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 9;
const LIST_CACHE_CONTROL = 'public, s-maxage=60';

function sanitizeParam(value: string | null) {
  if (value === null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = postsQuerySchema.safeParse({
      category: sanitizeParam(searchParams.get('category')),
      categorySlug: sanitizeParam(searchParams.get('categorySlug')),
      tag: sanitizeParam(searchParams.get('tag')),
      q: sanitizeParam(searchParams.get('q')),
      page: sanitizeParam(searchParams.get('page')),
      status: sanitizeParam(searchParams.get('status')),
      sort: sanitizeParam(searchParams.get('sort')),
      limit: sanitizeParam(searchParams.get('limit')),
      include: sanitizeParam(searchParams.get('include')),
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ message: 'Parametros invalidos.' }, { status: 400 });
    }

    const { category, categorySlug, tag, q, page, status, sort, limit, include } = parsedQuery.data;
    const currentPage = page ?? 1;
    const pageSize = limit ?? DEFAULT_PAGE_SIZE;
    const includeContent = include === 'content';
    const categoryFilter = category ?? categorySlug;
    const statusFilter = status ?? 'published';

    const where = {
      status: statusFilter,
      ...(categoryFilter
        ? {
            category: {
              slug: categoryFilter,
            },
          }
        : {}),
      ...(tag
        ? {
            tags: {
              has: tag,
            },
          }
        : {}),
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
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const orderBy =
      sort === 'recent' ? { publishedAt: 'desc' as const } : { publishedAt: 'desc' as const };

    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        ...(includeContent ? { content: true } : {}),
        coverImageUrl: true,
        bookTitle: true,
        bookAuthor: true,
        bookTranslator: true,
        bookYear: true,
        bookPublisher: true,
        bookPages: true,
        amazonUrl: true,
        author: true,
        publishedAt: true,
        readingTime: true,
        tags: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    const response = {
      data: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        ...(includeContent ? { content: post.content } : {}),
        coverImageUrl: post.coverImageUrl ?? null,
        bookTitle: post.bookTitle ?? null,
        bookAuthor: post.bookAuthor ?? null,
        bookTranslator: post.bookTranslator ?? null,
        bookYear: post.bookYear ?? null,
        bookPublisher: post.bookPublisher ?? null,
        bookPages: post.bookPages ?? null,
        amazonUrl: post.amazonUrl ?? null,
        author: post.author,
        publishedAt: post.publishedAt.toISOString(),
        readingTime: post.readingTime,
        tags: post.tags,
        status: post.status,
        category: post.category,
      })),
      meta: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
      },
    };

    const parsed = postsResponseSchema.safeParse(response);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Dados invalidos.' }, { status: 500 });
    }

    return NextResponse.json(parsed.data, {
      headers: {
        'Cache-Control': LIST_CACHE_CONTROL,
      },
    });
  } catch (error) {
    return apiErrorResponse('GET /api/posts', error);
  }
}
