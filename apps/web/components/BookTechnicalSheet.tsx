type BookTechnicalSheetProps = {
  author?: string | null;
  translator?: string | null;
  publisher?: string | null;
  year?: number | null;
  pages?: number | null;
};

export function BookTechnicalSheet({
  author,
  translator,
  publisher,
  year,
  pages,
}: BookTechnicalSheetProps) {
  const items = [
    { label: 'Autor', value: author },
    { label: 'Tradução', value: translator },
    { label: 'Editora', value: publisher },
    { label: 'Ano', value: year ? String(year) : null },
    { label: 'Páginas', value: pages ? String(pages) : null },
  ].filter((item) => item.value);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-brand-100 bg-brand-50/60 px-6 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-500">
        Ficha técnica do livro
      </p>
      <dl className="mt-4 grid gap-4 text-sm text-brand-700 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <dt className="text-[11px] uppercase tracking-[0.2em] text-brand-500">
              {item.label}
            </dt>
            <dd className="text-brand-700">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
