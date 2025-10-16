import { NextResponse } from 'next/server';
import OAuthManager from '@/lib/oauth/oauth-manager';

export async function POST(request: Request) {
  try {
    const { org_id, provider, tokens } = await request.json();

    if (!org_id || !provider || !tokens) {
      throw new Error('Missing required fields: org_id, provider or tokens');
    }

    // Guardar los tokens en la BD usando el OAuthManager
    await OAuthManager.saveTokensToDB(provider, org_id, tokens);

    return NextResponse.json({
      success: true,
      message: `Tokens saved successfully for ${provider}`,
    });
  } catch (error: any) {
    console.error('❌ Error en /oauth/save-tokens:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}