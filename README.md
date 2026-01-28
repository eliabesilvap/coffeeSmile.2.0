# CoffeeSmile Blog

Blog completo em monorepo (Turborepo + pnpm) com Next.js 14, Tailwind CSS, PostgreSQL e Prisma.

## Requisitos
- Node 24.0.0
- pnpm 9+
- Docker (para o PostgreSQL)

## Comecar
1) Instalar dependencias:
```bash
pnpm install
```

2) Copiar variaveis de ambiente:
```bash
copy .env.example .env
```
- Define `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL`.

3) Iniciar a base de dados:
```bash
docker compose up -d
```

4) Migrar e semear:
```bash
pnpm db:migrate
pnpm db:seed
```

Opcional (atalho que reinicia tudo):
```bash
pnpm db:reset
```

5) Iniciar o monorepo:
```bash
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Admin: `http://localhost:3002`

## Scripts
- `pnpm dev` - inicia web + api + admin
- `pnpm dev:admin` - inicia apenas o admin
- `pnpm build` - build de producao
- `pnpm lint` - lint nos apps
- `pnpm db:reset` - reinicia a base de dados (down/up + migrate + seed)
- `pnpm db:migrate` - migrations Prisma
- `pnpm db:seed` - seed de dados

## Estrutura
```
apps/web   # Next.js App Router (UI)
apps/api   # Next.js Route Handlers (API)
apps/admin # Painel administrativo
```

## Env por app (monorepo)
- Cada app le seu proprio `.env.local` dentro da sua pasta.
- O `.env` da raiz fica como referencia, mas nao substitui os `.env.local` dos apps.
- `apps/admin/.env.local`: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e credenciais do Cloudinary.
- `apps/api/.env.local`: `DATABASE_URL`.
- `apps/web/.env.local`: `NEXT_PUBLIC_API_URL`.

## Notas
- Imagens de capa estao em `apps/web/public/images`.
- Ajusta `NEXT_PUBLIC_API_URL` se mudares as portas.
- Upload de capa (Cloudinary) usa as variaveis: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` e `CLOUDINARY_FOLDER`.

## Cloudinary (upload de capas)
1) Criar conta em https://cloudinary.com e ir a Dashboard.
2) Copiar `cloud_name`, `api_key` e `api_secret` para o `.env`.
3) (Opcional) Definir `CLOUDINARY_FOLDER=coffeesmile`.

Para testar localmente:
- Inicia o admin (`pnpm dev:admin`), edita um post e usa "Carregar capa".

## Exemplo de .env
```bash
DATABASE_URL="postgres://user:password@127.0.0.1:5435/coffesmile"
```
