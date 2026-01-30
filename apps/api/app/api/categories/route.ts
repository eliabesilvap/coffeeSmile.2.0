import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/api-error';
import { logApiError } from '@/lib/logging';
import { categoriesResponseSchema } from '@/lib/schemas';

const CATEGORY_CACHE_CONTROL = 'public, s-maxage=300';
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categoryInputSchema = z.object({
  name: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(slugRegex),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const counts = await prisma.post.groupBy({
      by: ['categoryId'],
      where: { status: 'published' },
      _count: { _all: true },
    });

    const countsByCategory = new Map(
      counts.map((entry) => [entry.categoryId, entry._count._all]),
    );

    const response = {
      data: categories.map((category) => ({
        ...category,
        count: countsByCategory.get(category.id) ?? 0,
      })),
    };
    const parsed = categoriesResponseSchema.safeParse(response);

    if (!parsed.success) {
      logApiError('GET /api/categories (schema)', parsed.error);
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    return NextResponse.json(parsed.data, {
      headers: {
        'Cache-Control': CATEGORY_CACHE_CONTROL,
      },
    });
  } catch (error) {
    logApiError('GET /api/categories', error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = categoryInputSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Dados invalidos.' }, { status: 400 });
    }

    const created = await prisma.category.create({
      data: {
        name: parsed.data.name.trim(),
        slug: parsed.data.slug.trim().toLowerCase(),
      },
    });

    return NextResponse.json(
      {
        data: {
          id: created.id,
          name: created.name,
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

    return apiErrorResponse('POST /api/categories', error);
  }
}
