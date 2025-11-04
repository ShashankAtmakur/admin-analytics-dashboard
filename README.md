# Admin Analytics Dashboard (Next.js + TypeScript)

This is a demo Admin Analytics Dashboard built with Next.js (TypeScript), TailwindCSS and Recharts. It uses Next.js API routes to serve analytics data from an in-memory seed dataset. Optionally you can configure a MongoDB instance via `MONGODB_URI`.

Features
- User demographics by country (pie)
- CV analysis trends (line)
## Admin Analytics Dashboard (Next.js + TypeScript)

Full-featured admin dashboard (Next.js + TypeScript) with analytics visualizations, role-protected admin pages, optional MongoDB persistence, and a small Express fallback API for hosting the backend separately.

Key features
- SSR dashboard with KPI cards, country breakdown, CV analysis trends, paid/free donut, leaderboard and feedback analytics
- Recharts-based visualizations
- Authentication: JWT stored in HttpOnly cookie, server-side validation for protected pages
- MongoDB integration via Mongoose (optional — falls back to seeded demo data if `MONGODB_URI` is not set)
- SSE endpoint for simulated real-time KPI updates

Demo credentials (local dev fallback)
- Email: `admin@example.com`
- Password: `Password123`

Quick start (local)
1. Install dependencies

```pwsh
cd 'd:\AariyaTech\project'
npm install
```

2. Configure environment (optional — `.env.local` is gitignored)
- Create a `.env.local` in the project root with the following values (example):

```
MONGODB_URI="your-mongodb-connection-string"
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Password123"
```

3. (Optional) Seed your MongoDB (only if `MONGODB_URI` is set)

```pwsh
npm run seed
```

4. Run the app in development

```pwsh
npm run dev
```

Open http://localhost:3000, sign in with the demo credentials (or the admin you seeded).

Express fallback server
- A minimal Express fallback server is available at `server/index.js`. Start it with:

```pwsh
npm run start:express
```

It exposes:
- GET `/health` — healthcheck
- GET `/api/analytics` — seeded analytics JSON (or backed by MongoDB if configured)
- POST `/api/auth/login` — login (issues JWT cookie)
- GET `/api/realtime` — SSE for simulated KPIs

Production deployment (Vercel)
1. Create a GitHub repository and push your code (do not commit secret files like `.env.local`).
2. On Vercel, create a new project and link the GitHub repo.
3. Add the following Environment Variables in the Vercel project settings (Preview + Production):
   - `MONGODB_URI` — your MongoDB connection string (if using DB)
   - `JWT_SECRET` — long random secret (>= 32 chars)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — optional (used for seeding / fallback login)

Vercel will run `npm run build` and deploy the site automatically after push.

CI / tests
- A basic GitHub Actions workflow is included to run install and build on push / PR: `.github/workflows/ci.yml`.

Security checklist (recommended before production)
- Rotate DB credentials if they were exposed.
- Store secrets in Vercel environment variables (or other secrets manager), do not commit them.
- Use HTTPS and set `secure: true` on cookies in production.
- Enforce `NODE_ENV=production` during build/deploy and enable stricter DB connection behavior in production.

Troubleshooting & notes
- If you see serialization errors from Next.js when using `getServerSideProps`, it's usually caused by returning MongoDB `ObjectId` or `undefined` from props; the project includes sanitization logic to return plain JSON-serializable values.
- If the app cannot reach MongoDB during dev, the project falls back to seeded data so you can still run the UI.

If you'd like, I can now create the GitHub repository under your provided URL and push the commit. After that I'll share the exact Vercel steps I used.
