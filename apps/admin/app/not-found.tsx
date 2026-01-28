import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="admin-card mx-auto max-w-lg p-10 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Página não encontrada</h1>
        <p className="mt-3 text-sm text-slate-500">
          A página que procuras não existe ou foi movida.
        </p>
        <Link href="/admin/posts" className="admin-button-primary mt-6">
          Voltar ao painel
        </Link>
      </div>
    </main>
  );
}
