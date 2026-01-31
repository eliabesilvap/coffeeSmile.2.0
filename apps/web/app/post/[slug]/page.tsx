import type { Metadata } from 'next';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { BookBox } from '@/components/BookBox';
import { BookTechnicalSheet } from '@/components/BookTechnicalSheet';
import { LayoutShell } from '@/components/LayoutShell';
import { PageHero } from '@/components/PageHero';
import { Sidebar } from '@/components/Sidebar';
import { getImage } from '@/lib/cloudinary';
import { getCategories, getPost, getPosts } from '@/lib/api';
import { deriveCategoriesFromPosts } from '@/lib/categories';
import { formatDate } from '@/lib/format';
import { absoluteUrl, defaultOgImage } from '@/lib/site';
import { categoryUrl, postUrl } from '@/lib/routes';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const postResponse = await getPost(params.slug);
    const post = postResponse.data;
    const canonical = absoluteUrl(postUrl(post.slug));
    const description = post.excerpt;
    const rawCoverImage = post.coverImageUrl ? getImage(post.coverImageUrl, 'hero') : null;
    const coverImageUrl = rawCoverImage
      ? rawCoverImage.startsWith('http')
        ? rawCoverImage
        : absoluteUrl(rawCoverImage)
      : null;
    const ogImages = coverImageUrl
      ? [
          {
            url: coverImageUrl,
            width: 1600,
            height: 900,
            alt: post.title,
          },
        ]
      : [defaultOgImage];
    const fallbackOg = absoluteUrl(defaultOgImage.url);
    const shouldNoIndex = post.status !== 'published';

    return {
      title: post.title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        locale: 'pt_PT',
        url: canonical,
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: [coverImageUrl ?? fallbackOg],
      },
      robots: shouldNoIndex ? { index: false, follow: false } : undefined,
    };
  } catch {
    const canonical = absoluteUrl(postUrl(params.slug));
    return {
      title: 'Post não encontrado',
      alternates: {
        canonical,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const postResponse = await getPost(params.slug);
  const post = postResponse.data;
  const coverImage =
    getImage(post.coverImageUrl, 'hero') || '/images/cover-default.svg';
  const authorName = post.authorName?.trim() || post.author?.trim() || 'CoffeeSmile';

  const [categoriesResponse, recentPostsResponse, categoryPostsResponse] = await Promise.all([
    getCategories(),
    getPosts({ sort: 'recent', limit: 5 }),
    getPosts({ sort: 'recent', limit: 50, category: post.category.slug }),
  ]);

  const categories =
    categoriesResponse.data.length > 0
      ? categoriesResponse.data
      : deriveCategoriesFromPosts([post, ...recentPostsResponse.data]);
  const relatedPosts = post.relatedPosts ?? [];
  const categoryPosts = categoryPostsResponse.data.filter((item) => item.slug !== post.slug);
  const tagsSource = relatedPosts.length > 0 ? relatedPosts : [post];
  const tags = Array.from(new Set(tagsSource.flatMap((item) => item.tags)));
  const postIndex = categoryPostsResponse.data.findIndex((item) => item.slug === post.slug);
  const previousPost =
    postIndex >= 0 ? categoryPostsResponse.data[postIndex + 1] ?? null : null;
  const nextPost = postIndex >= 0 ? categoryPostsResponse.data[postIndex - 1] ?? null : null;
  const relatedByCategory = categoryPosts.slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    image: coverImage.startsWith('http') ? coverImage : absoluteUrl(coverImage),
    mainEntityOfPage: absoluteUrl(postUrl(post.slug)),
    author: {
      '@type': 'Person',
      name: authorName,
    },
  };

  return (
    <>
      <PageHero
        title={post.title}
        subtitle={post.excerpt}
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: post.category.name, href: categoryUrl(post.category.slug) },
          { label: post.title },
        ]}
      />
      <LayoutShell>
        <div className="grid gap-12 lg:grid-cols-[2.3fr_1fr]">
          <article className="space-y-8">
            <div className="relative h-72 w-full overflow-hidden rounded-3xl">
              <Image
                src={coverImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/50 to-transparent" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-500">
              <span className="text-brand-700">{post.category.name}</span>
              <span className="h-1 w-1 rounded-full bg-brand-300" aria-hidden />
              <span>{formatDate(post.publishedAt)}</span>
              <span className="h-1 w-1 rounded-full bg-brand-300" aria-hidden />
              <span>{post.readingTime} min leitura</span>
              <span className="h-1 w-1 rounded-full bg-brand-300" aria-hidden />
              <span>Por {authorName}</span>
            </div>
            <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-brand-900 prose-headings:mt-10 prose-headings:mb-4 prose-p:text-brand-700 prose-p:text-base prose-p:leading-relaxed prose-p:my-7 prose-blockquote:border-l-4 prose-blockquote:border-brand-200 prose-blockquote:bg-brand-50/60 prose-blockquote:py-3 prose-blockquote:px-6">
              <ReactMarkdown
                skipHtml
                components={{
                  h1: ({ children }) => <p>{children}</p>,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`${categoryUrl(post.category.slug)}?tag=${tag}`}
                  className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:border-brand-400"
                >
                  {tag}
                </Link>
              ))}
            </div>
            {!post.bookTitle && (
              <BookTechnicalSheet
                author={post.bookAuthor}
                translator={post.bookTranslator}
                publisher={post.bookPublisher}
                year={post.bookYear}
                pages={post.bookPages}
              />
            )}
            <BookBox
              title={post.bookTitle}
              amazonUrl={post.amazonUrl}
              coverImageUrl={post.coverImageUrl}
              author={post.bookAuthor}
              translator={post.bookTranslator}
              year={post.bookYear}
              publisher={post.bookPublisher}
              pages={post.bookPages}
            />
            {(previousPost || nextPost) && (
              <nav className="grid gap-4 rounded-3xl border border-brand-100 bg-white p-6 text-sm shadow-sm md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                    Post anterior
                  </p>
                  {previousPost ? (
                    <Link
                      href={postUrl(previousPost.slug)}
                      className="mt-2 block font-semibold text-brand-900 hover:text-brand-600"
                    >
                      {previousPost.title}
                    </Link>
                  ) : (
                    <p className="mt-2 text-brand-500">—</p>
                  )}
                </div>
                <div className="md:text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                    Próximo post
                  </p>
                  {nextPost ? (
                    <Link
                      href={postUrl(nextPost.slug)}
                      className="mt-2 block font-semibold text-brand-900 hover:text-brand-600"
                    >
                      {nextPost.title}
                    </Link>
                  ) : (
                    <p className="mt-2 text-brand-500">—</p>
                  )}
                </div>
              </nav>
            )}
            <section className="space-y-5">
              <h2 className="text-2xl font-semibold text-brand-900">Publicações relacionadas</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedByCategory.map((item) => (
                  <Link
                    key={item.id}
                    href={postUrl(item.slug)}
                    className="rounded-2xl border border-brand-100 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-soft"
                  >
                    <p className="font-semibold text-brand-900">{item.title}</p>
                    <p className="mt-2 text-brand-700">{item.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          </article>
          <Sidebar
            categories={categories}
            recentPosts={recentPostsResponse.data}
            tags={tags}
            basePath={categoryUrl(post.category.slug)}
            activeCategory={post.category.slug}
          />
        </div>
      </LayoutShell>
      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
