import { z } from 'zod';

export const postStatusSchema = z.enum(['draft', 'published']);

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const postInputSchema = z
  .object({
    title: z.string().min(3, 'Título demasiado curto.'),
    slug: z
      .string()
      .min(3, 'Slug demasiado curto.')
      .regex(slugRegex, 'Slug inválido.'),
    excerpt: z.string().min(0),
    content: z.string().min(10, 'Conteúdo demasiado curto.'),
    categoryId: z.string().min(1, 'Categoria obrigatória.'),
    tags: z.array(z.string().min(1)).max(20).default([]),
    status: postStatusSchema,
    coverImageUrl: z.string().trim().min(1, 'Imagem de capa inválida.').optional().nullable(),
    coverImagePublicId: z.string().trim().min(1, 'Public ID inválido.').optional().nullable(),
    bookTitle: z.string().trim().min(1, 'Título do livro inválido.').optional().nullable(),
    bookAuthor: z.string().trim().min(1, 'Autor inválido.').optional().nullable(),
    bookTranslator: z.string().trim().min(1, 'Tradução inválida.').optional().nullable(),
    bookYear: z.number().int().positive().optional().nullable(),
    bookPublisher: z.string().trim().min(1, 'Editora inválida.').optional().nullable(),
    bookPages: z.number().int().positive().optional().nullable(),
    authorName: z.string().trim().min(1, 'Autor inválido.').optional().nullable(),
    amazonUrl: z.preprocess(
      (value) => (value === null || value === '' ? undefined : value),
      z.string().regex(/^https?:\/\//, 'URL deve começar com http:// ou https://').url('URL inválida.').optional(),
    ),
    affiliateUrl: z.preprocess(
      (value) => (value === null || value === '' ? undefined : value),
      z.string().regex(/^https?:\/\//, 'URL deve começar com http:// ou https://').url('URL inválida.').optional(),
    ),
    affiliateButtonText: z.string().trim().min(1, 'Texto do botão inválido.').optional().nullable(),
    affiliateImageUrl: z.preprocess(
      (value) => (value === null || value === '' ? undefined : value),
      z.string().url('URL inválida.').optional(),
    ),
    affiliateImagePublicId: z.string().trim().min(1).optional().nullable(),
  })
  .refine((data) => !data.bookTitle || Boolean(data.amazonUrl), {
    message: 'Link da Amazon obrigatório quando o livro estiver preenchido.',
    path: ['amazonUrl'],
  })
  .refine(
    (data) => {
      const hasUrl = Boolean(data.affiliateUrl);
      const hasText = Boolean(data.affiliateButtonText?.trim());
      const hasImage = Boolean(data.affiliateImageUrl);
      if (!hasUrl && !hasText && !hasImage) return true;
      return hasText && hasImage;
    },
    {
      message: 'Texto do botão e imagem são obrigatórios quando há link de afiliado.',
      path: ['affiliateUrl'],
    },
  )
  .refine(
    (data) => {
      const hasUrl = Boolean(data.affiliateUrl);
      const hasText = Boolean(data.affiliateButtonText?.trim());
      const hasImage = Boolean(data.affiliateImageUrl);
      if (!hasUrl && !hasText && !hasImage) return true;
      return hasUrl && hasImage;
    },
    {
      message: 'Link de afiliado e imagem são obrigatórios quando há texto do botão.',
      path: ['affiliateButtonText'],
    },
  )
  .refine(
    (data) => {
      const hasUrl = Boolean(data.affiliateUrl);
      const hasText = Boolean(data.affiliateButtonText?.trim());
      const hasImage = Boolean(data.affiliateImageUrl);
      if (!hasUrl && !hasText && !hasImage) return true;
      return hasUrl && hasText;
    },
    {
      message: 'Link de afiliado e texto do botão são obrigatórios quando há imagem.',
      path: ['affiliateImageUrl'],
    },
  );

export const postStatusInputSchema = z.object({
  status: postStatusSchema,
});

export const postsQuerySchema = z.object({
  q: z.string().optional(),
  status: postStatusSchema.optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export const categoryInputSchema = z.object({
  name: z.string().min(2, 'Nome demasiado curto.'),
  slug: z
    .string()
    .min(2, 'Slug demasiado curto.')
    .regex(slugRegex, 'Slug inválido.'),
});

