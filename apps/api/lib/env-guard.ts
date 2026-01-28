const isLocalDev = () => {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  const siteUrl =
    process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';

  return siteUrl.toLowerCase().includes('localhost');
};

export const validateDevDatabaseUrl = () => {
  if (!isLocalDev()) {
    return;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() ?? '';

  if (!databaseUrl) {
    throw new Error(
      'Não foi possível iniciar a API. O DATABASE_URL está vazio. ' +
        'Configura-o no .env (ex.: postgres://user:password@127.0.0.1:5435/nome_da_bd).',
    );
  }

  const expectedPort = '5435';
  let hasExpectedPort = false;

  try {
    const parsedUrl = new URL(databaseUrl);
    hasExpectedPort = parsedUrl.port === expectedPort;
  } catch {
    hasExpectedPort = databaseUrl.includes(`:${expectedPort}`);
  }

  if (!hasExpectedPort) {
    console.warn(
      '[AVISO] Parece que estás a usar outra porta. Para este projeto, o Postgres local corre em 127.0.0.1:5435 (docker-compose). Atualiza o DATABASE_URL.',
    );
  }
};
