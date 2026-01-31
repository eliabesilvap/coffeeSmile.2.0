import { Prisma, PrismaClient } from '@prisma/client';

type PrismaClientWithLogs = PrismaClient<Prisma.PrismaClientOptions, 'error'>;

type PrismaGlobal = {
  prisma?: PrismaClientWithLogs;
  prismaPoolerWarningLogged?: boolean;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

const isNewPrismaClient = !globalForPrisma.prisma;
const prisma: PrismaClientWithLogs =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [{ emit: 'event', level: 'error' }],
  });

if (isNewPrismaClient) {
  prisma.$on('error', (event: Prisma.LogEvent) => {
    console.error(
      JSON.stringify({
        level: 'error',
        scope: 'prisma',
        message: event.message,
        target: event.target ?? null,
        timestamp: new Date().toISOString(),
      }),
    );
  });
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

if (
  process.env.NODE_ENV === 'production' &&
  !globalForPrisma.prismaPoolerWarningLogged
) {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  if (!databaseUrl.includes('pgbouncer=true')) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        scope: 'prisma',
        message:
          'DATABASE_URL sem pgbouncer=true. Em producao, use a pooled connection string do Neon e connection_limit=1.',
      }),
    );
  }
  globalForPrisma.prismaPoolerWarningLogged = true;
}

export { prisma };
