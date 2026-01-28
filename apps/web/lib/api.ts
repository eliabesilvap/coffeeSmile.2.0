import { cache } from 'react';
import { CategoriesResponse, PostResponse, PostsResponse } from './types';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_URL =
  rawApiUrl || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3001' : '');

if (!rawApiUrl && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn('NEXT_PUBLIC_API_URL nao definido. Usando http://localhost:3001');
}

const LIST_REVALIDATE_SECONDS = 60;
const DETAIL_REVALIDATE_SECONDS = 300;
const CATEGORY_REVALIDATE_SECONDS = 300;

async function fetchJson<T>(url: string, revalidate: number): Promise<T> {
  const response = await fetch(url, { next: { revalidate } });

  if (!response.ok) {
    if (process.env.NODE_ENV !== 'production') {
      const payload = await response.text().catch(() => '');
      const snippet = payload.trim().slice(0, 200);
      // eslint-disable-next-line no-console
      console.error('API error', {
        url,
        status: response.status,
        statusText: response.statusText,
        payload: snippet,
      });
      const details = snippet ? ` - ${snippet}` : '';
      throw new Error(`Erro ${response.status} em ${url}${details}`);
    }
    throw new Error('Nao foi possivel carregar.');
  }

  return response.json() as Promise<T>;
}

const fetchPosts = cache(async (search: string, revalidate: number) => {
  const url = search ? `${API_URL}/api/posts?${search}` : `${API_URL}/api/posts`;
  return fetchJson<PostsResponse>(url, revalidate);
});

const fetchPost = cache(async (slug: string, revalidate: number) =>
  fetchJson<PostResponse>(`${API_URL}/api/posts/${slug}`, revalidate),
);

const fetchCategories = cache(async (revalidate: number) =>
  fetchJson<CategoriesResponse>(`${API_URL}/api/categories`, revalidate),
);

export async function getPosts(params: {
  category?: string;
  tag?: string;
  q?: string;
  page?: string | number;
  sort?: string;
  limit?: number;
  includeContent?: boolean;
}): Promise<PostsResponse> {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.tag) search.set('tag', params.tag);
  if (params.q) search.set('q', params.q);
  if (params.page) search.set('page', String(params.page));
  if (params.sort) search.set('sort', params.sort);
  if (typeof params.limit === 'number') search.set('limit', String(params.limit));
  if (params.includeContent) search.set('include', 'content');

  return fetchPosts(search.toString(), LIST_REVALIDATE_SECONDS);
}

export async function getPost(slug: string): Promise<PostResponse> {
  return fetchPost(slug, DETAIL_REVALIDATE_SECONDS);
}

export async function getCategories(): Promise<CategoriesResponse> {
  return fetchCategories(CATEGORY_REVALIDATE_SECONDS);
}
