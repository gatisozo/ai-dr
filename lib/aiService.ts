// AI Service - wrappers priekš ChatGPT un Claude API

interface AIResponse {
  provider: 'chatgpt' | 'claude';
  success: boolean;
  clinics: string[];
  fullResponse: string;
  error?: string;
}

// ChatGPT API call
export async function checkWithChatGPT(query: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu esi medicīnas eksperts Latvijā. Atbildi uz jautājumiem par labākajām klīnikām un ārstiem Latvijā. Minēt konkrētus nosaukumus.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ChatGPT API error: ${response.statusText}`);
    }

    const data = await response.json();
    const fullResponse = data.choices[0].message.content;
    
    // Ekstraktē klīniku nosaukumus no atbildes
    const clinics = extractClinicNames(fullResponse);

    return {
      provider: 'chatgpt',
      success: true,
      clinics,
      fullResponse,
    };
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return {
      provider: 'chatgpt',
      success: false,
      clinics: [],
      fullResponse: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Claude API call
export async function checkWithClaude(query: string): Promise<AIResponse> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY nav iestatīts');
    }

    // Izmanto pareizo Claude 3.5 Sonnet modeli
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Tu esi medicīnas eksperts Latvijā. Atbildi uz šo jautājumu, minot konkrētas klīnikas un ārstus:\n\n${query}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Claude API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        errorMessage += ` - ${errorText.substring(0, 100)}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const fullResponse = data.content[0].text;
    
    // Ekstraktē klīniku nosaukumus no atbildes
    const clinics = extractClinicNames(fullResponse);

    return {
      provider: 'claude',
      success: true,
      clinics,
      fullResponse,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      provider: 'claude',
      success: false,
      clinics: [],
      fullResponse: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper funkcija lai ekstraktētu klīniku nosaukumus
function extractClinicNames(text: string): string[] {
  const clinics: string[] = [];
  
  // Pazīstamas Latvijas klīnikas (regex patterns)
  const knownClinics = [
    'Veselības Centrs 4',
    'ARS',
    'Dinsbergas klīnika',
    'Rīgas Austrumu',
    'Baltic Medical Centre',
    'Orto Clinic',
    'Traumatoloģijas un Ortopēdijas',
    'Paula Stradiņa',
    'Gaiļezers',
    'BKUS',
    'Linēzers',
    'Meridian',
    'Capital Clinic',
    'Piramīda',
  ];

  // Meklē katru pazīstamu klīniku tekstā
  for (const clinic of knownClinics) {
    const regex = new RegExp(clinic, 'i');
    if (regex.test(text)) {
      clinics.push(clinic);
    }
  }

  // Ja nekas atrasts, mēģina ekstraktēt pēc patterniem
  if (clinics.length === 0) {
    const patterns = [
      /(?:klīnika|centrs|slimnīca)\s+["']?([^"'\n,]+)["']?/gi,
      /["']([^"'\n]+(?:klīnika|centrs|slimnīca)[^"'\n]*)["']/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          clinics.push(match[1].trim());
        }
      }
    }
  }

  // Remove duplicates un atgriež pirmās 5
  return [...new Set(clinics)].slice(0, 5);
}

// Kombinētā funkcija - check ar abiem AI
export async function checkWithBothAI(query: string): Promise<{
  chatgpt: AIResponse;
  claude: AIResponse;
}> {
  const [chatgptResult, claudeResult] = await Promise.all([
    checkWithChatGPT(query),
    checkWithClaude(query),
  ]);

  return {
    chatgpt: chatgptResult,
    claude: claudeResult,
  };
}