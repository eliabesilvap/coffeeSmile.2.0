import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/posts/route';

const prismaMock = {
  post: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

const basePost = {
  id: 'post-1',
  title: 'Post 1',
  slug: 'post-1',
  excerpt: 'Excerto 1',
  content: 'Conteudo 1',
  coverImageUrl: '/cover-1.jpg',
  author: 'Autor 1',
  publishedAt: new Date('2024-01-01T10:00:00Z'),
  readingTime: 5,
  tags: ['cafe'],
  status: 'published' as const,
  category: { id: 'cat-1', name: 'Cafe', slug: 'cafe' },
};

describe('GET /api/posts', () => {
  it('aplica paginação e ordena por recente', async () => {
    prismaMock.post.count.mockResolvedValue(10);
    prismaMock.post.findMany.mockResolvedValue([
      basePost,
      { ...basePost, id: 'post-2', slug: 'post-2', title: 'Post 2' },
      { ...basePost, id: 'post-3', slug: 'post-3', title: 'Post 3' },
    ]);

    const request = new Request(
      'http://localhost/api/posts?page=2&limit=3&sort=recent',
    );
    const response = await GET(request);
    const json = await response.json();

    expect(prismaMock.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { publishedAt: 'desc' },
        skip: 3,
        take: 3,
      }),
    );
    expect(json.meta).toEqual({
      page: 2,
      pageSize: 3,
      total: 10,
      totalPages: 4,
    });
  });

  it('pesquisa apenas em title e excerpt', async () => {
    prismaMock.post.count.mockResolvedValue(0);
    prismaMock.post.findMany.mockResolvedValue([]);

    const request = new Request('http://localhost/api/posts?q=teologia');
    await GET(request);

    const where = prismaMock.post.count.mock.calls[0][0].where;
    expect(where).toEqual(
      expect.objectContaining({
        status: 'published',
        OR: [
          { title: { contains: 'teologia', mode: 'insensitive' } },
          { excerpt: { contains: 'teologia', mode: 'insensitive' } },
        ],
      }),
    );
  });

  it('devolve erro de validacao em PT-PT quando params sao invalidos', async () => {
    const request = new Request('http://localhost/api/posts?page=0');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toBe('Parametros invalidos.');
  });
});
