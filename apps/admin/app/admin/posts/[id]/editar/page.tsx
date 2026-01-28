import { prisma } from '@/lib/prisma';
import { PostForm } from '@/components/PostForm';
import { notFound } from 'next/navigation';
import { safeDb } from '@/lib/safe-db';
import Link from 'next/link';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const [post, categories] = await safeDb(
    { label: 'post/editar' },
    () =>
      Promise.all([
        prisma.post.findUnique({ where: { id: params.id } }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
      ]),
    [null, []] as const,
  );

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
        }}
      />
    </section>
  );
}
