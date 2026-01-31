import Image from 'next/image';
import { getImage } from '@/lib/cloudinary';

type BookBoxProps = {
  title: string | null | undefined;
  amazonUrl?: string | null;
  coverImageUrl?: string | null;
  author?: string | null;
  translator?: string | null;
  year?: number | null;
  publisher?: string | null;
  pages?: number | null;
  showAffiliateNote?: boolean;
};

export function BookBox({
  title,
  amazonUrl,
  coverImageUrl,
  author,
  translator,
  year,
  publisher,
  pages,
  showAffiliateNote = true,
}: BookBoxProps) {
  if (!title) {
    return null;
  }

  const coverImage =
    getImage(coverImageUrl, 'book') || '/images/cover-default.svg';

  return (
    <section className="rounded-3xl border border-brand-100 bg-white px-6 py-8 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
        <div className="relative mx-auto h-56 w-40 overflow-hidden rounded-2xl bg-brand-50 md:mx-0">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 180px"
          />
        </div>
        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-400">
              Caixa do livro
            </p>
            <h3 className="text-2xl font-semibold text-brand-900">{title}</h3>
            <dl className="grid gap-4 text-sm text-brand-700 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                  Autor
                </dt>
                <dd>{author || '—'}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                  Tradução
                </dt>
                <dd>{translator || '—'}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                  Ano
                </dt>
                <dd>{year ?? '—'}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                  Editora
                </dt>
                <dd>{publisher || '—'}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                  Páginas
                </dt>
                <dd>{pages ?? '—'}</dd>
              </div>
            </dl>
          </div>
          {amazonUrl ? (
            <div className="space-y-2">
              <a
                href={amazonUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-brand-600"
              >
                Ver este livro na Amazon
              </a>
              {showAffiliateNote ? (
                <span className="text-[10px] uppercase tracking-[0.25em] text-brand-400">
                  Link de afiliado
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
