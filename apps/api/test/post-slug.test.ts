import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/posts/[slug]/route';

const prismaMock = {
  post: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('GET /api/posts/[slug]', () => {
  it('devolve relatedPosts com maximo 3, exclui o slug atual e so publicados', async () => {
    const post = {
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
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Cafe', slug: 'cafe' },
    };

    prismaMock.post.findFirst.mockResolvedValue(post);
    prismaMock.post.findMany.mockResolvedValue([
      { ...post, id: 'post-2', slug: 'post-2', title: 'Post 2' },
      { ...post, id: 'post-3', slug: 'post-3', title: 'Post 3' },
      { ...post, id: 'post-4', slug: 'post-4', title: 'Post 4' },
    ]);

    const response = await GET(new Request('http://localhost/api/posts/post-1'), {
      params: { slug: 'post-1' },
    });
    const json = await response.json();

    expect(prismaMock.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 3,
        where: expect.objectContaining({
          status: 'published',
          id: { not: 'post-1' },
        }),
      }),
    );
    expect(json.data.relatedPosts).toHaveLength(3);
    expect(json.data.relatedPosts.find((item: { slug: string }) => item.slug === 'post-1')).toBe(
      undefined,
    );
  });
});
