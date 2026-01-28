import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { logApiError } from '@/lib/logging';

type DbInfo = {
  host: string;
  port: string;
  database: string;
};

function getDatabaseInfo(url: string | undefined): DbInfo | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const database = parsed.pathname.replace('/', '');
    return {
      host: parsed.hostname,
      port: parsed.port || '5432',
      database: database || 'postgres',
    };
  } catch {
    return null;
  }
}

export function apiErrorResponse(route: string, error: unknown) {
  logApiError(route, error);

  if (process.env.NODE_ENV !== 'production') {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      const info = getDatabaseInfo(process.env.DATABASE_URL);
      const target = info
        ? `${info.host}:${info.port}/${info.database}`
        : 'DATABASE_URL';
      return NextResponse.json(
        {
          message: `Banco indisponivel (${target}). Verifique docker compose ps.`,
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { message: 'Erro interno na API. Verifique os logs do servidor.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: 'Ocorreu um erro.' }, { status: 500 });
}
