# Deploying Admin Analytics Dashboard

This document covers quick deployment options and environment variables.

1) Vercel (recommended for Next.js)

- Create a Vercel account and connect your GitHub repository.
- In Vercel project settings -> Environment Variables, add:
  - MONGODB_URI — your connection string
  - JWT_SECRET — long secret (>= 32 characters)
  - ADMIN_EMAIL, ADMIN_PASSWORD — only if you rely on seeding or demo login

- Deploy: push to `main` (or configured branch). Vercel will run `npm install` and `npm run build`.

Notes:
- For production, do not store secrets in the repository. Use Vercel's Environment Variables UI.
- If you need an external Express server, deploy it separately (e.g. Heroku, Render) and configure the frontend API base URL accordingly.

2) GitHub Actions (CI) — example

- Add a workflow that installs, builds, and lints on PRs (we add a sample `.github/workflows/ci.yml`).

3) Environment variables

- MONGODB_URI: MongoDB connection string (mongodb+srv://... or mongodb://...)
- JWT_SECRET: long random secret
- ADMIN_EMAIL / ADMIN_PASSWORD: used by the default seeder and fallback login

4) Security & production checklist

- Rotate DB credentials if they were exposed.
- Use secrets storage (Vercel env, GitHub Secrets, AWS Secrets Manager).
- Set NODE_ENV=production during build/deploy.
- Use HTTPS and secure cookies (set `secure: true` on cookies when behind TLS).
- Limit CORS origin in production on the Express server.

5) Optional: Express fallback

- We added `server/index.js` as a minimal fallback. Start it with:

```
npm run start:express
```

This is intended for running the API separately; for most deployments you can rely on Next.js API routes and host the whole app on Vercel.
