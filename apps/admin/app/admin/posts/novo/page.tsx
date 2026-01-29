import Link from 'next/link';
import { PostForm } from '@/components/PostForm';
import { getApiBaseUrl } from '@/lib/api';

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CategoryItem = {
  id: string;
  name: string;
};

async function fetchCategories() {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL ausente. Define a URL da API externa.');
  }

  try {
    const response = await fetch(new URL('/categories', baseUrl), {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) {
      throw new Error(`Falha ao carregar categorias (${response.status}).`);
    }
    const payload = (await response.json()) as { data?: CategoryItem[] };
    return payload.data ?? [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Falha ao carregar categorias da API externa.');
    // eslint-disable-next-line no-console
    console.error(error);
    return [];
  }
}

export default async function NewPostPage() {
  const categories = await fetchCategories();

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
