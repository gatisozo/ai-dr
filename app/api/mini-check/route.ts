import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { lookup } from "dns/promises";
import net from "net";

// --- Runtime: Node (SSRF + dns) ---
export const runtime = "nodejs";

// ================================
// Rate limiting (simple in-memory)
// ================================
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 30; // per hour (mini-check var būt biežāks)
const HOUR_IN_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + HOUR_IN_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS) return false;
  record.count++;
  return true;
}

// ================================
// SSRF guard helpers
// ================================
function isPrivateIPv4(ip: string) {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function isLocalhostHost(hostname: string) {
  const h = hostname.toLowerCase();
  return h === "localhost" || h.endsWith(".localhost");
}

async function assertUrlIsSafe(inputUrl: string) {
  let url: URL;
  try {
    url = new URL(inputUrl);
  } catch {
    throw new Error("Nederīgs URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Atļauti tikai http/https URL");
  }

  if (isLocalhostHost(url.hostname)) {
    throw new Error("URL nav atļauts (localhost)");
  }

  // Ja hostname ir IP - pārbaudām uzreiz
  const ipType = net.isIP(url.hostname);
  if (ipType === 4) {
    if (isPrivateIPv4(url.hostname)) throw new Error("URL nav atļauts (privāts IP)");
    return url;
  }
  if (ipType === 6) {
    // Vienkāršoti: aizliedzam IPv6 literal, lai neapietu filtrus (vari uzlabot vēlāk)
    throw new Error("IPv6 URL pagaidām nav atļauts");
  }

  // DNS lookup (A record)
  const res = await lookup(url.hostname, { family: 4 });
  if (isPrivateIPv4(res.address)) throw new Error("URL nav atļauts (privāts IP caur DNS)");

  return url;
}

// ================================
// Fetch HTML with timeout + redirects
// ================================
async function fetchHtmlWithLimits(url: URL) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  // limit redirects manually (fetch follows by default; we use "manual")
  let currentUrl = url.toString();
  let redirects = 0;

  try {
    while (true) {
      const res = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; LuceraMiniCheck/1.0; +https://ai.lucera.site)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      // Handle redirects
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        redirects++;
        if (redirects > 4) throw new Error("Pārāk daudz redirectu");

        const location = res.headers.get("location")!;
        const nextUrl = new URL(location, currentUrl);

        // SSRF check redirect target too
        await assertUrlIsSafe(nextUrl.toString());
        currentUrl = nextUrl.toString();
        continue;
      }

      if (!res.ok) {
        throw new Error(`Neizdevās ielādēt lapu (HTTP ${res.status})`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        throw new Error("URL neatgriež HTML lapu");
      }

      // Size cap (1.5MB)
      const text = await res.text();
      if (text.length > 1_500_000) {
        throw new Error("Lapa ir pārāk liela mini-check veikšanai");
      }

      return {
        finalUrl: currentUrl,
        html: text,
        ms: Date.now() - started,
      };
    }
  } finally {
    clearTimeout(timeout);
  }
}

// ================================
// Extract deterministic signals
// ================================
function extractSignals(html: string) {
  const $ = cheerio.load(html);

  const title = ($("title").first().text() || "").trim();
  const metaDesc = ($('meta[name="description"]').attr("content") || "").trim();
  const h1 = ($("h1").first().text() || "").trim();

  const robots = ($('meta[name="robots"]').attr("content") || "").toLowerCase();
  const noindex = robots.includes("noindex");

  // JSON-LD types
  const schemaTypes = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();
    try {
      const json = JSON.parse(raw);
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        const t = item?.["@type"];
        if (typeof t === "string") schemaTypes.add(t);
        if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && schemaTypes.add(x));
      }
    } catch {
      // ignore invalid json-ld
    }
  });

  // --- AI / Medical schema helpers ---
  const hasMedicalSchema = Array.from(schemaTypes).some((t) =>
    ["MedicalClinic", "MedicalOrganization", "Physician", "MedicalProcedure", "MedicalService"].includes(t)
  );

  const hasMedicalClinic =
    schemaTypes.has("MedicalClinic") || schemaTypes.has("MedicalOrganization");

  const hasPhysician = schemaTypes.has("Physician");
  const hasFAQ = schemaTypes.has("FAQPage");

  // Text amount (rough)
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const textLen = bodyText.length;

  // Basic contact detection
  const phoneMatch = html.match(/(\+?\d[\d\s().-]{7,}\d)/);
  const emailMatch = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return {
    title,
    metaDesc,
    h1,
    noindex,

    schemaTypes: Array.from(schemaTypes),
    hasMedicalSchema,
    hasMedicalClinic,
    hasPhysician,
    hasFAQ,

    textLen,
    hasPhone: !!phoneMatch,
    hasEmail: !!emailMatch,
  };
}

