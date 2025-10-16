// app/api/platforms/oauth/[provider]/callback/route.ts
import { NextResponse } from "next/server";
import OAuthManager from "@/lib/oauth/oauth-manager";

const TOKEN_URLS: Record<string, string> = {
  slack: "https://slack.com/api/oauth.v2.access",
  google: "https://oauth2.googleapis.com/token",
};

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const { provider } = params;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const org_id = url.searchParams.get("state") || "org-test-001"; // 'state' viene del authorize

  if (!code) {
    return NextResponse.json({ success: false, error: "Missing authorization code" }, { status: 400 });
  }

  try {
    const tokenUrl = TOKEN_URLS[provider];
    if (!tokenUrl) throw new Error("Unsupported provider");

    let tokenBody: URLSearchParams;

    if (provider === "slack") {
      tokenBody = new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: "http://localhost:3000/api/platforms/oauth/slack/callback",
      });
    } else if (provider === "google") {
      tokenBody = new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: "http://localhost:3000/api/platforms/oauth/google/callback",
        grant_type: "authorization_code",
      });
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error_description || data.error || "Failed to get tokens");
    }

    // Guarda tokens cifrados en tu BD
    await OAuthManager.saveTokensToDB(provider as "slack" | "google", org_id, data);

    return NextResponse.json({
      success: true,
      message: `Tokens for ${provider} saved successfully`,
      data,
    });
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
