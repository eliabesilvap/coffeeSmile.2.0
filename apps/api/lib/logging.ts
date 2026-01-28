export function logApiError(route: string, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(JSON.stringify({ level: 'error', route, message }));
}