// ================================
// Score + checks (SEO hygiene; backward compatible)
// ================================
function buildChecks(sig: ReturnType<typeof extractSignals>) {
  const checks: Array<{ key: string; label: string; status: "ok" | "warn" | "bad"; detail: string }> = [];

  // Title
  checks.push({
    key: "title",
    label: "Title (lapas nosaukums)",
    status: sig.title ? (sig.title.length < 18 ? "warn" : "ok") : "bad",
    detail: sig.title ? `Atrasts (${sig.title.length} rakstz.)` : "Nav atrasts",
  });

  // Meta description
  checks.push({
    key: "meta",
    label: "Meta description",
    status: sig.metaDesc ? (sig.metaDesc.length < 50 ? "warn" : "ok") : "warn",
    detail: sig.metaDesc ? `Atrasts (${sig.metaDesc.length} rakstz.)` : "Nav atrasts",
  });

  // H1
  const h1Bad = !sig.h1;
  const h1Generic = !!sig.h1 && /sākumlapa|home|welcome/i.test(sig.h1);
  checks.push({
    key: "h1",
    label: "H1 virsraksts",
    status: h1Bad ? "bad" : h1Generic ? "warn" : "ok",
    detail: sig.h1 ? `"${sig.h1.slice(0, 80)}"${sig.h1.length > 80 ? "…" : ""}` : "Nav atrasts",
  });

  // Indexing
  checks.push({
    key: "indexing",
    label: "Indexējamība",
    status: sig.noindex ? "bad" : "ok",
    detail: sig.noindex ? "noindex atrasts (AI/SEO redzamība būs vājāka)" : "OK (noindex nav atrasts)",
  });

  // Schema
  const hasUsefulSchema = sig.schemaTypes.some((t) =>
    ["MedicalClinic", "Physician", "Organization", "LocalBusiness", "Service"].includes(t)
  );
  checks.push({
    key: "schema",
    label: "Strukturētie dati (Schema.org)",
    status: sig.schemaTypes.length === 0 ? "bad" : hasUsefulSchema ? "ok" : "warn",
    detail:
      sig.schemaTypes.length === 0
        ? "Nav atrasts JSON-LD"
        : `Atrasti tipi: ${sig.schemaTypes.slice(0, 6).join(", ")}${sig.schemaTypes.length > 6 ? "…" : ""}`,
  });

  // Contacts
  checks.push({
    key: "contacts",
    label: "Kontaktu signāli lapā",
    status: sig.hasPhone || sig.hasEmail ? "ok" : "warn",
    detail: sig.hasPhone || sig.hasEmail
      ? `Tālrunis: ${sig.hasPhone ? "jā" : "nē"}, e-pasts: ${sig.hasEmail ? "jā" : "nē"}`
      : "Nav atrasts tālrunis/e-pasts (heuristika)",
  });

  // Content amount
  checks.push({
    key: "content",
    label: "Satura apjoms (heuristika)",
    status: sig.textLen > 2000 ? "ok" : sig.textLen > 600 ? "warn" : "bad",
    detail: `~${sig.textLen} rakstz. teksta`,
  });

  // Score (simple)
  let score = 0;
  for (const c of checks) {
    score += c.status === "ok" ? 15 : c.status === "warn" ? 8 : 2;
  }
  score = Math.min(100, score);

  return { score, checks };
}

