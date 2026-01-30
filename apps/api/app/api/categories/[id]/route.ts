import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiErrorResponse } from '@/lib/api-error';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categoryInputSchema = z.object({
  name: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(slugRegex),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = categoryInputSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Dados invalidos.' }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: parsed.data.name.trim(),
        slug: parsed.data.slug.trim().toLowerCase(),
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
      },
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025'
    ) {
      return NextResponse.json({ message: 'Categoria nao encontrada.' }, { status: 404 });
    }

    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return NextResponse.json({ message: 'Slug ja existe.' }, { status: 409 });
    }

    return apiErrorResponse('PUT /api/categories/[id]', error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025'
    ) {
      return NextResponse.json({ message: 'Categoria nao encontrada.' }, { status: 404 });
    }

    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2003'
    ) {
      return NextResponse.json(
        { message: 'Categoria possui posts associados.' },
        { status: 409 },
      );
    }

    return apiErrorResponse('DELETE /api/categories/[id]', error);
  }
}
