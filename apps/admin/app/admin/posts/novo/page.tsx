import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PostForm } from '@/components/PostForm';
import { safeDb } from '@/lib/safe-db';
export default async function NewPostPage() {
  const categories = await safeDb(
    { label: 'categorias' },
    () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
    [],
  );

  if (categories.length === 0) {
    return (
      <section className="admin-card p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Sem categorias</h2>
        <p className="mt-2 text-sm text-slate-500">
          Cria uma categoria antes de adicionar um post.
        </p>
        <Link href="/admin/categorias" className="admin-button-primary mt-6">
          Ir para categorias
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link href="/admin/posts" className="admin-button-secondary w-fit">
          ← Voltar
        </Link>
        <h2 className="text-2xl font-semibold text-slate-900">Novo post</h2>
        <p className="text-sm text-slate-500">Preenche os dados e publica.</p>
      </div>
      <PostForm categories={categories} />
    </section>
  );
}
