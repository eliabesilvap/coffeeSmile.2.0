'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PostActions({ id, status }: { id: string; status: 'draft' | 'published' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function toggleStatus() {
    setLoading(true);
    setError('');

    const nextStatus = status === 'published' ? 'draft' : 'published';
    const response = await fetch(`/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.message ?? 'Não foi possível atualizar o estado.');
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm('Tens a certeza que queres apagar este post?');
    if (!confirmed) return;

    setLoading(true);
    setError('');

    const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.message ?? 'Não foi possível apagar o post.');
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="admin-button-secondary"
          onClick={toggleStatus}
          disabled={loading}
        >
          {status === 'published' ? 'Despublicar' : 'Publicar'}
        </button>
        <button
          type="button"
          className="admin-button-danger"
          onClick={handleDelete}
          disabled={loading}
        >
          Apagar
        </button>
      </div>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
