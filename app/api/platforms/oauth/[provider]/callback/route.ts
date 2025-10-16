import { NextResponse } from "next/server";
import { OAUTH_PROVIDERS, OAuthProviderKey } from "@/config/oauth-providers";
import OAuthManager from "@/lib/oauth/oauth-manager";

/**
 * Maneja el callback de OAuth después de la autorización
 */
export async function GET(
  req: Request,
  context: { params: { provider: string } }
) {
  try {
    const { provider } = context.params;
    const url = new URL(req.url);

    console.log("📥 OAuth Callback received:", {
      provider,
      has_code: !!url.searchParams.get("code"),
      has_error: !!url.searchParams.get("error"),
      full_url: url.toString(),
    });

    // 🧩 Manejar errores del proveedor
    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      const description = url.searchParams.get("error_description") || "Unknown error";
      console.error("❌ OAuth Error:", oauthError, description);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/platforms?error=${oauthError}&desc=${encodeURIComponent(
          description
        )}`
      );
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      console.error("❌ Missing authorization code");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/platforms?error=missing_code`
      );
    }

    if (!(provider in OAUTH_PROVIDERS)) {
      console.error("❌ Unknown provider:", provider);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/platforms?error=unknown_provider`
      );
    }

    const config = OAUTH_PROVIDERS[provider as OAuthProviderKey];

    // ✅ Decodificar state
    let org_id = "org-test-001";
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, "base64").toString());
        org_id = parsed.org_id || org_id;
        console.log("✅ State decoded:", parsed);
      } catch {
        console.warn("⚠️ Failed to parse state; using default org_id");
      }
    }

    // ✅ Detectar dominio base dinámico
    const rawHost =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "localhost:3000";
    const baseUrl = rawHost.startsWith("http")
      ? rawHost
      : `https://${rawHost}`;

    console.log("🔄 Exchanging code for tokens...");

    // ✅ Intercambiar código por tokens
    const tokenResponse = await fetch(config.token_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.client_id,
        client_secret: config.client_secret,
        redirect_uri: `${baseUrl}/api/platforms/oauth/${provider}/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("❌ Token exchange failed:", tokenData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/platforms?error=token_exchange_failed&details=${encodeURIComponent(
          JSON.stringify(tokenData)
        )}`
      );
    }

    console.log("✅ Tokens received, saving to DB...");
    await OAuthManager.saveTokensToDB(
      provider as OAuthProviderKey,
      org_id,
      tokenData
    );

    console.log("✅ OAuth flow completed successfully for", provider);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/platforms?connected=${provider}`
    );
  } catch (error: any) {
    console.error("⚠️ OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/platforms?error=${encodeURIComponent(
        error.message
      )}`
    );
  }
}