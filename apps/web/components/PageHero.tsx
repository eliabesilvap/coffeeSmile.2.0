import Link from 'next/link';

export function PageHero({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <section className="border-b border-brand-100 bg-white">
      <div className="container-shell py-12 md:py-16">
        {breadcrumb && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-500">
            {breadcrumb.map((item, index) => (
              <span key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href ? (
                  <Link href={item.href} className="hover:text-brand-700">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-brand-700">{item.label}</span>
                )}
                {index < breadcrumb.length - 1 ? <span aria-hidden>&gt;</span> : null}
              </span>
            ))}
          </div>
        )}
        <h1 className="section-title text-balanced">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-base text-brand-700">{subtitle}</p>}
      </div>
    </section>
  );
}
