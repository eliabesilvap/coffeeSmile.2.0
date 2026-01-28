export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

export const defaultOgImage = {
  url: '/images/og-default.svg',
  width: 1200,
  height: 630,
  alt: 'CoffeeSmile Blog',
};

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}
