import { PostForm } from '@/components/PostForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getApiBaseUrl } from '@/lib/api';

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CategoryItem = {
  id: string;
  name: string;
};

type PostResponse = {
  data?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string[];
    status: 'draft' | 'published';
    categoryId: string;
    coverImageUrl?: string | null;
    coverImagePublicId?: string | null;
    bookTitle?: string | null;
    bookAuthor?: string | null;
    bookTranslator?: string | null;
    bookYear?: number | null;
    bookPublisher?: string | null;
    bookPages?: number | null;
    amazonUrl?: string | null;
    affiliateUrl?: string | null;
    affiliateTitle?: string | null;
    affiliateButtonText?: string | null;
    affiliateImageUrl?: string | null;
    affiliateImagePublicId?: string | null;
    authorName?: string | null;
  };
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

async function fetchPost(id: string) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL ausente. Define a URL da API externa.');
  }
  const secret = process.env.ADMIN_API_SECRET;
  const response = await fetch(new URL(`posts/${id}`, baseUrl), {
    cache: 'no-store',
    next: { revalidate: 0 },
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Falha ao carregar post (${response.status}).`);
  }
  const payload = (await response.json()) as PostResponse;
  return payload.data ?? null;
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const [post, categories] = await Promise.all([
    fetchPost(params.id),
    fetchCategories(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link href="/admin/posts" className="admin-button-secondary w-fit">
          ← Voltar
        </Link>
        <h2 className="text-2xl font-semibold text-slate-900">Editar post</h2>
        <p className="text-sm text-slate-500">Atualiza os campos e guarda.</p>
      </div>
      <PostForm
        categories={categories}
        initialPost={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags,
          status: post.status,
          categoryId: post.categoryId,
          coverImageUrl: post.coverImageUrl,
          coverImagePublicId: post.coverImagePublicId,
          bookTitle: post.bookTitle,
          bookAuthor: post.bookAuthor,
          bookTranslator: post.bookTranslator,
          bookYear: post.bookYear,
          bookPublisher: post.bookPublisher,
          bookPages: post.bookPages,
          amazonUrl: post.amazonUrl,
          affiliateUrl: post.affiliateUrl,
          affiliateTitle: post.affiliateTitle,
          affiliateButtonText: post.affiliateButtonText,
          affiliateImageUrl: post.affiliateImageUrl,
          affiliateImagePublicId: post.affiliateImagePublicId,
          authorName: post.authorName,
        }}
      />
    </section>
  );
}