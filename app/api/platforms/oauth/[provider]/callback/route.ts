import { NextResponse } from "next/server";
import OAuthManager from "@/lib/oauth/oauth-manager";

export async function GET(
  req: Request,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    // Esperar el provider (Google, Slack, etc.)
    const { provider } = await context.params;
    const url = new URL(req.url);

    // Leer los parámetros enviados por Google
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "org-test-001";

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing authorization code" },
        { status: 400 }
      );
    }

    // Configuración del proveedor
    const PROVIDER_CONFIGS: Record<string, any> = {
      google: {
        token_url: "https://oauth2.googleapis.com/token",
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:
          "https://orange-train-rqg9gxr6x4xhx5xg-3000.app.github.dev/api/platforms/oauth/google/callback",
      },
      slack: {
        token_url: "https://slack.com/api/oauth.v2.access",
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri:
          "https://orange-train-rqg9gxr6x4xhx5xg-3000.app.github.dev/api/platforms/oauth/slack/callback",
      },
    };

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return NextResponse.json(
        { success: false, error: `Unknown provider: ${provider}` },
        { status: 400 }
      );
    }

    // Intercambiar el código por los tokens
    const tokenResponse = await fetch(config.token_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.client_id,
        client_secret: config.client_secret,
        redirect_uri: config.redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("❌ Token exchange failed:", tokenData);
      return NextResponse.json(
        {
          success: false,
          error:
            tokenData.error_description ||
            tokenData.error ||
            "Failed to obtain tokens",
        },
        { status: 400 }
      );
    }

    // Guardar tokens en base de datos
    await OAuthManager.saveTokensToDB(provider, state, tokenData);

    console.log("✅ Tokens guardados para", provider);
    return NextResponse.json({
      success: true,
      message: `Tokens saved successfully for ${provider}`,
      tokens: tokenData,
    });
  } catch (error: any) {
    console.error("⚠️ OAuth callback error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}