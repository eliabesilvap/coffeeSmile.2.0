import type { Metadata } from 'next';
import { LayoutShell } from '@/components/LayoutShell';
import { PageHero } from '@/components/PageHero';
import { absoluteUrl, defaultOgImage } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sobre o CoffeeSmile',
  description:
    'Conhece o CoffeeSmile, um blog sobre livros cristãos, fé no dia a dia e cultura do café.',
  alternates: {
    canonical: absoluteUrl('/sobre'),
  },
  openGraph: {
    title: 'Sobre o CoffeeSmile',
    description:
      'Conhece o CoffeeSmile, um blog sobre livros cristãos, fé no dia a dia e cultura do café.',
    type: 'website',
    locale: 'pt_PT',
    url: absoluteUrl('/sobre'),
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre o CoffeeSmile',
    description:
      'Conhece o CoffeeSmile, um blog sobre livros cristãos, fé no dia a dia e cultura do café.',
    images: [defaultOgImage.url],
  },
};

export default function SobrePage() {
  return (
    <>
      <PageHero
        title="Sobre o CoffeeSmile"
        subtitle="O CoffeeSmile é um blog dedicado a livros cristãos e à cultura do café, com foco em leitura consciente, fé vivida no dia a dia e partilha prática."
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Sobre' }]}
      />
      <LayoutShell>
        <div className="rounded-3xl border border-brand-100 bg-white p-8 text-brand-700 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-brand-900">A nossa missão</h2>
          <p className="mb-4">
            O CoffeeSmile nasce do encontro entre livros que alimentam a fé e o ritual diário do café.
            Aqui partilhamos resenhas honestas, guias práticos e pequenas reflexões que ajudam a trazer
            a leitura, o silêncio e a devoção para o centro da rotina.
          </p>
          <p>
            Se queres acompanhar as novidades, subscreve a newsletter e recebe um resumo mensal com
            as publicações mais recentes.
          </p>
        </div>
      </LayoutShell>
    </>
  );
}
