import Image from 'next/image';
import Link from 'next/link';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import { PostSummary } from '@/lib/types';
import { formatDate } from '@/lib/format';

export function BlogCard({ post }: { post: PostSummary }) {
  const coverImage =
    getCloudinaryImageUrl(post.coverImageUrl, 'card') || '/images/cover-default.svg';

  return (
    <article className="group overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-56 w-full">
        <Image
          src={coverImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/10 to-transparent" />
        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          {post.category.name}
        </span>
      </div>
      <div className="space-y-4 px-6 py-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-brand-500">
          <span>Publicado em {formatDate(post.publishedAt)}</span>
          <span className="h-1 w-1 rounded-full bg-brand-300" aria-hidden />
          <span>{post.readingTime} min leitura</span>
        </div>
        <h3 className="text-xl font-semibold leading-snug text-brand-900">
          <Link href={`/post/${post.slug}`} className="hover:text-brand-600">
            {post.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-brand-700">{post.excerpt}</p>
        <Link
          href={`/post/${post.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-800 hover:text-brand-600"
        >
          Ler mais
          <span aria-hidden>{'->'}</span>
        </Link>
      </div>
    </article>
  );
}
