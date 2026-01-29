import { NextResponse } from 'next/server';
import { getApiBaseUrl } from './api';

const BODYLESS_METHODS = new Set(['GET', 'HEAD']);

export async function proxyApiRequest(request: Request, path: string) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { message: 'API_URL ausente. Define NEXT_PUBLIC_API_URL ou API_URL.' },
      { status: 500 },
    );
  }

  const requestUrl = new URL(request.url);
  const targetUrl = new URL(path, baseUrl);
  targetUrl.search = requestUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (!BODYLESS_METHODS.has(request.method)) {
    init.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, init);
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Falha ao acessar a API externa.';
    return NextResponse.json({ message }, { status: 502 });
  }
}
