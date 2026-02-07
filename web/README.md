# Forums App (Next.js)

PR2 wires Supabase auth (V0) into the App Router project in `web/`.

## Prerequisites

- Node.js 20+
- A Supabase project with Email auth enabled

## Environment Variables

Set these values locally in `web/.env.local` (do not commit this file):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Set the same two variables in Vercel for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase Auth Redirect URLs

In Supabase Dashboard -> Authentication -> URL Configuration:

- Site URL:
  - `https://forums-app-next-js.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/*`
  - `https://forums-app-next-js.vercel.app/*`
  - `https://*.vercel.app/*` (or your exact preview domain pattern)

## Run Locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/auth/login`
- `http://localhost:3000/protected`

## Verification Commands

```bash
npm run lint
npm run build
```
