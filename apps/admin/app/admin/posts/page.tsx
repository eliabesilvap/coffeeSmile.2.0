import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatStatus } from '@/lib/format';
import { PostActions } from '@/components/PostActions';
import { safeDb } from '@/lib/safe-db';
import type { PostStatus, Prisma } from '@prisma/client';

const PAGE_SIZE = 10;
type PostWithCategory = Prisma.PostGetPayload<{ include: { category: true } }>;
type CategoryItem = Prisma.CategoryGetPayload<{}>;

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

  const where: Prisma.PostWhereInput = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { excerpt: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [posts, categories, total] = await safeDb<
    [PostWithCategory[], CategoryItem[], number]
  >(
    { label: 'posts' },
    () =>
      Promise.all([
        prisma.post.findMany({
          where,
          include: { category: true },
          orderBy: { updatedAt: 'desc' },
          skip: (currentPage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
        prisma.post.count({ where }),
      ]),
    [[], [], 0] as const,
  );

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
