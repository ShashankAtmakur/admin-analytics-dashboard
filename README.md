# Admin Analytics Dashboard (Next.js + TypeScript)

This is a demo Admin Analytics Dashboard built with Next.js (TypeScript), TailwindCSS and Recharts. It uses Next.js API routes to serve analytics data from an in-memory seed dataset. Optionally you can configure a MongoDB instance via `MONGODB_URI`.

Features
- User demographics by country (pie)
- CV analysis trends (line)
- Paid vs Free (donut)
- Leaderboard for top CV scorers
- KPI cards
- Simple admin auth (demo credentials)

Demo credentials
- Email: admin@example.com
- Password: Password123

Setup
1. Install dependencies:

```pwsh
cd d:\AariyaTech\project
npm install
```

2. Seed the database (optional — only if you have a MongoDB URI):

```pwsh
$env:MONGODB_URI = 'your-mongodb-uri'
$env:ADMIN_EMAIL = 'admin@example.com'
$env:ADMIN_PASSWORD = 'Password123'
npm run seed
```

3. Run dev server:

```pwsh
npm run dev
```

4. Open http://localhost:3000 and login with demo credentials (or the admin you created when seeding).

Deployment to Vercel
- Create a GitHub repository and push the project (don't commit your .env files).
- On Vercel, create a new project and point it to the GitHub repo. Set the following Environment Variables in the Vercel dashboard:
	- MONGODB_URI
	- JWT_SECRET
	- ADMIN_EMAIL (optional)
	- ADMIN_PASSWORD (optional)

Once environment variables are set, Vercel will build and deploy the Next.js app automatically.

Notes
- For a production setup, set a strong `JWT_SECRET` and use a managed MongoDB (Atlas).
- Charts are implemented with Recharts. You can swap to Chart.js or ECharts if preferred.
