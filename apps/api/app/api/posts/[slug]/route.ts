import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/api-error';
import { postResponseSchema } from '@/lib/schemas';

const DETAIL_CACHE_CONTROL = 'public, s-maxage=300';

function mapPostSummary(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  bookTranslator: string | null;
  bookYear: number | null;
  bookPublisher: string | null;
  bookPages: number | null;
  amazonUrl: string | null;
  author: string;
  publishedAt: Date;
  readingTime: number;
  tags: string[];
  status: 'draft' | 'published';
  category: { id: string; name: string; slug: string };
}) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
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
  };
}

function mapPostDetail(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  bookTranslator: string | null;
  bookYear: number | null;
  bookPublisher: string | null;
  bookPages: number | null;
  amazonUrl: string | null;
  author: string;
  publishedAt: Date;
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
  _request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const post = await prisma.post.findFirst({
      where: {
        slug: params.slug,
        status: 'published',
      },
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
