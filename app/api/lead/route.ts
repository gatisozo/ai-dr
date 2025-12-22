import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  console.log('--- /api/lead POST start ---');

  try {
    const body = await req.json();

    const clinic = (body?.clinic || '').toString();
    const website = (body?.website || '').toString();
    const email = (body?.email || '').toString();
    const specialty = (body?.specialty || '').toString();
    const source = (body?.source || 'unknown').toString();

    console.log('LEAD payload', { clinic, website, email, specialty, source });

    if (!website || !email) {
      console.warn('LEAD validation failed: missing website or email');
      return NextResponse.json({ ok: false, error: 'Trūkst website vai email' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('Server config: missing RESEND_API_KEY');
      return NextResponse.json({ ok: false, error: 'Server config: missing RESEND_API_KEY' }, { status: 500 });
    }

    // Sūtām pieteikumu TEV (go@lucera.site)
    const r = await resend.emails.send({
      // NOTE: šis domain jābūt verified Resendā
      from: 'Lucera Audit <reports@lucera.site>',
      to: ['go@lucera.site'],
      replyTo: email,
      subject: 'Jauns bezmaksas audita pieteikums',
      text:
        `Jauns pieteikums (Lucera):\n\n` +
        `Klīnika: ${clinic || '—'}\n` +
        `Mājaslapa: ${website}\n` +
        `Specializācija: ${specialty || '—'}\n` +
        `E-pasts: ${email}\n` +
        `Source: ${source}\n`,
    });

    console.log('RESEND result', r);

    // KRITISKI: Resend var atgriezt error bez exception
    if ((r as any)?.error) {
      console.error('RESEND error (non-throw)', (r as any).error);
      return NextResponse.json(
        { ok: false, error: (r as any).error?.message || 'Resend send failed' },
        { status: 502 }
      );
    }

    console.log('--- /api/lead POST success ---');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('LEAD route exception', e);
    return NextResponse.json({ ok: false, error: 'Servera kļūda' }, { status: 500 });
  }
}
