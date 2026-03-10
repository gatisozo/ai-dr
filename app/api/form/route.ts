import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { email, url } = await req.json();

  await resend.emails.send({
    from: "Lucera Dr. test <reports@lucera.site>", // šis būs jāpārbauda Resendā kā verified sender
    to: ["go@lucera.site"],
    replyTo: email,
    subject: "Jauns bezmaksas audita pieteikums",
    text: `Jauns pieteikums:\n\nE-pasts: ${email}\nURL: ${url}`,
  });

  return NextResponse.json({ ok: true });
}
