import { validateDevDatabaseUrl } from '../lib/env-guard';

validateDevDatabaseUrl();

export const metadata = {
  title: 'API CoffeeSmile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
