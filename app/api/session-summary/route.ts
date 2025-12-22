import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Lai nelūzt edge vidē (Resend parasti vajag Node runtime).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);

function line(label: string, value?: string | null) {
  const v = (value ?? "").toString().trim();
  if (!v) return null;
  return `${label}: ${v}`;
}

/**
 * OPTIONS — ja kādreiz sūtīsi no cita domēna vai būs CORS vajadzīgs.
 * (Tagad, ja esi tajā pašā originā, nekaitē.)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  try {
    // Ja atnāk tukšs body vai nekorekts JSON — nekrītam
    let payload: any = null;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ ok: true, skipped: true, reason: "invalid_json" });
    }

    const sessionId = String(payload?.sessionId || "");
    const identity = payload?.identity || {};
    const events = Array.isArray(payload?.events) ? payload.events : [];
    const humanSummary =
      typeof payload?.humanSummary === "string" ? payload.humanSummary.trim() : "";

    // Nekas nav darāms
    if (!sessionId || (!humanSummary && events.length === 0)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // SUBJECT (cilvēku valodā)
    const subjectParts = [
      "Jauns Lucera audita pieprasījums",
      identity?.email || null,
      identity?.clinic || null,
    ].filter(Boolean);

    const subject = subjectParts.join(" · ");

    // BODY (cilvēku valodā)
    let text: string;

    if (humanSummary) {
      // ✅ Labākais variants: frontend atsūta sakārtotu tekstu
      text = humanSummary;
    } else {
      // ✅ Fallback: uztaisām cilvēciski, bez tech
      const actions = events
        .filter((e: any) =>
          ["mini_check_submit", "ai_check_submit", "ai_check_result", "lead_submit"].includes(e?.type)
        )
        .map((e: any) => {
          if (e.type === "mini_check_submit") {
            const url = (e.url || "").toString().replace(/^https?:\/\//, "").replace(/\/$/, "");
            return `• Veica mini-check (${url || "—"})`;
          }
          if (e.type === "ai_check_submit") {
            return `• Veica AI testu (${e.query || "—"})`;
          }
          if (e.type === "ai_check_result") {
            const c1 = Array.isArray(e.chatgpt_clinics) ? e.chatgpt_clinics.slice(0, 3).join(", ") : "";
            const c2 = Array.isArray(e.claude_clinics) ? e.claude_clinics.slice(0, 3).join(", ") : "";
            return `• AI tests pabeigts. ChatGPT minēja: ${c1 || "—"}. Claude minēja: ${c2 || "—"}.`;
          }
          if (e.type === "lead_submit") {
            return `• Aizpildīja bezmaksas audita formu`;
          }
          return null;
        })
        .filter(Boolean)
        .join("\n");

      text = [
        "Klients pieprasīja bezmaksas AI auditu.",
        "",
        line("Mājaslapa", identity?.website),
        line("E-pasts", identity?.email),
        line("Klīnika", identity?.clinic),
        line("Specialitāte", identity?.specialty),
        "",
        "Ko klients izdarīja lapā:",
        actions || "• (nav detalizētu darbību)",
      ]
        .filter(Boolean)
        .join("\n");
    }

    // SEND EMAIL
    await resend.emails.send({
      from: "Lucera Audit <reports@lucera.site>",
      to: ["go@lucera.site"],
      subject,
      text,
      ...(identity?.email ? { replyTo: String(identity.email) } : {}),
    });

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
