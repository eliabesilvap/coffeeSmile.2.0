import type { Metadata } from 'next';
import { BlogCard } from '@/components/BlogCard';
import { LayoutShell } from '@/components/LayoutShell';
import { PageHero } from '@/components/PageHero';
import { Pagination } from '@/components/Pagination';
import { Sidebar } from '@/components/Sidebar';
import { getCategories, getPosts } from '@/lib/api';
import { deriveCategoriesFromPosts } from '@/lib/categories';
import { absoluteUrl, defaultOgImage } from '@/lib/site';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string; q?: string; tag?: string };
}): Promise<Metadata> {
  const [categoriesResponse, postsResponse] = await Promise.all([
    getCategories(),
    getPosts({
      page: searchParams.page ?? '1',
      q: searchParams.q,
      tag: searchParams.tag,
      category: params.slug,
      limit: 1,
    }),
  ]);

  const category = categoriesResponse.data.find((item) => item.slug === params.slug);
  const canonical = absoluteUrl(`/categoria/${params.slug}`);
  const title = category ? `Categoria: ${category.name}` : 'Categoria';
  const description = category
    ? `Artigos e resenhas sobre ${category.name}.`
    : 'Explora publicacoes dedicadas a este tema, com notas, resenhas e guias praticos.';
  const hasFilters =
    Boolean(searchParams.q || searchParams.tag) ||
    (Boolean(searchParams.page) && searchParams.page !== '1');
  const shouldNoIndex = !category || postsResponse.data.length === 0 || hasFilters;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_PT',
      url: canonical,
      images: [defaultOgImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultOgImage.url],
    },
    robots: shouldNoIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string; q?: string; tag?: string };
}) {
  const [postsResponse, categoriesResponse, recentPostsResponse] = await Promise.all([
    getPosts({
      page: searchParams.page ?? '1',
      q: searchParams.q,
      tag: searchParams.tag,
      category: params.slug,
    }),
    getCategories(),
    getPosts({ sort: 'recent', limit: 5 }),
  ]);

  const posts = postsResponse.data;
  const fallbackCategorySource = [...postsResponse.data, ...recentPostsResponse.data];
  const categories =
    categoriesResponse.data.length > 0
      ? categoriesResponse.data
      : deriveCategoriesFromPosts(fallbackCategorySource);
  const currentCategory = categories.find((category) => category.slug === params.slug);
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags)));
  const basePath = `/categoria/${params.slug}`;
  const recentPosts = recentPostsResponse.data;

  return (
    <>
      <PageHero
        title={currentCategory?.name ?? 'Categoria'}
        subtitle="Explora publicacoes dedicadas a este tema, com notas, resenhas e guias praticos."
        breadcrumb={[
          { label: 'Inicio', href: '/' },
          { label: currentCategory?.name ?? 'Categoria' },
        ]}
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
              basePath={basePath}
              query={{ q: searchParams.q, tag: searchParams.tag }}
            />
          </div>
          <Sidebar
            categories={categories}
            recentPosts={recentPosts}
            tags={tags}
            basePath={basePath}
            activeCategory={params.slug}
            activeTag={searchParams.tag}
            query={searchParams.q}
          />
        </div>
      </LayoutShell>
    </>
  );
}
