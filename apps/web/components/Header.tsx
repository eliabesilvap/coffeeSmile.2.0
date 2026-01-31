import Link from 'next/link';
import { categoryUrl } from '@/lib/routes';

const navItems = [
  { href: '/', label: 'Início' },
  { href: categoryUrl('livros'), label: 'Livros' },
  { href: categoryUrl('teologia'), label: 'Teologia' },
  { href: categoryUrl('devocional'), label: 'Devocional' },
  { href: categoryUrl('cafe'), label: 'Café' },
  { href: '/sobre', label: 'Sobre' },
];

export function Header() {
  return (
    <header className="border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="container-shell flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            CoffeeSmile
          </span>
          <span className="font-display text-2xl text-brand-900">Blog</span>
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-800">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-600">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
