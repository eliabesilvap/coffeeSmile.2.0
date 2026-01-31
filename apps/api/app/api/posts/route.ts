import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/api-error';
import { postsQuerySchema, postsResponseSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 9;
const LIST_CACHE_CONTROL = 'public, s-maxage=60';
const WORDS_PER_MINUTE = 200;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const postInputSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3).regex(slugRegex),
  excerpt: z.string().trim().min(0),
  content: z.string().trim().min(10),
  tags: z.array(z.string().trim().min(1)).max(20),
  status: z.enum(['draft', 'published']),
  categoryId: z.string().trim().min(1),
  coverImageUrl: z.string().trim().min(1).nullable().optional(),
  coverImagePublicId: z.string().trim().min(1).nullable().optional(),
  bookCoverImageUrl: z.string().trim().min(1).nullable().optional(),
  bookTitle: z.string().trim().min(1).nullable().optional(),
  bookAuthor: z.string().trim().min(1).nullable().optional(),
  bookTranslator: z.string().trim().min(1).nullable().optional(),
  bookYear: z.number().int().positive().nullable().optional(),
  bookPublisher: z.string().trim().min(1).nullable().optional(),
  bookPages: z.number().int().positive().nullable().optional(),
  amazonUrl: z.string().url().nullable().optional(),
  authorName: z.string().trim().min(1).nullable().optional(),
});

function ensureAdminRequest(request: Request) {
  return request.headers.get('x-admin-request') === '1';
}

function computeReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function stripMarkdown(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~>-]+/g, ' ')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildExcerpt(excerpt: string, content: string) {
  const trimmed = excerpt.trim();
  if (trimmed.length >= 10) return trimmed;
  const clean = stripMarkdown(content);
  const snippet = clean.slice(0, 180).trim();
  if (snippet.length >= 10) return snippet;
  return clean || 'Leia a publicação completa no CoffeeSmile.';
}

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
        content: true,
        coverImageUrl: true,
        bookCoverImageUrl: true,
        bookTitle: true,
        bookAuthor: true,
        bookTranslator: true,
        bookYear: true,
        bookPublisher: true,
        bookPages: true,
        amazonUrl: true,
        author: true,
        authorName: true,
        categoryId: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
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
        excerpt: buildExcerpt(post.excerpt, post.content),
        ...(includeContent ? { content: post.content } : {}),
        coverImageUrl: post.coverImageUrl ?? null,
        bookCoverImageUrl: post.bookCoverImageUrl ?? null,
        bookTitle: post.bookTitle ?? null,
        bookAuthor: post.bookAuthor ?? null,
        bookTranslator: post.bookTranslator ?? null,
        bookYear: post.bookYear ?? null,
        bookPublisher: post.bookPublisher ?? null,
        bookPages: post.bookPages ?? null,
        amazonUrl: post.amazonUrl ?? null,
        author: post.author,
        authorName: post.authorName ?? null,
        categoryId: post.categoryId,
        publishedAt: post.publishedAt.toISOString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
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

export async function POST(request: Request) {
  if (!ensureAdminRequest(request)) {
    return NextResponse.json({ message: 'Nao autorizado.' }, { status: 401 });
  }

  try {
    const payload = await request.json().catch(() => null);
    const parsed = postInputSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Dados invalidos.' }, { status: 400 });
    }

    const now = new Date();
    const readingTime = computeReadingTime(parsed.data.content);
    const authorName = parsed.data.authorName?.trim();

    const created = await prisma.post.create({
      data: {
        title: parsed.data.title.trim(),
        slug: parsed.data.slug.trim().toLowerCase(),
        excerpt: parsed.data.excerpt.trim(),
        content: parsed.data.content,
        tags: parsed.data.tags,
        status: parsed.data.status,
        categoryId: parsed.data.categoryId,
        coverImageUrl: parsed.data.coverImageUrl ?? null,
        coverImagePublicId: parsed.data.coverImagePublicId ?? null,
        bookCoverImageUrl: parsed.data.bookCoverImageUrl ?? null,
        bookTitle: parsed.data.bookTitle ?? null,
        bookAuthor: parsed.data.bookAuthor ?? null,
        bookTranslator: parsed.data.bookTranslator ?? null,
        bookYear: parsed.data.bookYear ?? null,
        bookPublisher: parsed.data.bookPublisher ?? null,
        bookPages: parsed.data.bookPages ?? null,
        amazonUrl: parsed.data.amazonUrl ?? null,
        author: authorName || 'Administrador',
        authorName: authorName || null,
        publishedAt: now,
        readingTime,
      },
    });

    return NextResponse.json(
      {
        data: {
          id: created.id,
          slug: created.slug,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return NextResponse.json({ message: 'Slug ja existe.' }, { status: 409 });
    }

    return apiErrorResponse('POST /api/posts', error);
  }
}
