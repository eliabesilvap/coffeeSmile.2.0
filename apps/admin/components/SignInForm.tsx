'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('next') || '/admin/posts';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError('Credenciais inválidas.');
      return;
    }

    router.push(result.url || '/admin/posts');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="admin-label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="admin-input"
          placeholder="o.teu@email.pt"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="admin-label" htmlFor="password">
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="admin-input"
          placeholder="********"
          required
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" className="admin-button-primary w-full" disabled={loading}>
        {loading ? 'A entrar...' : 'Entrar'}
      </button>
    </form>
  );
}
