# Lucera — AI-DR

AI visibility audit tool for medical professionals in Latvia.

Doctors can check how well their website is understood and recommended by AI assistants
(ChatGPT and Claude) relative to other clinics in their specialty.

**Production:** https://ai-dr.lucera.site

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| AI — OpenAI | `gpt-3.5-turbo` (ai-check), `gpt-4.1-mini` (mini-check LLM interpretation) |
| AI — Anthropic | `claude-sonnet-4-20250514` (ai-check) |
| Email | Resend |
| HTML parsing | Cheerio |
| Deployment | Vercel |

---

## Local development

```bash
npm install
```

Create `.env.local` at the repo root (see `.env.example` for required variable names).

```bash
npm run dev
```

App runs at http://localhost:3000.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key (mini-check LLM + ai-check) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key (ai-check) |
| `RESEND_API_KEY` | Yes | Resend email service (lead/form/session routes) |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics ID; GA is skipped if absent |
| `MAX_REQUESTS_PER_HOUR` | No | Present in .env.local; rate limits are currently hardcoded |

Copy `.env.example` to `.env.local` and fill in values. Never commit `.env.local`.

---

## Scripts

```bash
npm run dev      # development server with hot reload
npm run build    # production build
npm start        # serve production build locally
npm run lint     # ESLint check
```

No test suite is configured.

---

## Folder overview

```
app/
  api/
    mini-check/     # POST: website SEO + AI recommendability audit
    ai-check/       # POST: live ChatGPT vs Claude comparison
    lead/           # POST: lead capture → email via Resend
    form/           # POST: secondary form handler
    session-summary/# POST: session analytics
  components/       # Shared UI components
  privacy/          # Privacy policy page
  terms/            # Terms page
  layout.tsx        # Root layout (GA, cookies, metadata)
  page.tsx          # Main landing page
lib/
  aiService.ts      # OpenAI + Anthropic API wrappers
  aiQueries.ts      # Medical specialty query templates
  session.ts        # Session/consent tracking
public/
  brand/            # Lucera brand assets
```

---

## Deployment

Pushes to `main` trigger automatic Vercel deployment to production.
No `vercel.json` is present — all configuration is in the Vercel dashboard.

Set all required environment variables in Vercel → Project Settings → Environment Variables
for Production, Preview, and Development environments separately.

See `docs/deploy.md` for full deployment checklist.

---

## Contributing

- Run `npm run lint` and `npm run build` before opening a PR
- All user-facing text is in Latvian — keep it consistent
- Do not change AI model IDs, scoring weights, or rate limits without explicit sign-off
- See `docs/product-rules.md` for what requires approval before changing
