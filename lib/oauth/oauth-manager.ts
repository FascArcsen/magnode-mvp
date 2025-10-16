/**
 * OAuthManager — MagNode MVP
 * --------------------------------------------------
 * Maneja el flujo completo de OAuth para cualquier proveedor
 * definido en /config/oauth-providers.ts
 * 
 * Funciones:
 *  - getAuthUrl(provider): genera la URL de autorización
 *  - exchangeCodeForToken(provider, code): intercambia el "code" por tokens
 *  - saveTokensToDB(provider, org_id, tokens): guarda tokens en Supabase (encriptados)
 *  - refreshToken(provider, refresh_token): renueva tokens expirados
 */

import { OAUTH_PROVIDERS, OAuthProviderKey } from "@/config/oauth-providers";
import { TokenManager } from "@/lib/oauth/token-manager";
import { prisma } from "@/lib/prisma";

// ====================================================
// 🔐 TYPES
// ====================================================

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

// ====================================================
// 🚀 MAIN CLASS
// ====================================================

export class OAuthManager {
  /**
   * Genera la URL de autorización para cualquier proveedor
   */
  static getAuthUrl(provider: OAuthProviderKey): string {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      response_type: "code",
      scope: config.scopes.join(" "),
      access_type: "offline", // Solicita refresh_token si aplica
      prompt: "consent",
    });

    return `${config.auth_url}?${params.toString()}`;
  }

  /**
   * Intercambia el código por un access_token + refresh_token
   */
  static async exchangeCodeForToken(
    provider: OAuthProviderKey,
    code: string
  ): Promise<OAuthTokenResponse> {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    const body = new URLSearchParams({
      client_id: config.client_id,
      client_secret: config.client_secret,
      code,
      redirect_uri: config.redirect_uri,
      grant_type: "authorization_code",
    });

    const response = await fetch(config.token_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to exchange token from ${provider}: ${errorText}`);
    }

    const tokenData = (await response.json()) as OAuthTokenResponse;

    return tokenData;
  }

  /**
   * Guarda los tokens en la base de datos Supabase (encriptados)
   */
  static async saveTokensToDB(
    provider: OAuthProviderKey,
    org_id: string,
    tokens: OAuthTokenResponse
  ) {
    const encryptedAccessToken = TokenManager.encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? TokenManager.encrypt(tokens.refresh_token)
      : null;

    await prisma.platform_connections.upsert({
      where: {
        org_id_platform_name: {
          org_id,
          platform_name: provider,
        },
      },
      update: {
        status: "active",
        auth_config: {
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_in: tokens.expires_in || 3600,
        },
        updated_at: new Date(),
      },
      create: {
        org_id,
        platform_type: "pre_built",
        platform_name: provider,
        status: "active",
        auth_config: {
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_in: tokens.expires_in || 3600,
        },
        connector_config: {},
        sync_frequency_minutes: 60,
        total_records_synced: 0,
        total_audit_logs_created: 0,
      },
    });

    return { success: true };
  }

  /**
   * Renueva un token expirado (si el proveedor lo permite)
   */
  static async refreshToken(
    provider: OAuthProviderKey,
    refresh_token: string
  ): Promise<OAuthTokenResponse> {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    const body = new URLSearchParams({
      client_id: config.client_id,
      client_secret: config.client_secret,
      refresh_token,
      grant_type: "refresh_token",
    });

    const response = await fetch(config.token_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refresh token for ${provider}: ${errorText}`);
    }

    const newTokens = (await response.json()) as OAuthTokenResponse;

    return newTokens;
  }

  /**
   * Helper — desencripta los tokens guardados para uso en runtime
   */
  static async getDecryptedTokens(connection_id: string) {
    const record = await prisma.platform_connections.findUnique({
      where: { connection_id },
    });

    if (!record?.auth_config) throw new Error("No auth_config found");

    const { access_token, refresh_token } = record.auth_config as any;

    return {
      access_token: TokenManager.decrypt(access_token),
      refresh_token: refresh_token
        ? TokenManager.decrypt(refresh_token)
        : null,
    };
  }
}
export default OAuthManager;