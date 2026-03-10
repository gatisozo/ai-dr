# CLAUDE.md — Lucera AI-DR

## Project overview

Lucera AI-DR is a Next.js app that audits medical professionals' online AI visibility.
It runs two core checks (SEO/AI mini-check and a live ChatGPT vs Claude comparison) and
collects audit-request leads via email. Primary market: Latvia. UI language: Latvian.

Production URL: `https://ai-dr.lucera.site`
GitHub: `https://github.com/gatisozo/ai-dr`

---

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Requires `.env.local` at root with all variables listed in `.env.example`.

## Build

```bash
npm run build
npm start          # serves production build locally
```

## Lint

```bash
npm run lint
```

## Tests

**No tests exist in this repo.** Do not add test tooling without explicit approval.

---

## Important folders

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Main landing page (large — ~106 KB) |
| `app/layout.tsx` | Root layout: GA snippet, cookie banner, metadata |
| `app/api/mini-check/route.ts` | Website SEO + AI recommendability audit |
| `app/api/ai-check/route.ts` | Live ChatGPT vs Claude comparison |
| `app/api/lead/route.ts` | Lead capture → Resend email to go@lucera.site |
| `app/api/form/route.ts` | Secondary form submission handler |
| `app/api/session-summary/route.ts` | Session analytics aggregation |
| `app/components/` | Shared UI components |
| `lib/aiService.ts` | OpenAI + Anthropic API wrappers |
| `lib/aiQueries.ts` | Medical specialty query templates (15 specialties) |
| `lib/session.ts` | Session and consent tracking utilities |
| `public/brand/` | Lucera brand assets |

---

## Critical files — do not change without explicit approval

- `app/api/mini-check/route.ts` — scoring logic, SSRF guard, rate limiting
- `app/api/ai-check/route.ts` — live AI comparison logic
- `lib/aiService.ts` — AI model IDs and prompts (Latvian medical context)
- `lib/aiQueries.ts` — specialty query templates used in AI checks
- `app/layout.tsx` — metadata, canonical URL, OG tags
- `next.config.ts` — currently minimal; changes affect build/deploy

---

## Environment variables

All secrets live in `.env.local` (never committed). See `.env.example` for required names.

Required for core functionality:
- `OPENAI_API_KEY` — used in mini-check (LLM interpretation) and ai-check
- `ANTHROPIC_API_KEY` — used in ai-check
- `RESEND_API_KEY` — used in lead, form, and session-summary routes

Optional:
- `NEXT_PUBLIC_GA_ID` — Google Analytics; if absent, GA is simply not loaded
- `MAX_REQUESTS_PER_HOUR` — present in .env.local but rate limits are currently hardcoded (30/hr mini-check, 10/hr ai-check); verify before relying on this var

**Never expose `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `RESEND_API_KEY` client-side.**

---

## What must not be changed without explicit approval

1. **AI model IDs** in `lib/aiService.ts` (`gpt-3.5-turbo`, `gpt-4.1-mini`, `claude-sonnet-4-20250514`)
2. **Scoring algorithm** in `mini-check/route.ts` (score weights, caps, pillar definitions)
3. **SSRF guard** logic in `mini-check/route.ts`
4. **Lead email recipient** (`go@lucera.site`) in `lead/route.ts`
5. **Resend sender domain** (`reports@lucera.site`) — must match verified Resend domain
6. **Canonical URL** and OG metadata in `app/layout.tsx`
7. **Rate limits** — any change affects production capacity and abuse surface
8. **UI language** — all user-facing text is in Latvian; do not translate without approval

---

## Commit and branch hygiene

- Work on feature branches; merge to `main` only when ready to deploy
- Default branch is `main` and deploys to production on Vercel
- Commit messages: imperative mood, short summary line (≤72 chars)
- Do not commit `.env.local`, `.next/`, `node_modules/`, or any secrets
- Run `npm run lint` and `npm run build` before committing

---

## Before commit checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds locally
- [ ] No secrets added to tracked files
- [ ] No `console.log` left in production paths (API routes)
- [ ] AI model IDs unchanged unless explicitly approved
- [ ] Rate limits unchanged unless explicitly approved

---

## Vercel deployment notes

- Deployment is triggered automatically on push to `main`
- No `vercel.json` in repo — all settings are managed in Vercel dashboard
- All env vars (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_GA_ID`) must be set in Vercel project settings for each environment
- `NEXT_PUBLIC_*` vars are baked into the client bundle at build time — add new public vars intentionally
- The mini-check route uses `runtime = "nodejs"` (required for DNS/SSRF checks) — do not change to edge runtime

---

## Rules for editing docs vs code

- Docs (`README.md`, `docs/`) can be edited freely as long as they remain accurate
- Code changes to API routes, scoring logic, or AI prompts require review
- UI copy changes in `app/page.tsx` are low-risk but keep the Latvian language
