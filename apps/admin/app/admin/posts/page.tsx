import Link from 'next/link';
import { formatDate, formatStatus } from '@/lib/format';
import { PostActions } from '@/components/PostActions';
import { getApiBaseUrl } from '@/lib/api';

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 10;
type PostWithCategory = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedAt?: string | null;
  category: {
    id: string;
    name: string;
  };
};
type PostStatus = PostWithCategory['status'];
type CategoryItem = {
  id: string;
  name: string;
  slug?: string;
};

type PostsResponse = {
  data?: PostWithCategory[];
  meta?: {
    total?: number;
  };
};

function buildQuery(
  params: {
    q?: string;
    status?: string;
    categoryId?: string;
  },
  page: number
) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.status) searchParams.set('status', params.status);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  searchParams.set('page', page.toString());
  return `?${searchParams.toString()}`;
}

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

async function fetchPosts(params: {
  q?: string;
  status?: string;
  categoryId?: string;
  page: number;
}) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL ausente. Define a URL da API externa.');
  }

  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.status) searchParams.set('status', params.status);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  searchParams.set('page', params.page.toString());
  searchParams.set('pageSize', PAGE_SIZE.toString());

  try {
    const url = new URL('posts', baseUrl);
    url.search = searchParams.toString();
    const response = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) {
      throw new Error(`Falha ao carregar posts (${response.status}).`);
    }
    return (await response.json()) as PostsResponse;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Falha ao carregar posts da API externa.');
    // eslint-disable-next-line no-console
    console.error(error);
    return { data: [], meta: { total: 0 } };
  }
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; categoryId?: string; page?: string };
}) {
  const q = searchParams.q?.trim() || undefined;
  const status: PostStatus | undefined =
    searchParams.status === 'draft' || searchParams.status === 'published'
      ? searchParams.status
      : undefined;
  const categoryId = searchParams.categoryId || undefined;
  const parsedPage = Number(searchParams.page ?? '1');
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [postsResponse, categories] = await Promise.all([
    fetchPosts({ q, status, categoryId, page: currentPage }),
    fetchCategories(),
  ]);

  const posts = postsResponse.data ?? [];
  const total = postsResponse.meta?.total ?? posts.length;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Posts</h2>
          <p className="text-sm text-slate-500">
            {total === 0 ? 'Nenhum post encontrado.' : `${total} posts encontrados.`}
          </p>
        </div>
        <Link href="/admin/posts/novo" className="admin-button-primary">
          Criar post
        </Link>
      </div>

      <form className="admin-card flex flex-col gap-4 p-5 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="admin-label" htmlFor="q">
            Pesquisa
          </label>
          <input
            id="q"
            name="q"
            className="admin-input"
            placeholder="Título ou excerto"
            defaultValue={q}
          />
        </div>
        <div className="w-full lg:w-48">
          <label className="admin-label" htmlFor="status">
            Estado
          </label>
          <select id="status" name="status" className="admin-input" defaultValue={status ?? ''}>
            <option value="">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <div className="w-full lg:w-56">
          <label className="admin-label" htmlFor="categoryId">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            className="admin-input"
            defaultValue={categoryId ?? ''}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="admin-button-secondary">
          Filtrar
        </button>
      </form>

      <div className="admin-card overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Nenhum post para mostrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Título</th>
                  <th className="px-6 py-3">Categoria</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-brand-50/70">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{post.title}</p>
                        <p className="text-xs text-slate-500">{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{post.category.name}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                        {formatStatus(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {post.status === 'draft' ? '-' : formatDate(post.publishedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-3">
                        <Link
                          href={`/admin/posts/${post.id}/editar`}
                          className="admin-button-secondary"
                        >
                          Editar
                        </Link>
                        <PostActions id={post.id} status={post.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Link
            href={buildQuery({ q, status, categoryId }, Math.max(1, currentPage - 1))}
            className={`admin-button-secondary ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            Anterior
          </Link>
          <Link
            href={buildQuery({ q, status, categoryId }, Math.min(totalPages, currentPage + 1))}
            className={`admin-button-secondary ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
          >
            Seguinte
          </Link>
        </div>
      </div>
    </section>
  );
}
