import { Suspense } from 'react';
import { SignInForm } from '@/components/SignInForm';

export default function SignInPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 lg:flex-row">
        <section className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">
            CoffeeSmile
          </p>
          <h1 className="mt-4 font-display text-4xl text-slate-900 sm:text-5xl">
            Bem-vindo ao painel
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-600">
            Este espaço é reservado para gerir o blog. Inicia sessão para continuar.
          </p>
        </section>
        <section className="admin-card w-full max-w-md p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Entrar</h2>
            <p className="text-sm text-slate-500">Usa o teu e-mail e palavra-passe.</p>
          </div>
          <Suspense fallback={<p className="text-sm text-slate-500">A carregar...</p>}>
            <SignInForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
