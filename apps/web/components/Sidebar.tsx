import Image from 'next/image';
import Link from 'next/link';
import { resolvePostCoverImage } from '@/lib/post-images';
import { Category, PostSummary } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { categoryUrl, postUrl } from '@/lib/routes';

type CategoryWithCount = Category & { count?: number };

const cardBase = 'rounded-3xl border border-brand-100 bg-white p-6 shadow-sm';

export function SearchBox({ basePath, query }: { basePath: string; query?: string }) {
  return (
    <div className={cardBase}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-900">
        Pesquisa
      </h3>
      <form action={basePath} className="space-y-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-400">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L16.5 16.5" />
            </svg>
          </span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Pesquisar artigos"
            className="w-full rounded-full border border-brand-200 bg-white px-10 py-2 text-sm text-brand-800 focus:border-brand-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-600"
        >
          Pesquisar
        </button>
      </form>
    </div>
  );
}

export function CategoryList({
  categories,
  activeCategory,
}: {
  categories: CategoryWithCount[];
  activeCategory?: string;
}) {
  const visibleCategories = categories.filter(
    (category) => typeof category.count !== 'number' || category.count > 0,
  );
  const hasCategories = visibleCategories.length > 0;
  return (
    <div className={cardBase}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-900">
        Categorias
      </h3>
      {hasCategories ? (
        <ul className="space-y-3 text-sm text-brand-700">
          {visibleCategories.map((category) => (
            <li key={category.id} className="flex items-center justify-between">
              <Link
                href={categoryUrl(category.slug)}
                className={`hover:text-brand-600 ${
                  activeCategory === category.slug ? 'font-semibold text-brand-900' : ''
                }`}
              >
                {category.name}
              </Link>
              {typeof category.count === 'number' && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-500">
                  {category.count}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-brand-600">Sem categorias no momento.</p>
      )}
    </div>
  );
}

export function RecentPosts({ posts }: { posts: PostSummary[] }) {
  return (
    <div className={cardBase}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-900">
        Publicações recentes
      </h3>
      <ul className="space-y-4 text-sm text-brand-700">
        {posts.map((post) => (
          <li key={post.id} className="flex gap-3">
            <Link href={postUrl(post.slug)} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src={
                  resolvePostCoverImage(post, 'thumb') ||
                  '/images/cover-default.svg'
                }
                alt={post.title}
                fill
                className="object-cover object-center"
                sizes="64px"
              />
            </Link>
            <div className="space-y-1">
              <Link href={postUrl(post.slug)} className="font-semibold text-brand-900 hover:text-brand-600">
                {post.title}
              </Link>
              <p className="text-xs text-brand-500">{formatDate(post.publishedAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TagCloud({
  tags,
  basePath,
  activeTag,
}: {
  tags: string[];
  basePath: string;
  activeTag?: string;
}) {
  return (
    <div className={cardBase}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-900">
        Etiquetas
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`${basePath}?tag=${tag}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              activeTag === tag
                ? 'border-brand-700 bg-brand-700 text-white'
                : 'border-brand-200 text-brand-700 hover:border-brand-400'
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function NewsletterCard() {
  return (
    <div className="rounded-3xl border border-brand-700 bg-brand-700 p-6 text-white shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.25em]">Subscrição</h3>
      <p className="mt-2 text-sm text-brand-100">
        Leituras, reflexões e novas publicações direto no teu email. Sem spam.
      </p>
      <form className="mt-4 space-y-3">
        <input
          type="email"
          name="email"
          required
          placeholder="Seu email"
          className="w-full rounded-full border border-white/30 bg-transparent px-4 py-2 text-sm placeholder:text-white/70 focus:border-white focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-900"
        >
          Subscrever
        </button>
      </form>
    </div>
  );
}

export function Sidebar({
  categories,
  recentPosts,
  tags,
  basePath,
  activeCategory,
  activeTag,
  query,
}: {
  categories: CategoryWithCount[];
  recentPosts: PostSummary[];
  tags: string[];
  basePath: string;
  activeCategory?: string;
  activeTag?: string;
  query?: string;
}) {
  return (
    <aside className="space-y-8">
      <SearchBox basePath={basePath} query={query} />
      <CategoryList categories={categories} activeCategory={activeCategory} />
      <RecentPosts posts={recentPosts} />
      <TagCloud tags={tags} basePath={basePath} activeTag={activeTag} />
      <NewsletterCard />
    </aside>
  );
}
