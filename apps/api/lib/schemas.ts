import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  count: z.number().int().nonnegative().optional(),
});

export const postSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string().optional(),
  coverImageUrl: z.string().min(1).nullable().optional(),
  bookCoverImageUrl: z.string().min(1).nullable().optional(),
  bookTitle: z.string().min(1).nullable().optional(),
  bookAuthor: z.string().min(1).nullable().optional(),
  bookTranslator: z.string().min(1).nullable().optional(),
  bookYear: z.number().int().nullable().optional(),
  bookPublisher: z.string().min(1).nullable().optional(),
  bookPages: z.number().int().nullable().optional(),
  amazonUrl: z.string().url().nullable().optional(),
  author: z.string(),
  authorName: z.string().min(1).nullable().optional(),
  categoryId: z.string().optional(),
  publishedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  readingTime: z.number(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published']),
  category: categorySchema,
});

export const postDetailSchema = postSummarySchema.extend({
  content: z.string(),
});

export const postsResponseSchema = z.object({
  data: z.array(postSummarySchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const postResponseSchema = z.object({
  data: postDetailSchema.extend({
    relatedPosts: z.array(postSummarySchema).optional(),
  }),
});

export const categoriesResponseSchema = z.object({
  data: z.array(categorySchema),
});

export const postsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  tag: z.string().trim().min(1).max(64).optional(),
  category: z.string().trim().min(1).max(64).optional(),
  categorySlug: z.string().trim().min(1).max(64).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  status: z.enum(['draft', 'published']).optional(),
  sort: z.enum(['recent']).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  include: z.enum(['content']).optional(),
});

export type PostResponse = z.infer<typeof postResponseSchema>;
export type PostsResponse = z.infer<typeof postsResponseSchema>;
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;
