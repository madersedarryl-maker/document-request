# IBACMI Registrar Portal deployment checklist

## 1. Configure the runtime

Copy `.env.example` to the environment file used by your host and set:

```env
VITE_APP_MODE=production
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Never set `VITE_APP_MODE=demo` on a public deployment. Demo data is stored in
the browser and is intentionally available only when explicitly enabled.

## 2. Prepare Supabase

Run the migrations in `supabase/migrations` in filename order, including
`07_workflow_guards.sql`. Configure the Edge Function secrets documented in
`.env.example`, and keep the `request-attachments` bucket private.

## 3. Verify locally

```bash
npm install
npm run lint
npm test
npm run build
```

The production build must have valid Supabase environment variables. A missing
database configuration now fails request/auth operations instead of silently
creating demo records.

## 4. Host the static build

Publish the generated `dist` directory to a static host. Configure SPA
rewrites so every application route serves `index.html` (for example, Vercel's
`/{*path}` rewrite or Netlify's `/* /index.html 200`). Enable HTTPS and add
the deployed origin to Supabase Auth URL and redirect URL settings.
