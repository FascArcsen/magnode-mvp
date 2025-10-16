import { NextResponse } from "next/server";

const PROVIDER_CONFIGS: Record<string, any> = {
  google: {
    auth_url: "https://accounts.google.com/o/oauth2/v2/auth",
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri:
      "https://orange-train-rqg9gxr6x4xhx5xg-3000.app.github.dev/api/platforms/oauth/google/callback",
    scope:
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.metadata.readonly",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
  },
};

export async function GET(
  req: Request,
  context: { params: Promise<{ provider: string }> }
) {
  // 🔹 Aquí estaba el error: antes usábamos params directo, ahora lo "await-eamos"
  const { provider } = await context.params;

  const config = PROVIDER_CONFIGS[provider];
  if (!config) {
    return NextResponse.json(
      { error: `Unsupported provider: ${provider}` },
      { status: 400 }
    );
  }

  // 🔹 Construimos la URL hacia Google OAuth
  const authUrl = new URL(config.auth_url);
  authUrl.searchParams.set("client_id", config.client_id);
  authUrl.searchParams.set("redirect_uri", config.redirect_uri);
  authUrl.searchParams.set("response_type", config.response_type);
  authUrl.searchParams.set("scope", config.scope);
  authUrl.searchParams.set("access_type", config.access_type);
  authUrl.searchParams.set("prompt", config.prompt);

  // 🔹 Redirigimos al usuario a Google
  return NextResponse.redirect(authUrl.toString());
}
