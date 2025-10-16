// app/api/platforms/oauth/[provider]/authorize/route.ts
import { NextResponse } from "next/server";

const PROVIDER_CONFIGS: Record<string, any> = {
  slack: {
    auth_url: "https://slack.com/oauth/v2/authorize",
    client_id: process.env.SLACK_CLIENT_ID!,
    redirect_uri: "http://localhost:3000/api/platforms/oauth/slack/callback",
    scope: "channels:read chat:write users:read",
  },
  google: {
    auth_url: "https://accounts.google.com/o/oauth2/v2/auth",
    client_id: process.env.GOOGLE_CLIENT_ID!,
 redirect_uri: "https://orange-train-rqg9gxr6x4xhx5xg-3000.app.github.dev/api/platforms/oauth/google/callback",
    scope:
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.metadata.readonly",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
  },
};

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const { provider } = params;
  const config = PROVIDER_CONFIGS[provider];

  if (!config) {
    return NextResponse.json(
      { success: false, error: `Unsupported provider: ${provider}` },
      { status: 400 }
    );
  }

  // Permite pasar org_id dinámico por query param
  const url = new URL(req.url);
  const org_id = url.searchParams.get("org_id") || "org-test-001";

  // Construcción dinámica de la URL de autorización
  const authUrl = new URL(config.auth_url);
  authUrl.searchParams.set("client_id", config.client_id);
  authUrl.searchParams.set("redirect_uri", config.redirect_uri);
  authUrl.searchParams.set("scope", config.scope);
  authUrl.searchParams.set("response_type", config.response_type || "code");
  authUrl.searchParams.set("state", org_id); // para identificar la org al volver

  if (config.access_type) authUrl.searchParams.set("access_type", config.access_type);
  if (config.prompt) authUrl.searchParams.set("prompt", config.prompt);

  // Redirige al proveedor real
  return NextResponse.redirect(authUrl.toString());
}