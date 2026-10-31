# Grocery Portal

Demo online grocery store: React 18 + Vite, Express 5, Neon Postgres, Better Auth. One Node process serves `/api` and the UI on one port. No real payments.

## Run

```bash
cp .env.example .env     # set DATABASE_URL (Neon) and BETTER_AUTH_SECRET (openssl rand -base64 32)
npm install
npm run db:setup         # tables + seed products (idempotent)
npm run dev              # http://localhost:3000  (PORT=3100 to change)
```

`npm run build` then `npm start` for production. Needs Node 22+.

## Features

Browse and search groceries by category, basket, checkout with delivery details (free delivery over $35), sign-up/sign-in, order history with cancel (restocks), and a public order lookup by code + email.

See `CLAUDE.md` for architecture notes and known gaps.
