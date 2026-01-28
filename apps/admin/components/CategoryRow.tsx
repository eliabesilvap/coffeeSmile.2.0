'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slug';

export type CategoryRowData = {
  id: string;
  name: string;
  slug: string;
  postsCount: number;
};

export function CategoryRow({ id, name, slug, postsCount }: CategoryRowData) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(name);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError('');

    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: currentName, slug: slugify(currentSlug) }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.message ?? 'Não foi possível guardar as alterações.');
      return;
    }

    setIsEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm('Tens a certeza que queres apagar esta categoria?');
    if (!confirmed) return;

    setLoading(true);
    setError('');

    const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.message ?? 'Não foi possível apagar a categoria.');
      return;
    }

    router.refresh();
  }

  return (
    <tr className="border-t border-brand-100">
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            className="admin-input"
            value={currentName}
            onChange={(event) => setCurrentName(event.target.value)}
          />
        ) : (
          <p className="font-semibold text-slate-900">{name}</p>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            className="admin-input"
            value={currentSlug}
            onChange={(event) => setCurrentSlug(event.target.value)}
          />
        ) : (
          <p className="text-sm text-slate-500">{slug}</p>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">{postsCount}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="admin-button-primary"
                onClick={handleSave}
                disabled={loading}
              >
                Guardar
              </button>
              <button
                type="button"
                className="admin-button-secondary"
                onClick={() => {
                  setCurrentName(name);
                  setCurrentSlug(slug);
                  setIsEditing(false);
                }}
                disabled={loading}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className="admin-button-secondary"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </button>
          )}
          <button
            type="button"
            className="admin-button-danger"
            onClick={handleDelete}
            disabled={loading || postsCount > 0}
            title={postsCount > 0 ? 'Não podes apagar uma categoria com posts.' : 'Apagar categoria'}
          >
            Apagar
          </button>
        </div>
        {postsCount > 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            Não é possível apagar com posts associados.
          </p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      </td>
    </tr>
  );
}
