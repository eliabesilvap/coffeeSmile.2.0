'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-sm text-brand-700">
      <p>Ocorreu um erro.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-800 hover:border-brand-400"
      >
        Tentar novamente
      </button>
    </div>
  );
}
