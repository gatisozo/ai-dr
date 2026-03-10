# Architecture

## High-level structure

Single-page Next.js application (App Router) with API routes handling all server-side logic.
No database. No auth layer. State is ephemeral (in-memory rate limiting, client-side session).

```
Browser
  └── app/page.tsx (main SPA-like landing page)
        ├── POST /api/mini-check   → Cheerio HTML parse + optional OpenAI interpretation
        ├── POST /api/ai-check     → Parallel OpenAI + Anthropic calls
        └── POST /api/lead         → Resend email notification
```

---

## Runtime environments

| Route | Runtime | Reason |
|-------|---------|--------|
| `mini-check` | `nodejs` | Requires `dns/promises` and `net` for SSRF guard |
| `ai-check` | default (Node) | External fetch to AI APIs |
| `lead` | default (Node) | Resend SDK |
| `form` | default (Node) | Resend SDK |
| `session-summary` | default (Node) | Optional Resend + LLM call |

---

## API routes

### `POST /api/mini-check`
1. Rate-limit check (30 req/hr per IP, in-memory `Map`)
2. URL validation: protocol check → localhost block → IP/DNS SSRF guard
3. Fetch target HTML: 12 s timeout, max 4 redirects, 1.5 MB cap, each redirect re-validated
4. Extract signals with Cheerio: title, meta description, H1, robots, JSON-LD schema types, phone/email presence, body text length
5. Compute two scores:
   - **SEO hygiene score** (0–100): weighted sum of 7 checks
   - **AI recommendability score** (0–100): four pillars (access 20%, entitySchema 35%, trustSignals 25%, answerability 20%); capped at 75 if no medical Schema.org types found
6. Optional LLM interpretation via `gpt-4.1-mini` (skipped if `OPENAI_API_KEY` absent)
7. Return full JSON with scores, checks array, interpretation, and timing

### `POST /api/ai-check`
1. Rate-limit check (10 req/hr per IP, in-memory `Map`)
2. Accepts `{ query, specialty }` body
3. Fires `checkWithChatGPT` and `checkWithClaude` in parallel (`Promise.all`)
4. Each call returns: provider, success, clinics (extracted), fullResponse
5. Clinic extraction: known Latvian clinic name list + regex fallback; max 5 results
6. Returns combined result for both providers

### `POST /api/lead`
Validates `website` + `email` fields, then sends a plain-text email via Resend:
- From: `reports@lucera.site`
- To: `go@lucera.site`
- Reply-to: submitter's email

### `POST /api/form`
Similar email dispatch via Resend for a secondary contact form.

### `POST /api/session-summary`
Accepts session event data; sends summary email via Resend with optional LLM interpretation.

---

## Key libraries

| Library | Usage |
|---------|-------|
| `cheerio` | Server-side HTML parsing in mini-check |
| `framer-motion` | Page animations |
| `lucide-react` | Icons |
| `resend` | Transactional email (lead/form/session) |
| `next/font` | Geist Sans + Geist Mono (Google Fonts) |

---

## Client-side modules

| Component | Purpose |
|-----------|---------|
| `CookieBanner` | GDPR consent UI; sets localStorage consent flag |
| `GASnippet` | Loads GA4 conditionally on consent; uses `NEXT_PUBLIC_GA_ID` |
| `AIVisibilityCards` | Displays AI check results |
| `AICostComparison` | Cost comparison UI section |

Session tracking (lib/session.ts): 6-hour cookie, localStorage events, tracks page_view / mini_check / ai_check / lead_submit.

---

## Data flow — mini-check

```
User submits URL
  → POST /api/mini-check
    → SSRF guard (DNS lookup)
    → fetch(url) with redirect following + size cap
    → cheerio.load(html)
    → extractSignals()
    → buildChecks() → seoScore
    → buildScores() → aiScore + pillars
    → (optional) llmInterpretation() → gpt-4.1-mini
  ← JSON response with scores + checks + interpretation
```

---

## Data flow — AI check

```
User selects specialty + triggers check
  → POST /api/ai-check
    → lib/aiService.ts
      → fetch(openai) + fetch(anthropic) in parallel
      → extractClinicNames() for each response
  ← { chatgpt: { clinics, fullResponse }, claude: { clinics, fullResponse } }
```

---

## External integrations

| Service | Keys | Used in |
|---------|------|---------|
| OpenAI API | `OPENAI_API_KEY` | ai-check (gpt-3.5-turbo), mini-check LLM (gpt-4.1-mini) |
| Anthropic API | `ANTHROPIC_API_KEY` | ai-check (claude-sonnet-4-20250514) |
| Resend | `RESEND_API_KEY` | lead, form, session-summary routes |
| Google Analytics | `NEXT_PUBLIC_GA_ID` | Client-side, consent-gated |

---

## Build and deploy

- `npm run build` → Next.js static + server bundle
- Deployed to Vercel; `main` branch = production
- No `vercel.json` — settings managed in Vercel dashboard
- No database, no migrations, no build-time env fetching
