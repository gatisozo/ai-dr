import { NextRequest, NextResponse } from 'next/server';
import { checkWithChatGPT, checkWithClaude, checkWithBothAI } from '../../../lib/aiService';

// Rate limiting (simple in-memory)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 10; // per hour
const HOUR_IN_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + HOUR_IN_MS,
    });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Pārāk daudz pieprasījumu. Lūdzu, mēģiniet vēlāk.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { query, provider, clinicName } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query ir obligāts' },
        { status: 400 }
      );
    }

    let result;

    // Izvēlas provider
    if (provider === 'chatgpt') {
      result = { chatgpt: await checkWithChatGPT(query) };
    } else if (provider === 'claude') {
      result = { claude: await checkWithClaude(query) };
    } else {
      // Abi (default)
      result = await checkWithBothAI(query);
    }

    // Pārbauda vai lietotāja klīnika ir minēta
    const userClinicFound = {
      chatgpt: false,
      claude: false,
    };

    if (clinicName && result.chatgpt) {
      userClinicFound.chatgpt = 
        result.chatgpt.clinics.some((c: string) => 
          c.toLowerCase().includes(clinicName.toLowerCase())
        ) ||
        result.chatgpt.fullResponse.toLowerCase().includes(clinicName.toLowerCase());
    }

    if (clinicName && result.claude) {
      userClinicFound.claude = 
        result.claude.clinics.some((c: string) => 
          c.toLowerCase().includes(clinicName.toLowerCase())
        ) ||
        result.claude.fullResponse.toLowerCase().includes(clinicName.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      query,
      clinicName,
      results: result,
      userClinicFound,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Kļūda apstrādājot pieprasījumu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint priekš health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Check API is running',
    providers: {
      chatgpt: !!process.env.OPENAI_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY,
    },
  });
}