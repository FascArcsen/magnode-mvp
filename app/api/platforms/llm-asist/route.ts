import { NextResponse } from 'next/server';

/**
 * 🤖 LLM Configuration Generator
 * 
 * Genera configuraciones de conectores usando IA.
 * Configurable para usar cualquier proveedor (Anthropic, OpenAI, etc.)
 */

// =========================================
// CONFIGURACIÓN DEL PROVEEDOR DE IA
// =========================================
const AI_PROVIDER = process.env.AI_PROVIDER || 'none';

// =========================================
// FUNCIÓN PRINCIPAL
// =========================================
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Verificar que hay un proveedor configurado
    if (AI_PROVIDER === 'none' || !AI_PROVIDER) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI provider not configured. Please set AI_PROVIDER in your .env file.',
        },
        { status: 503 }
      );
    }

    console.log('🤖 Generating connector config with AI...');
    console.log(`📡 Provider: ${AI_PROVIDER}`);

    // Llamar al proveedor de IA configurado
    let config;
    let tokensUsed = 0;

    switch (AI_PROVIDER) {
      case 'anthropic':
        const anthropicResult = await generateWithAnthropic(prompt);
        config = anthropicResult.config;
        tokensUsed = anthropicResult.tokensUsed;
        break;

      case 'openai':
        const openaiResult = await generateWithOpenAI(prompt);
        config = openaiResult.config;
        tokensUsed = openaiResult.tokensUsed;
        break;

      case 'custom':
        const customResult = await generateWithCustomProvider(prompt);
        config = customResult.config;
        tokensUsed = customResult.tokensUsed;
        break;

      default:
        throw new Error(`Unsupported AI provider: ${AI_PROVIDER}. Use 'anthropic', 'openai', or 'custom'.`);
    }

    // Validar la estructura
    if (!config.platform_name || !config.auth_config || !config.connector_config) {
      throw new Error('AI generated incomplete configuration');
    }

    console.log('✅ Generated config:', config.platform_name);

    return NextResponse.json({
      success: true,
      data: config,
      provider: AI_PROVIDER,
      tokens_used: tokensUsed,
    });

  } catch (error: any) {
    console.error('❌ LLM generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate configuration',
      },
      { status: 500 }
    );
  }
}

// =========================================
// PROVEEDORES DE IA
// =========================================

/**
 * Anthropic Claude
 */
async function generateWithAnthropic(prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured. Add it to your .env file.');
  }

  try {
    // Importar dinámicamente en runtime
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildPrompt(prompt),
        },
      ],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    const config = parseAIResponse(responseText);

    return {
      config,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    };
  } catch (importError: any) {
    if (importError.code === 'MODULE_NOT_FOUND') {
      throw new Error('Anthropic SDK not installed. Run: npm install @anthropic-ai/sdk');
    }
    throw importError;
  }
}

/**
 * OpenAI GPT
 */
async function generateWithOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured. Add it to your .env file.');
  }

  try {
    // Importar dinámicamente en runtime
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a REST API connector configuration expert.',
        },
        {
          role: 'user',
          content: buildPrompt(prompt),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const config = parseAIResponse(responseText);

    return {
      config,
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  } catch (importError: any) {
    if (importError.code === 'MODULE_NOT_FOUND') {
      throw new Error('OpenAI SDK not installed. Run: npm install openai');
    }
    throw importError;
  }
}

/**
 * Custom Provider (para cuando uses otro modelo)
 */
async function generateWithCustomProvider(prompt: string) {
  const apiUrl = process.env.CUSTOM_AI_API_URL;
  const apiKey = process.env.CUSTOM_AI_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('CUSTOM_AI_API_URL and CUSTOM_AI_API_KEY not configured. Add them to your .env file.');
  }

  // Llamada a API custom usando fetch nativo
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: buildPrompt(prompt),
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Custom AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Ajusta según la estructura de respuesta de tu API
  const responseText = data.response || data.text || data.content || data.message || '';
  
  if (!responseText) {
    throw new Error('Custom AI API returned empty response');
  }

  const config = parseAIResponse(responseText);

  return {
    config,
    tokensUsed: data.tokens_used || data.usage?.total_tokens || 0,
  };
}

// =========================================
// UTILIDADES
// =========================================

/**
 * Construye el prompt para el modelo de IA
 */
function buildPrompt(userPrompt: string): string {
  return `You are a REST API connector configuration expert. Based on the user's description, generate a JSON configuration for a universal API connector.

User's description:
${userPrompt}

Generate a JSON response with this EXACT structure:
{
  "platform_name": "Platform Name",
  "auth_config": {
    "type": "api_key" | "bearer" | "basic" | "oauth",
    "credentials": {
      "api_key": "placeholder_key",
      "bearer_token": "placeholder_token",
      "username": "placeholder_user",
      "password": "placeholder_pass"
    }
  },
  "connector_config": {
    "base_url": "https://api.example.com",
    "endpoints": [
      {
        "name": "Get Users",
        "path": "/users",
        "method": "GET",
        "description": "Fetches all users"
      },
      {
        "name": "Get Tickets",
        "path": "/tickets",
        "method": "GET",
        "description": "Fetches all tickets"
      }
    ]
  }
}

CRITICAL RULES:
1. Return ONLY valid JSON, no markdown, no explanations
2. Infer the platform name from the description
3. Choose appropriate auth type based on description
4. Include at least 2-4 relevant endpoints
5. Use realistic endpoint paths based on the platform's actual API structure
6. If unsure about auth, default to "bearer"`;
}

/**
 * Parsea la respuesta del modelo de IA
 */
function parseAIResponse(responseText: string): any {
  try {
    // Limpiar la respuesta (remover markdown, espacios, etc.)
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error('❌ Failed to parse AI response:', responseText);
    throw new Error('AI generated invalid JSON. Please try again with a more specific description.');
  }
}