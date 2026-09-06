# Marrions Pharmacy POS

A point-of-sale app for Marrions Pharmacy, backed by Supabase (Postgres).

## What changed from the original artifact

The app used to store everything via `window.storage`, which only works
inside the Claude artifact sandbox. It now reads/writes to a real Supabase
Postgres database (`src/db.js` + `src/supabaseClient.js`). The UI and all
business logic are untouched.

Tables: `settings`, `users`, `services`, `items`, `sales`, `expenses`, `restocks`.

**Security note:** Row Level Security is enabled on every table, but the
policies currently allow full read/write to anyone holding the public
("anon") key — the same key that ships in the browser bundle. That's
fine for a trusted internal till, but it means anyone who inspects your
site's network traffic could read or modify the data directly, bypassing
the app's PIN screen. If that's a concern, tighten the RLS policies (e.g.
require a real Supabase Auth session) before relying on this in a public
setting.

## Run locally

```bash
npm install
npm run dev
```

A `.env` file is already included with your Supabase project's URL and
public (anon) key — no changes needed to run locally.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **New Project** → import that repo. Vercel auto-detects Vite.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (copy both from the `.env` file in this project)
4. Deploy.

Build command: `npm run build` · Output directory: `dist` (Vercel fills
these in automatically for Vite).

## Supabase project

- Project: `marrions-pharmacy-pos`
- Dashboard: https://supabase.com/dashboard/project/gdqrvqjxlszfyntrapeo
- Default login PINs (change these in the Users tab once live):
  - Admin — PIN `1234`
  - Cashier — PIN `0000`
