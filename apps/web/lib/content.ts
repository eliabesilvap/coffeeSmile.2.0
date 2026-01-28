import { getPosts } from './api';
import type { PostSummary } from './types';

const POSTS_PAGE_SIZE = 100;

export async function getAllPosts(options?: { includeContent?: boolean }): Promise<PostSummary[]> {
  const includeContent = options?.includeContent ?? false;
  const firstPage = await getPosts({
    page: 1,
    limit: POSTS_PAGE_SIZE,
    sort: 'recent',
    includeContent,
  });
  const posts = [...firstPage.data];
  const totalPages = firstPage.meta.totalPages;

  if (totalPages <= 1) {
    return posts;
  }

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await getPosts({
      page,
      limit: POSTS_PAGE_SIZE,
      sort: 'recent',
      includeContent,
    });
    posts.push(...response.data);
  }

  return posts;
}
