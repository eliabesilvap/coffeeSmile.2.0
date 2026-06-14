import Image from 'next/image';

type AffiliateCtaProps = {
  url: string;
  buttonText: string;
  imageUrl: string;
};

export function AffiliateCta({ url, buttonText, imageUrl }: AffiliateCtaProps) {
  return (
    <section className="rounded-3xl border border-brand-100 bg-white px-6 py-8 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
        <div className="relative mx-auto w-40 aspect-[2/3] overflow-hidden rounded-2xl bg-brand-50 md:mx-0">
          <Image
            src={imageUrl}
            alt={buttonText}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 50vw, 180px"
          />
        </div>
        <div className="flex flex-col justify-center gap-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-400">
            Link patrocinado
          </p>
          <a
            href={url}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-brand-600"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
