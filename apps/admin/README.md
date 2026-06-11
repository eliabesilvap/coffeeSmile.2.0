# Admin (apps/admin)

## Env vars (production)

Required:
- NEXT_PUBLIC_API_URL (API externa no Render)
- NEXTAUTH_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD
- ADMIN_API_SECRET — **OBRIGATÓRIO em produção**. Segredo partilhado com a API para autenticar operações de escrita (POST, PUT, DELETE). Gerar com `openssl rand -hex 32`. Deve ser idêntico ao valor configurado no serviço da API. Sem esta variável, todas as operações de escrita falham com 500.

Required on the client when rendering cover uploads:
- NEXT_PUBLIC_SITE_URL

Optional (server-side override for the API):
- API_URL
