import { prisma } from '@/lib/prisma';
import { CategoryForm } from '@/components/CategoryForm';
import { CategoryRow } from '@/components/CategoryRow';
import { safeDb } from '@/lib/safe-db';

export default async function CategoriesPage() {
  const categories = await safeDb(
    { label: 'categorias' },
    () =>
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      }),
    [],
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Categorias</h2>
        <p className="text-sm text-slate-500">Cria e ajusta as categorias do blog.</p>
      </div>

      <CategoryForm />

      <div className="admin-card overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Ainda não existem categorias.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Posts</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  slug={category.slug}
                  postsCount={category._count.posts}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
