import { NextResponse, NextRequest } from "next/server";
import { OAUTH_PROVIDERS, OAuthProviderKey } from "@/config/oauth-providers";

/**
 * Genera la URL de autorización OAuth dinámica
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;

  if (!(provider in OAUTH_PROVIDERS)) {
    return NextResponse.json(
      { error: `Unsupported provider: ${provider}` },
      { status: 400 }
    );
  }

  const config = OAUTH_PROVIDERS[provider as OAuthProviderKey];

  // ✅ Detectar dominio base dinámico
  const rawHost =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";

  const baseUrl = rawHost.startsWith("http")
    ? rawHost
    : `https://${rawHost}`;

  // ✅ Crear state seguro
  const state = Buffer.from(
    JSON.stringify({
      org_id: "org-test-001",
      provider,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2, 10),
    })
  ).toString("base64");

  // ✅ Construir URL de autorización
  const authUrl = new URL(config.auth_url);
  authUrl.searchParams.set("client_id", config.client_id);
  authUrl.searchParams.set(
    "redirect_uri",
    `${baseUrl}/api/platforms/oauth/${provider}/callback`
  );
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", config.scopes.join(" "));
  authUrl.searchParams.set("state", state);

  // ⚙️ Ajustes extra para Google
  if (provider === "google") {
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
  }

  console.log("🔗 Redirecting to OAuth provider:", {
    provider,
    redirect_uri: `${baseUrl}/api/platforms/oauth/${provider}/callback`,
  });

  return NextResponse.redirect(authUrl.toString());
}