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
- `http://localhost:3000/hello-forum`
- `http://localhost:3000/auth/login`
- `http://localhost:3000/auth/signup`
- `http://localhost:3000/auth/reset`
- `http://localhost:3000/protected`

## Verification Commands

```bash
npm run lint
npm run build
```

## Manual Auth Verification

1. Open `/auth/signup` and create an account.
2. Open `/auth/login` and sign in.
3. Open `/hello-forum`:
   - Logged in: page shows signed-in email.
   - Logged out: page shows guest message.
4. Open `/protected` while logged out and confirm redirect to `/auth/login`.
5. Open `/auth/reset`, request a password reset, use the email link, and set a new password.
