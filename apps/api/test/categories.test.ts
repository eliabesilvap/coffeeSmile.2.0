import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/categories/route';

const prismaMock = {
  category: {
    findMany: vi.fn(),
  },
  post: {
    groupBy: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('GET /api/categories', () => {
  it('devolve count por categoria e exclui drafts', async () => {
    const categories = [
      { id: 'cat-1', name: 'Cafe', slug: 'cafe' },
      { id: 'cat-2', name: 'Teologia', slug: 'teologia' },
    ];

    prismaMock.category.findMany.mockResolvedValue(categories);
    prismaMock.post.groupBy.mockResolvedValue([
      { categoryId: 'cat-1', _count: { _all: 2 } },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(prismaMock.post.groupBy).toHaveBeenCalledWith({
      by: ['categoryId'],
      where: { status: 'published' },
      _count: { _all: true },
    });
    expect(json.data).toEqual([
      { ...categories[0], count: 2 },
      { ...categories[1], count: 0 },
    ]);
  });
});
