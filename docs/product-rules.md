# Product Rules

Rules for making safe changes to this codebase. Intended for developers and AI agents.

---

## Core product — do not change casually

These components define the product's value and accuracy. Changes require explicit approval.

### Scoring logic (`app/api/mini-check/route.ts`)
- `buildChecks()` — 7 SEO hygiene checks and their ok/warn/bad thresholds
- `buildScores()` — AI recommendability pillars and weights (access 20%, entitySchema 35%, trustSignals 25%, answerability 20%)
- Score cap of 75 when no medical Schema.org types detected — this is intentional product behavior
- Do not adjust score weights, pillar definitions, or cap thresholds without sign-off

### AI model configuration (`lib/aiService.ts`)
- `gpt-3.5-turbo` for ai-check ChatGPT calls
- `gpt-4.1-mini` for mini-check LLM interpretation
- `claude-sonnet-4-20250514` for ai-check Claude calls
- System prompts are in Latvian and framed as "medicīnas eksperts Latvijā" — changing them changes what the product tests
- `extractClinicNames()` known clinic list is a hardcoded product decision

### Specialty queries (`lib/aiQueries.ts`)
- 15 medical specialties with sample questions in Latvian
- These represent the product's audit coverage — do not remove specialties

---

## Security constraints — never relax

### SSRF guard (`app/api/mini-check/route.ts`)
- `assertUrlIsSafe()` validates protocol, blocks localhost, blocks private IPv4, blocks IPv6 literals, re-validates redirect targets
- Do not bypass or weaken this check
- Do not change to edge runtime (requires Node.js `dns/promises` and `net`)

### Rate limiting
- mini-check: 30 requests/hr per IP
- ai-check: 10 requests/hr per IP
- Rate limits are in-memory (reset on restart); acceptable for current scale
- Do not remove rate limiting from any API route

### Environment variables
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY` are server-only
- Never reference these in client components or prefix them with `NEXT_PUBLIC_`
- `NEXT_PUBLIC_GA_ID` is the only intentionally public variable

---

## Email / lead handling

- Lead emails go to `go@lucera.site` — do not change recipient without explicit approval
- Sender domain `reports@lucera.site` must remain a verified domain in Resend
- Do not add CC/BCC to lead emails without approval
- Do not store lead data in a database or third-party service without privacy review

---

## UX and content rules

- All user-facing text is in Latvian (`lang="lv"` set in layout) — do not translate to another language without approval
- Do not change the canonical URL (`https://ai-dr.lucera.site/`) or OG metadata without approval
- Cookie consent (GDPR) behavior in `CookieBanner` must not be weakened — consent must be explicit before GA loads
- Do not add new tracking scripts without GDPR review

---

## Introducing new dependencies

Before adding a new npm package:
1. Check it is actively maintained
2. Prefer packages already in the ecosystem (Tailwind, Framer Motion, Lucide)
3. Server-only packages (e.g., for API routes) should not accidentally bundle client-side
4. Avoid packages that call home or collect telemetry

---

## Production-impacting changes

Any change to the following requires explicit human approval and a successful `npm run build`
before merging to `main`:

- API route behavior (inputs, outputs, error codes)
- AI model IDs or prompts
- Rate limits
- SSRF guard logic
- Score weights or thresholds
- Resend email routing
- Next.js config (`next.config.ts`)
- Vercel environment variable setup

---

## Low-risk changes (can proceed without approval)

- Docs updates (`README.md`, `docs/`)
- Visual/animation tweaks in components (colors, spacing, Framer Motion variants)
- Adding new icons from `lucide-react`
- Non-scoring copy changes in `app/page.tsx` (keeping Latvian)
- `eslint.config.mjs` rule adjustments (not disabling security rules)
