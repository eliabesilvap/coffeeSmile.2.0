import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logApiError } from '@/lib/logging';
import { categoriesResponseSchema } from '@/lib/schemas';

const CATEGORY_CACHE_CONTROL = 'public, s-maxage=300';

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
