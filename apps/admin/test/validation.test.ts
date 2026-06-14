import { describe, it, expect } from 'vitest';
import { postInputSchema } from '@/lib/validation';

const basePost = {
  title: 'Post de teste',
  slug: 'post-de-teste',
  excerpt: '',
  content: 'Conteúdo de teste suficiente.',
  categoryId: 'cat-1',
  status: 'draft' as const,
};

const allFourAffiliate = {
  affiliateUrl: 'https://exemplo.com/produto',
  affiliateTitle: 'Aeropress Coffee Maker',
  affiliateButtonText: 'Comprar na Amazon',
  affiliateImageUrl: 'https://exemplo.com/imagem.jpg',
};

describe('postInputSchema — regra cross-field afiliado (4 campos)', () => {
  it('aceita post sem nenhum campo affiliate', () => {
    const result = postInputSchema.safeParse(basePost);
    expect(result.success).toBe(true);
  });

  it('aceita os 4 campos affiliate preenchidos', () => {
    const result = postInputSchema.safeParse({ ...basePost, ...allFourAffiliate });
    expect(result.success).toBe(true);
  });

  it('rejeita quando affiliateUrl preenchido mas affiliateTitle ausente', () => {
    const { affiliateTitle, ...rest } = allFourAffiliate;
    const result = postInputSchema.safeParse({ ...basePost, ...rest });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.errors.map((e) => e.path.join('.'));
      expect(paths).toContain('affiliateUrl');
    }
  });

  it('rejeita quando affiliateTitle preenchido mas affiliateUrl ausente', () => {
    const { affiliateUrl, ...rest } = allFourAffiliate;
    const result = postInputSchema.safeParse({ ...basePost, ...rest });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.errors.map((e) => e.path.join('.'));
      expect(paths).toContain('affiliateTitle');
    }
  });

  it('rejeita quando affiliateButtonText preenchido mas affiliateTitle ausente', () => {
    const { affiliateTitle, ...rest } = allFourAffiliate;
    const result = postInputSchema.safeParse({ ...basePost, ...rest });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.errors.map((e) => e.path.join('.'));
      expect(paths).toContain('affiliateButtonText');
    }
  });

  it('rejeita quando affiliateImageUrl preenchido mas affiliateTitle ausente', () => {
    const { affiliateTitle, ...rest } = allFourAffiliate;
    const result = postInputSchema.safeParse({ ...basePost, ...rest });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.errors.map((e) => e.path.join('.'));
      expect(paths).toContain('affiliateImageUrl');
    }
  });

  it('rejeita affiliateTitle com mais de 150 caracteres', () => {
    const result = postInputSchema.safeParse({
      ...basePost,
      ...allFourAffiliate,
      affiliateTitle: 'A'.repeat(151),
    });
    expect(result.success).toBe(false);
  });
});
