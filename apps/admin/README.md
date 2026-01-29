# Admin (apps/admin)

## Env vars (production)

Required:
- NEXT_PUBLIC_API_URL (API externa no Render)
- NEXTAUTH_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD

Required on the client when rendering cover uploads:
- NEXT_PUBLIC_SITE_URL

Optional (server-side override for the API):
- API_URL
