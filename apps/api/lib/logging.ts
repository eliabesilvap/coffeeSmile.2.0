export function logApiError(route: string, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const payload: Record<string, unknown> = {
    level: 'error',
    route,
    message,
  };

  if (error instanceof Error) {
    payload.name = error.name;
  }

  if (typeof error === 'object' && error && 'code' in error) {
    payload.code = (error as { code?: string }).code ?? null;
  }

  console.error(JSON.stringify(payload));
}
