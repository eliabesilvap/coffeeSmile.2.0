import { CategoryForm } from '@/components/CategoryForm';
import { CategoryRow } from '@/components/CategoryRow';
import { getApiBaseUrl } from '@/lib/api';

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryWithCount = Category & {
  _count?: {
    posts: number;
  };
  count?: number;
};

async function fetchCategories() {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL ausente. Define a URL da API externa.');
  }

  try {
    const response = await fetch(new URL('categories', baseUrl), {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) {
      throw new Error(`Falha ao carregar categorias (${response.status}).`);
    }
    const payload = (await response.json()) as { data?: CategoryWithCount[] };
    return payload.data ?? [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Falha ao carregar categorias da API externa.');
    // eslint-disable-next-line no-console
    console.error(error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await fetchCategories();

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
                  postsCount={category.count ?? category._count?.posts ?? 0}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
