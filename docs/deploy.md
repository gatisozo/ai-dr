# Deployment

## Local development

```bash
npm install
# create .env.local from .env.example and fill in values
npm run dev
```

App runs at http://localhost:3000. Hot reload enabled.

All API routes run in Node.js runtime locally. Rate limits reset on server restart.

---

## Pre-deploy checklist

```bash
npm run lint        # must pass with no errors
npm run build       # must complete without errors
```

Verify in build output:
- No `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `RESEND_API_KEY` appears in client bundles
- `NEXT_PUBLIC_GA_ID` is the only public env var (if used)
- Route sizes are reasonable (no accidental large bundle)

---

## Production deployment (Vercel)

**Trigger:** push to `main` branch → automatic Vercel deploy

No manual deploy step is required. Vercel detects Next.js automatically.

**No `vercel.json` is present.** All project settings are in the Vercel dashboard:
- Framework preset: Next.js
- Build command: `next build` (Vercel default)
- Output directory: `.next` (Vercel default)
- Node.js version: confirm in Vercel dashboard (not confirmed from repo)

---

## Environment variables on Vercel

Set these in **Vercel → Project → Settings → Environment Variables** for each target environment.

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `OPENAI_API_KEY` | required | required | required |
| `ANTHROPIC_API_KEY` | required | required | required |
| `RESEND_API_KEY` | required | required | required |
| `NEXT_PUBLIC_GA_ID` | recommended | optional | optional |
| `MAX_REQUESTS_PER_HOUR` | not confirmed used | — | — |

`NEXT_PUBLIC_*` variables are baked into the client bundle at build time. If you change
`NEXT_PUBLIC_GA_ID` in Vercel after a deploy, you must redeploy to take effect.

---

## Preview deployments

Vercel creates a preview URL for every PR / non-main branch push automatically.

- Preview URLs are publicly accessible by default
- They use whichever env vars are set for the "Preview" environment in Vercel
- Rate limits are in-memory and isolated per serverless instance

---

## Resend sender domain

The `lead` and `form` routes send email from `reports@lucera.site`.
This domain **must be verified** in Resend before any email will deliver.

If deploying to a new Resend account or project:
1. Add and verify `lucera.site` in Resend dashboard
2. Configure DNS records as instructed by Resend
3. Test lead submission before going live

---

## Post-deploy verification

After each production deploy:

1. Load https://ai-dr.lucera.site — page renders correctly
2. Submit a test URL to mini-check — returns score and checks
3. Trigger an AI check — both ChatGPT and Claude respond (or fail gracefully)
4. Submit a test lead form — email arrives at go@lucera.site
5. Check Vercel function logs for any errors

---

## Rollback

To roll back a bad deploy:
- In Vercel dashboard → Deployments → select a previous successful deployment → Promote to Production

No database migrations exist, so rollback is safe.

---

## Notes not confirmed from repo

- Vercel team/org name and project slug are not in the repo
- Node.js version is not pinned (no `.nvmrc`, no `engines` in package.json)
- `MAX_REQUESTS_PER_HOUR` env var is in `.env.local` but code uses hardcoded values — unclear if it is actively read
- No staging environment is configured (inferred; not confirmed)
- No custom domain setup details in repo (managed entirely in Vercel/DNS provider)
