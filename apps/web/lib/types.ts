export type Category = {
  id: string;
  name: string;
  slug: string;
  count?: number;
};

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImageUrl?: string | null;
  bookTitle?: string | null;
  bookAuthor?: string | null;
  bookTranslator?: string | null;
  bookYear?: number | null;
  bookPublisher?: string | null;
  bookPages?: number | null;
  amazonUrl?: string | null;
  author: string;
  authorName?: string | null;
  categoryId?: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  status: 'draft' | 'published';
  category: Category;
};

export type PostDetail = PostSummary & {
  content: string;
  relatedPosts?: PostSummary[];
};

export type PostsResponse = {
  data: PostSummary[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type PostResponse = {
  data: PostDetail;
};

export type CategoriesResponse = {
  data: Category[];
};
