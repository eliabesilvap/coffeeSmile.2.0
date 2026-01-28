'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import clsx from 'clsx';

const links = [
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/categorias', label: 'Categorias' },
  { href: '/admin/posts/novo', label: 'Novo Post' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-brand-100 bg-white/80 px-6 py-8 backdrop-blur">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">CoffeeSmile</p>
        <p className="mt-2 font-display text-xl text-slate-900">Painel</p>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isNewPost = link.href === '/admin/posts/novo';
          const isPosts = link.href === '/admin/posts';
          const isActive = isNewPost
            ? pathname === link.href
            : isPosts
            ? pathname === link.href || (pathname.startsWith('/admin/posts/') && !pathname.startsWith('/admin/posts/novo'))
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'block rounded-xl px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="admin-button-secondary mt-6"
        onClick={() => signOut({ callbackUrl: '/signin' })}
      >
        Sair
      </button>
    </aside>
  );
}
