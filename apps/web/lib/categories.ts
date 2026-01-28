import type { Category, PostSummary } from '@/lib/types';

export function deriveCategoriesFromPosts(posts: PostSummary[]): Category[] {
  const categoryMap = new Map<string, Category & { count?: number }>();

  posts.forEach((post) => {
    const category = post.category;
    if (!category) return;
    const existing = categoryMap.get(category.slug);
    if (existing) {
      existing.count = (existing.count ?? 0) + 1;
      return;
    }
    categoryMap.set(category.slug, { ...category, count: 1 });
  });

  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}
