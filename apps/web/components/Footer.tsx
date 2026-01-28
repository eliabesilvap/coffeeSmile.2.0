import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Início' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/categoria/livros', label: 'Livros' },
  { href: '/categoria/teologia', label: 'Teologia' },
];

const categories = [
  { href: '/categoria/livros', label: 'Livros' },
  { href: '/categoria/devocional', label: 'Devocional' },
  { href: '/categoria/teologia', label: 'Teologia' },
  { href: '/categoria/cafe', label: 'Café' },
];

const socials = [
  { href: 'https://www.instagram.com/coffeesmilee_/', label: 'Instagram' },
  { href: '#', label: 'YouTube' },
  { href: '#', label: 'Facebook' },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-white">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-brand-900">CoffeeSmile Blog</h3>
          <p className="text-sm text-brand-700">
            Um espaço onde livros cristãos, teologia, devoção e a cultura do café se encontram com
            calma e propósito.
          </p>
          <div className="flex gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            <span>Leitura</span>
            <span>Reflexão</span>
            <span>Café</span>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-900">
            Links úteis
          </h4>
          <ul className="space-y-2 text-sm text-brand-700">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-600">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-900">
            Categorias
          </h4>
          <ul className="space-y-2 text-sm text-brand-700">
            {categories.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-600">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-900">
            Subscrição
          </h4>
          <p className="text-sm text-brand-700">
            Subscreve a newsletter e recebe novas publicações e leituras selecionadas.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Seu email"
              className="w-full rounded-full border border-brand-200 px-4 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Subscrever
            </button>
          </form>
          <div className="flex gap-4 text-sm text-brand-700">
            {socials.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-brand-600">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
