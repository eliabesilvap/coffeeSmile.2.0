import { MetadataRoute } from 'next';
import { getCategories } from '@/lib/api';
import { getAllPosts } from '@/lib/content';
import { siteUrl } from '@/lib/site';
import type { PostSummary } from '@/lib/types';
import { categoryUrl, postUrl } from '@/lib/routes';

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
  const publishedPostTimestamps = publishedPosts
    .map((post) => new Date(post.updatedAt ?? post.publishedAt ?? 0).getTime())
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > 0);
  const latestPostModified =
    publishedPostTimestamps.length > 0 ? new Date(Math.max(...publishedPostTimestamps)) : now;

  return [
    {
      url: baseUrl,
      lastModified: latestPostModified,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: latestPostModified,
    },
    ...categories.map((category) => ({
      url: `${baseUrl}${categoryUrl(category.slug)}`,
      lastModified: latestPostModified,
    })),
    ...publishedPosts.map((post) => ({
      url: `${baseUrl}${postUrl(post.slug)}`,
      lastModified:
        post.updatedAt || post.publishedAt
          ? new Date(post.updatedAt ?? post.publishedAt)
          : latestPostModified,
    })),
  ];
}
