import { NextResponse } from 'next/server';
import { Prisma, PostStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/api-error';
import { postResponseSchema } from '@/lib/schemas';

const DETAIL_CACHE_CONTROL = 'public, s-maxage=300';
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

function mapPostSummary(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImageUrl: string | null;
  bookCoverImageUrl: string | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  bookTranslator: string | null;
  bookYear: number | null;
  bookPublisher: string | null;
  bookPages: number | null;
  amazonUrl: string | null;
  author: string;
  authorName: string | null;
  categoryId: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  readingTime: number;
  tags: string[];
  status: 'draft' | 'published';
  category: { id: string; name: string; slug: string };
}) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: buildExcerpt(post.excerpt, post.content ?? ''),
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
  };
}

function mapPostDetail(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  bookCoverImageUrl: string | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  bookTranslator: string | null;
  bookYear: number | null;
  bookPublisher: string | null;
  bookPages: number | null;
  amazonUrl: string | null;
  author: string;
  authorName: string | null;
  categoryId: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  readingTime: number;
  tags: string[];
  status: 'draft' | 'published';
  category: { id: string; name: string; slug: string };
}) {
  return {
    ...mapPostSummary(post),
    content: post.content,
  };
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const isAdminRequest = request.headers.get('x-admin-request') === '1';
    const where: Prisma.PostWhereInput = isAdminRequest
      ? {
          OR: [{ id: params.slug }, { slug: params.slug }],
        }
      : {
          slug: params.slug,
          status: PostStatus.published,
        };

    const post = await prisma.post.findFirst({
      where,
      include: {
        category: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: 'Nao foi possivel carregar.' },
        { status: 404 },
      );
    }

    const relatedFilters: Prisma.PostWhereInput[] = [
      { categoryId: post.categoryId },
    ];
    if (post.tags.length > 0) {
      relatedFilters.push({ tags: { hasSome: post.tags } });
    }

    const relatedPosts = await prisma.post.findMany({
      where: {
        status: 'published',
        id: { not: post.id },
        OR: relatedFilters,
      },
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
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    const response = {
      data: {
        ...mapPostDetail(post),
        relatedPosts: relatedPosts.map(mapPostSummary),
      },
    };

    const parsed = postResponseSchema.safeParse(response);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Dados invalidos.' }, { status: 500 });
    }

    return NextResponse.json(parsed.data, {
      headers: {
        'Cache-Control': DETAIL_CACHE_CONTROL,
      },
    });
  } catch (error) {
    return apiErrorResponse('GET /api/posts/[slug]', error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } },
) {
  if (!ensureAdminRequest(request)) {
    return NextResponse.json({ message: 'Nao autorizado.' }, { status: 401 });
  }

  try {
    const payload = await request.json().catch(() => null);
    const parsed = postInputSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Dados invalidos.' }, { status: 400 });
    }

    const existing = await prisma.post.findFirst({
      where: {
        OR: [{ id: params.slug }, { slug: params.slug }],
      },
      select: {
        id: true,
        publishedAt: true,
        author: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Post nao encontrado.' }, { status: 404 });
    }

    const readingTime = computeReadingTime(parsed.data.content);
    const shouldPublish =
      parsed.data.status === 'published' && !existing.publishedAt;

    const authorName = parsed.data.authorName?.trim();
    const updated = await prisma.post.update({
      where: { id: existing.id },
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
        ...(parsed.data.authorName !== undefined
          ? {
              authorName: authorName || null,
              author: authorName || existing.author,
            }
          : {}),
        readingTime,
        ...(shouldPublish ? { publishedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        slug: updated.slug,
      },
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return NextResponse.json({ message: 'Slug ja existe.' }, { status: 409 });
    }

    return apiErrorResponse('PUT /api/posts/[slug]', error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } },
) {
  if (!ensureAdminRequest(request)) {
    return NextResponse.json({ message: 'Nao autorizado.' }, { status: 401 });
  }

  try {
    const existing = await prisma.post.findFirst({
      where: {
        OR: [{ id: params.slug }, { slug: params.slug }],
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Post nao encontrado.' }, { status: 404 });
    }

    await prisma.post.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse('DELETE /api/posts/[slug]', error);
  }
}
