import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL ausente no apps/admin/.env.local');
}

function getDatabaseInfo(url: string) {
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

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  prisma.$connect().catch((error) => {
    const info = getDatabaseInfo(databaseUrl);
    if (info) {
      // eslint-disable-next-line no-console
      console.error(
        `Falha ao conectar no banco (${info.host}:${info.port}/${info.database}).`,
      );
    } else {
      // eslint-disable-next-line no-console
      console.error('Falha ao conectar no banco (DATABASE_URL invalida).');
    }
    // eslint-disable-next-line no-console
    console.error('Sugestao: verifique o Docker com `docker compose ps`.');
    // eslint-disable-next-line no-console
    console.error(error);
  });
}
