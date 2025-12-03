# Investor Match UI — Deployment Commands

## Vercel (production)
- Connected GitHub repo auto-deploys on push (Vercel defaults).
- Build command: `npm run build`
- Install command: `npm install`
- Output: Vercel serves `dist/`
- Required env vars (set in Vercel Project Settings → Environment Variables):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_SERVICE_ROLE_KEY`

## Local development
```bash
npm install
npm run dev           # start Vite dev server
npm run build         # type-check + bundle
npm run preview       # serve built assets locally
```

## Notes
- API base URL is fixed in `src/api/axios.config.ts`: `https://investor-match-api-23715448976.us-east1.run.app/v1`.
- No GitHub Actions present; rely on Vercel for CI/CD.  
