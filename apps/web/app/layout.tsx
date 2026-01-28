import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ScrollToTop } from '@/components/ScrollToTop';
import { defaultOgImage, siteUrl } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CoffeeSmile Blog',
    template: '%s | CoffeeSmile Blog',
  },
  description:
    'Resenhas de livros cristaos, teologia, devocionais e tudo sobre cafe: metodos, noticias e curiosidades.',
  openGraph: {
    title: 'CoffeeSmile Blog',
    description:
      'Resenhas de livros cristaos, teologia, devocionais e tudo sobre cafe: metodos, noticias e curiosidades.',
    type: 'website',
    locale: 'pt_PT',
    images: [defaultOgImage],
    siteName: 'CoffeeSmile Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoffeeSmile Blog',
    description:
      'Resenhas de livros cristaos, teologia, devocionais e tudo sobre cafe: metodos, noticias e curiosidades.',
    images: [defaultOgImage.url],
  },
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-grain">
        <Header />
        <main>{children}</main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
