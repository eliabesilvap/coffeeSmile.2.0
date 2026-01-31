import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-brand-900">Página não encontrada</h1>
      <p className="mt-4 text-brand-700">
        A página que procuras não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-700 hover:border-brand-400"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
