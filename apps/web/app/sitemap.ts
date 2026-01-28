import { MetadataRoute } from 'next';
import { getCategories } from '@/lib/api';
import { getAllPosts } from '@/lib/content';
import { siteUrl } from '@/lib/site';
import type { PostSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl;
  const now = new Date();
  let categories: { slug: string }[] = [];
  let posts: PostSummary[] = [];

  try {
    const [categoriesResponse, postsResponse] = await Promise.all([
      getCategories(),
      getAllPosts(),
    ]);
    categories = categoriesResponse.data ?? [];
    posts = postsResponse;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Falha ao gerar sitemap.', error);
    }
  }

  const publishedPosts = posts.filter((post) => post.status === 'published');

  return [
    {
      url: baseUrl,
      lastModified: now,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: now,
    },
    ...categories.map((category) => ({
      url: `${baseUrl}/categoria/${category.slug}`,
      lastModified: now,
    })),
    ...publishedPosts.map((post) => ({
      url: `${baseUrl}/post/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
  ];
}
