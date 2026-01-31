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
    locale: 'pt_BR',
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
            O CoffeeSmile é um espaço editorial dedicado a livros cristãos, teologia e leitura
            devocional, pensado para quem deseja aprofundar a fé cristã de forma simples e honesta.
          </p>
          <p className="mb-4">
            O conteúdo é feito para leitores que gostam de refletir com calma: gente que busca
            recomendações, resenhas e caminhos de leitura que ajudem no dia a dia, sem pressa e sem
            excesso de ruído.
          </p>
          <p>
            Unimos fé, leitura e café como ritual de reflexão — uma pausa diária que transforma
            páginas em oração, e histórias em prática.
          </p>
        </div>
      </LayoutShell>
    </>
  );
}
