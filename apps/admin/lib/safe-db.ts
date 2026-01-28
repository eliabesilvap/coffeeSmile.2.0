type SafeDbOptions = {
  label: string;
};

export async function safeDb<T>(
  options: SafeDbOptions,
  query: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    // eslint-disable-next-line no-console
    console.error(`Falha ao acessar o banco (${options.label}).`);
    // eslint-disable-next-line no-console
    console.error('Sugestao: verifique o Docker com `docker compose ps`.');
    // eslint-disable-next-line no-console
    console.error(error);
    return fallback;
  }
}
