import type { Metadata } from 'next';
import { BlogCard } from '@/components/BlogCard';
import { LayoutShell } from '@/components/LayoutShell';
import { PageHero } from '@/components/PageHero';
import { Pagination } from '@/components/Pagination';
import { Sidebar } from '@/components/Sidebar';
import { getCategories, getPosts } from '@/lib/api';
import { deriveCategoriesFromPosts } from '@/lib/categories';
import { absoluteUrl, defaultOgImage } from '@/lib/site';

export function generateMetadata({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; tag?: string };
}): Metadata {
  const description =
    'Resenhas de livros cristãos, teologia, devocionais e tudo sobre café: métodos, notícias e curiosidades.';
  const canonical = absoluteUrl('/');
  const hasFilters =
    Boolean(searchParams.q || searchParams.tag) ||
    (Boolean(searchParams.page) && searchParams.page !== '1');

  return {
    title: {
      absolute: 'CoffeeSmile — Fé, Livros e Café',
    },
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: 'CoffeeSmile Blog',
      description,
      type: 'website',
      locale: 'pt_BR',
      url: canonical,
      images: [defaultOgImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'CoffeeSmile Blog',
      description,
      images: [defaultOgImage.url],
    },
    robots: hasFilters ? { index: false, follow: false } : undefined,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; tag?: string };
}) {
  const [postsResponse, categoriesResponse, recentPostsResponse] = await Promise.all([
    getPosts({
      page: searchParams.page ?? '1',
      q: searchParams.q,
      tag: searchParams.tag,
    }),
    getCategories(),
    getPosts({ sort: 'recent', limit: 5 }),
  ]);

  const posts = postsResponse.data;
  const categories =
    categoriesResponse.data.length > 0
      ? categoriesResponse.data
      : deriveCategoriesFromPosts(posts);
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags)));
  const recentPosts = recentPostsResponse.data;

  return (
    <>
      <PageHero
        title="Leitura, teologia e café na mesma mesa"
        subtitle="Resenhas de livros cristãos, reflexões devocionais e guias práticos de café para o teu dia a dia."
      />
      <LayoutShell>
        <div className="grid gap-12 lg:grid-cols-[2.3fr_1fr]">
          <div className="space-y-10">
            {posts.length === 0 ? (
              <p className="rounded-3xl border border-brand-100 bg-white p-6 text-sm text-brand-700 shadow-sm">
                Sem resultados.
              </p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
            <Pagination
              currentPage={postsResponse.meta.page}
              totalPages={postsResponse.meta.totalPages}
              basePath="/"
              query={{ q: searchParams.q, tag: searchParams.tag }}
            />
          </div>
          <Sidebar
            categories={categories}
            recentPosts={recentPosts}
            tags={tags}
            basePath="/"
            activeTag={searchParams.tag}
            query={searchParams.q}
          />
        </div>
      </LayoutShell>
    </>
  );
}
