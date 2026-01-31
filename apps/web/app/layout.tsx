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
    'Resenhas de livros cristãos, teologia, devocionais e tudo sobre café: métodos, notícias e curiosidades.',
  icons: {
    icon: [
      { url: '/brand/icon-favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'CoffeeSmile Blog',
    description:
      'Resenhas de livros cristãos, teologia, devocionais e tudo sobre café: métodos, notícias e curiosidades.',
    type: 'website',
    locale: 'pt_PT',
    images: [defaultOgImage],
    siteName: 'CoffeeSmile Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoffeeSmile Blog',
    description:
      'Resenhas de livros cristãos, teologia, devocionais e tudo sobre café: métodos, notícias e curiosidades.',
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
