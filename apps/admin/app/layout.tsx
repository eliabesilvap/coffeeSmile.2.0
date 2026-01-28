import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Painel CoffeeSmile',
  description: 'Painel administrativo CoffeeSmile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen text-slate-900">
        {children}
      </body>
    </html>
  );
}
