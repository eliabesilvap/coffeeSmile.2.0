import Link from 'next/link';

type PageItem = number | 'ellipsis';

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  if (currentPage <= 3) {
    [2, 3, 4].forEach((page) => pages.add(page));
  } else if (currentPage >= totalPages - 2) {
    [totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) => pages.add(page));
  } else {
    [currentPage - 1, currentPage, currentPage + 1].forEach((page) => pages.add(page));
  }

  const ordered = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  ordered.forEach((page, index) => {
    if (index > 0 && page - ordered[index - 1] > 1) {
      items.push('ellipsis');
    }
    items.push(page);
  });

  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  query,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  const buildHref = (page: number) => {
    const search = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value) search.set(key, value);
      });
    }
    search.set('page', String(page));
    return `${basePath}?${search.toString()}`;
  };

  const items = getPageItems(currentPage, totalPages);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-100 pt-6 text-sm text-brand-700"
      aria-label="Paginação"
    >
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        className={`rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
          currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:border-brand-400'
        }`}
      >
        Anterior
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-brand-400">
              ...
            </span>
          ) : (
            <Link
              key={item}
              href={buildHref(item)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${
                item === currentPage
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-brand-200 text-brand-700 hover:border-brand-400'
              }`}
            >
              {item}
            </Link>
          ),
        )}
      </div>
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className={`rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
          currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:border-brand-400'
        }`}
      >
        Seguinte
      </Link>
    </nav>
  );
}
