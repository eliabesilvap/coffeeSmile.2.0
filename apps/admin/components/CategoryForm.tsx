'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slug';

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug: slugify(slug) }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.message ?? 'Não foi possível criar a categoria.');
      return;
    }

    setName('');
    setSlug('');
    setSlugTouched(false);
    setMessage('Categoria criada.');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-4 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="admin-label" htmlFor="category-name">
            Nome
          </label>
          <input
            id="category-name"
            className="admin-input"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="category-slug">
            Slug
          </label>
          <input
            id="category-slug"
            className="admin-input"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            required
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="admin-button-primary" disabled={loading}>
          Criar categoria
        </button>
        {message ? <span className="text-sm text-emerald-700">{message}</span> : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </form>
  );
}
