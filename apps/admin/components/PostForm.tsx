'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { slugify } from '@/lib/slug';
import { CoverUpload } from './CoverUpload';

export type CategoryOption = {
  id: string;
  name: string;
};

export type PostFormData = {
  id?: string;
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
  authorName?: string | null;
};

type PostFormProps = {
  categories: CategoryOption[];
  initialPost?: PostFormData;
};

export function PostForm({ categories, initialPost }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initialPost?.slug));
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '');
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [tagsInput, setTagsInput] = useState((initialPost?.tags ?? []).join(', '));
  const [status, setStatus] = useState<PostFormData['status']>(initialPost?.status ?? 'draft');
  const [categoryId, setCategoryId] = useState(initialPost?.categoryId ?? (categories[0]?.id ?? ''));
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialPost?.coverImageUrl ?? null);
  const [coverImagePublicId, setCoverImagePublicId] = useState<string | null>(
    initialPost?.coverImagePublicId ?? null,
  );
  const [bookTitle, setBookTitle] = useState(initialPost?.bookTitle ?? '');
  const [bookAuthor, setBookAuthor] = useState(initialPost?.bookAuthor ?? '');
  const [bookTranslator, setBookTranslator] = useState(initialPost?.bookTranslator ?? '');
  const [bookYear, setBookYear] = useState<number | null>(initialPost?.bookYear ?? null);
  const [bookPublisher, setBookPublisher] = useState(initialPost?.bookPublisher ?? '');
  const [bookPages, setBookPages] = useState<number | null>(initialPost?.bookPages ?? null);
  const [amazonUrl, setAmazonUrl] = useState(initialPost?.amazonUrl ?? '');
  const [authorName, setAuthorName] = useState(initialPost?.authorName ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  const tags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput]
  );

  async function submitForm(nextStatus: PostFormData['status']) {
    setLoading(true);
    setError('');
    setMessage('');
    setStatus(nextStatus);

    const payload = {
      title,
      slug: slugify(slug),
      excerpt,
      content,
      tags,
      status: nextStatus,
      categoryId,
      coverImageUrl: coverImageUrl?.trim() || null,
      coverImagePublicId: coverImagePublicId?.trim() || null,
      bookTitle: bookTitle?.trim() || null,
      bookAuthor: bookAuthor?.trim() || null,
      bookTranslator: bookTranslator?.trim() || null,
      bookYear,
      bookPublisher: bookPublisher?.trim() || null,
      bookPages,
      amazonUrl: amazonUrl?.trim() || null,
      authorName: authorName?.trim() || null,
    };

    const endpoint = initialPost?.id ? `/api/posts/${initialPost.id}` : '/api/posts';
    const method = initialPost?.id ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.message ?? 'Não foi possível guardar o post.');
      return;
    }

    const data = await response.json().catch(() => null);
    const postId = data?.data?.id ?? initialPost?.id;

    setMessage(nextStatus === 'published' ? 'Post publicado.' : 'Rascunho guardado.');
    if (!initialPost?.id && postId) {
      router.push(`/admin/posts/${postId}/editar`);
      router.refresh();
      return;
    }

    router.refresh();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitForm(status);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card space-y-5 p-6">
          <div>
            <label className="admin-label" htmlFor="title">
              Título
            </label>
            <input
              id="title"
              className="admin-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              className="admin-input"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              required
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="excerpt">
              Excerto
            </label>
            <textarea
              id="excerpt"
              className="admin-input min-h-[90px]"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="authorName">
              Autor
            </label>
            <input
              id="authorName"
              className="admin-input"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder="Ex.: Eliabe"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="categoryId">
              Categoria
            </label>
            <select
              id="categoryId"
              className="admin-input"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label" htmlFor="tags">
              Tags (separadas por vírgulas)
            </label>
            <input
              id="tags"
              className="admin-input"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="café, espresso, novidades"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="status">
              Estado
            </label>
            <select
              id="status"
              className="admin-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as PostFormData['status'])}
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
          <div>
            <CoverUpload
              value={coverImageUrl}
              publicId={coverImagePublicId}
              onChange={(next) => {
                setCoverImageUrl(next.url || null);
                setCoverImagePublicId(next.publicId);
              }}
            />
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Ficha do livro</h3>
              <p className="text-xs text-slate-500">Opcional, usado na caixa do livro do post.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="admin-label" htmlFor="bookTitle">
                  Título do livro
                </label>
                <input
                  id="bookTitle"
                  className="admin-input"
                  value={bookTitle}
                  onChange={(event) => setBookTitle(event.target.value)}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="bookAuthor">
                  Autor
                </label>
                <input
                  id="bookAuthor"
                  className="admin-input"
                  value={bookAuthor}
                  onChange={(event) => setBookAuthor(event.target.value)}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="bookTranslator">
                  Tradução
                </label>
                <input
                  id="bookTranslator"
                  className="admin-input"
                  value={bookTranslator}
                  onChange={(event) => setBookTranslator(event.target.value)}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="bookYear">
                  Ano
                </label>
                <input
                  id="bookYear"
                  type="number"
                  className="admin-input"
                  value={bookYear ?? ''}
                  onChange={(event) =>
                    setBookYear(event.target.value ? Number(event.target.value) : null)
                  }
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="bookPublisher">
                  Editora
                </label>
                <input
                  id="bookPublisher"
                  className="admin-input"
                  value={bookPublisher}
                  onChange={(event) => setBookPublisher(event.target.value)}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="bookPages">
                  Páginas
                </label>
                <input
                  id="bookPages"
                  type="number"
                  className="admin-input"
                  value={bookPages ?? ''}
                  onChange={(event) =>
                    setBookPages(event.target.value ? Number(event.target.value) : null)
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label" htmlFor="amazonUrl">
                  Link Amazon (afiliado)
                </label>
                <input
                  id="amazonUrl"
                  className="admin-input"
                  value={amazonUrl}
                  onChange={(event) => setAmazonUrl(event.target.value)}
                  placeholder="https://www.amazon.com.br/..."
                />
              </div>
            </div>
          </div>
          <div>
            <label className="admin-label" htmlFor="content">
              Conteúdo (markdown)
            </label>
            <textarea
              id="content"
              className="admin-input min-h-[220px] font-mono"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="admin-button-secondary"
            onClick={() => submitForm('draft')}
            disabled={loading}
          >
            Guardar rascunho
          </button>
          <button
            type="button"
            className="admin-button-primary"
            onClick={() => submitForm('published')}
            disabled={loading}
          >
            Publicar
          </button>
          <button
            type="button"
            className="admin-button-secondary"
            onClick={() => setShowPreview((prev) => !prev)}
          >
            {showPreview ? 'Fechar pré-visualização' : 'Pré-visualizar'}
          </button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </form>

      <aside className="admin-card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Pré-visualização</h3>
          <span className="text-xs uppercase text-slate-500">Markdown</span>
        </div>
        {showPreview ? (
          <div className="prose max-w-none">
            <ReactMarkdown skipHtml>
              {content || 'Sem conteúdo para mostrar.'}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Ativa a pré-visualização para ver o resultado final do markdown.
          </p>
        )}
      </aside>
    </div>
  );
}