// ================================
// AI Recommendability score (new)
// ================================
function buildScores(sig: ReturnType<typeof extractSignals>) {
  // ---- Pillars ----
  let access = 100;
  if (sig.noindex) access -= 60;
  if (sig.textLen < 600) access -= 20;

  let entitySchema = 100;
  if (!sig.schemaTypes.length) entitySchema -= 60;
  if (!sig.hasMedicalSchema) entitySchema -= 50;
  if (!sig.hasMedicalClinic) entitySchema -= 30;
  if (!sig.hasPhysician) entitySchema -= 20;

  let trustSignals = 100;
  if (!sig.hasPhone && !sig.hasEmail) trustSignals -= 30;
  if (!sig.hasMedicalClinic) trustSignals -= 30;

  let answerability = 100;
  if (!sig.hasFAQ) answerability -= 20;
  if (sig.textLen < 1200) answerability -= 30;

  // Clamp
  access = Math.max(0, access);
  entitySchema = Math.max(0, entitySchema);
  trustSignals = Math.max(0, trustSignals);
  answerability = Math.max(0, answerability);

  // Weighted AI score
  let aiScore =
    access * 0.2 +
    entitySchema * 0.35 +
    trustSignals * 0.25 +
    answerability * 0.2;

  // ---- SCORE CAPS (critical) ----
  let cap: number | null = null;
  const capReasons: string[] = [];

  if (!sig.hasMedicalSchema) {
    cap = 75;
    capReasons.push(
      "Nav medicīnisko Schema.org entītiju (MedicalClinic / Physician / MedicalService)"
    );
  }

  if (cap !== null) {
    aiScore = Math.min(aiScore, cap);
  }

  return {
    aiScore: Math.round(aiScore),
    pillars: {
      access: Math.round(access),
      entitySchema: Math.round(entitySchema),
      trustSignals: Math.round(trustSignals),
      answerability: Math.round(answerability),
    },
    cap,
    capReasons,
  };
}

// ================================
// Optional: LLM interpretation (OpenAI)
// ================================
async function llmInterpretation(input: {
  url: string;
  finalUrl: string;
  score: number;
  checks: ReturnType<typeof buildChecks>["checks"];
}) {
  // Ja nav OpenAI key, atgriežam null (nekritiskā daļa)
  if (!process.env.OPENAI_API_KEY) return null;

  const prompt = {
    role: "user",
    content:
      `Tu esi CRO/AI redzamības auditors medicīnas klīnikām. ` +
      `Tev ir mini-check fakti no 1 lapas. ` +
      `NEDRĪKST izdomāt faktus, kas nav ievaddatos. Ja nepietiek datu, saki "nav atrasts". ` +
      `Atbildi LATVISKI, īsi un konkrēti.\n\n` +
      `URL: ${input.url}\nFinal URL: ${input.finalUrl}\nScore: ${input.score}\n\n` +
      `CHECKS:\n` +
      input.checks.map(c => `- ${c.label}: ${c.status.toUpperCase()} (${c.detail})`).join("\n") +
      `\n\n` +
      `Atgriez TIKAI derīgu JSON ar šiem laukiem:\n` +
      `{\n` +
      `  "summary": "1 teikums: ko AI, visticamāk, sapratīs par šo lapu",\n` +
      `  "top_risks": ["3 īsi punkti"],\n` +
      `  "quick_wins": ["3 īsi punkti"],\n` +
      `  "confidence": "low|medium|high"\n` +
      `}\n`,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Atbildi tikai ar JSON. Neizmanto Markdown." },
        prompt,
      ],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ================================
// Route
// ================================
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Pārāk daudz pieprasījumu. Lūdzu, mēģiniet vēlāk." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url ir obligāts" }, { status: 400 });
    }

    const safeUrl = await assertUrlIsSafe(url);
    const fetched = await fetchHtmlWithLimits(safeUrl);

    const signals = extractSignals(fetched.html);

    // Vecais (SEO hygiene) score + checks
    const { score: seoScore, checks } = buildChecks(signals);

    // Jaunais AI score
    const aiScoring = buildScores(signals);

    const interpretation = await llmInterpretation({
      url,
      finalUrl: fetched.finalUrl,
      score: aiScoring.aiScore, // interpretējam AI recommendability
      checks,
    });

    return NextResponse.json({
      success: true,
      inputUrl: url,
      finalUrl: fetched.finalUrl,

      // Backward compatibility (ko UI jau rāda)
      score: seoScore,

      // Jaunie AI score dati (ja UI gribēs)
      scores: {
        seoHygiene: seoScore,
        aiRecommendability: aiScoring.aiScore,
        pillars: aiScoring.pillars,
        cap: aiScoring.cap,
        capReasons: aiScoring.capReasons,
      },

      checks,
      interpretation,
      timingsMs: {
        fetch: fetched.ms,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Kļūda apstrādājot mini-check",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Mini Check API is running",
    llm: !!process.env.OPENAI_API_KEY,
  });
}
