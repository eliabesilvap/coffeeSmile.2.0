export function getApiBaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? '';
  if (!rawUrl) return '';

  const url = new URL(rawUrl);
  const pathname = url.pathname.replace(/\/$/, '');
  const apiPath = pathname.endsWith('/api') ? `${pathname}/` : `${pathname}/api/`;

  url.pathname = apiPath;
  url.search = '';
  url.hash = '';

  return url.toString();
}
