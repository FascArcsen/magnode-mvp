/**
 * OAuthManager — MagNode MVP
 * Versión corregida y alineada con schema.prisma (SQLite)
 */

import { OAUTH_PROVIDERS, OAuthProviderKey } from "@/config/oauth-providers";
import { TokenManager } from "@/lib/oauth/token-manager";
import { prisma } from "@/lib/prisma";

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

export class OAuthManager {
  /**
   * Genera la URL de autorización dinámica
   */
  static getAuthUrl(provider: OAuthProviderKey, orgId: string): string {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    const state = Buffer.from(
      JSON.stringify({
        org_id: orgId,
        provider,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).slice(2),
      })
    ).toString("base64");

    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      response_type: "code",
      scope: config.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `${config.auth_url}?${params.toString()}`;
  }

  /**
   * Intercambia el código de autorización por tokens
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
      throw new Error(`Failed to exchange token: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Guarda o actualiza tokens en DB
   */
  static async saveTokensToDB(
    provider: OAuthProviderKey,
    org_id: string,
    tokens: OAuthTokenResponse
  ) {
    if (!OAUTH_PROVIDERS[provider]) {
      throw new Error(`Invalid provider: ${provider}`);
    }

    const encryptedAccessToken = TokenManager.encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? TokenManager.encrypt(tokens.refresh_token)
      : null;

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    const authConfig = {
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_in: tokens.expires_in || 3600,
      expires_at: expiresAt,
      token_type: tokens.token_type || "Bearer",
      scope: tokens.scope || OAUTH_PROVIDERS[provider].scopes.join(" "),
      created_at: new Date().toISOString(),
    };

    // ⚙️ Actualiza o crea la conexión asociada
    const connection = await prisma.platform_connections.upsert({
      where: {
        org_id_platform_name: {
          org_id,
          platform_name: provider,
        },
      },
      update: {
        status: "active",
        auth_config: authConfig,
        error_message: null,
        updated_at: new Date(),
      },
      create: {
        org_id,
        platform_type: "pre_built",
        platform_name: provider,
        status: "active",
        auth_config: authConfig,
        connector_config: { connector_type: provider, version: "1.0" },
        sync_frequency_minutes: 60,
        total_records_synced: 0,
        total_audit_logs_created: 0,
      },
    });

    // ⚙️ Registrar token en tabla oauth_tokens (para auditoría global)
    await prisma.oauth_tokens.upsert({
      where: { org_id_provider: { org_id, provider } },
      update: {
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_type: tokens.token_type || "Bearer",
        expires_at: expiresAt ? new Date(expiresAt) : null,
        scope: tokens.scope,
        updated_at: new Date(),
      },
      create: {
        org_id,
        provider,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_type: tokens.token_type || "Bearer",
        expires_at: expiresAt ? new Date(expiresAt) : null,
        scope: tokens.scope,
      },
    });

    return connection;
  }

  /**
   * Comprueba si el token expiró (considerando 5 minutos de margen)
   */
  static isTokenExpired(connection: any): boolean {
    const authConfig = connection?.auth_config;
    if (!authConfig?.expires_at) return false;

    const expiresAt = new Date(authConfig.expires_at).getTime();
    const now = Date.now();
    const buffer = 5 * 60 * 1000;

    return expiresAt - now < buffer;
  }

  /**
   * Renueva un token expirado
   */
  static async refreshToken(
    provider: OAuthProviderKey,
    connectionId: string
  ): Promise<OAuthTokenResponse> {
    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id: connectionId },
    });

    if (!connection?.auth_config) throw new Error("No auth config found");

    const authConfig = connection.auth_config as any;
    if (!authConfig.refresh_token)
      throw new Error("No refresh token available");

    const refreshToken = TokenManager.decrypt(authConfig.refresh_token);
    const config = OAUTH_PROVIDERS[provider];

    const body = new URLSearchParams({
      client_id: config.client_id,
      client_secret: config.client_secret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch(config.token_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();

      await prisma.platform_connections.update({
        where: { connection_id: connectionId },
        data: {
          status: "error",
          error_message: `Token refresh failed: ${errorText}`,
          updated_at: new Date(),
        },
      });

      throw new Error(`Failed to refresh token: ${errorText}`);
    }

    const newTokens = await response.json();
    await this.saveTokensToDB(provider, connection.org_id, newTokens);

    return newTokens;
  }

  /**
   * Obtiene tokens válidos (auto-refresh incluido)
   */
  static async getValidTokens(connectionId: string): Promise<{
    access_token: string;
    token_type: string;
  }> {
    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id: connectionId },
    });

    if (!connection) throw new Error("Connection not found");

    if (this.isTokenExpired(connection)) {
      console.log("Token expired, refreshing...");
      await this.refreshToken(
        connection.platform_name as OAuthProviderKey,
        connectionId
      );
      const refreshed = await prisma.platform_connections.findUnique({
        where: { connection_id: connectionId },
      });
      if (refreshed) connection.auth_config = refreshed.auth_config;
    }

    const authConfig = connection.auth_config as any;
    const accessToken = TokenManager.decrypt(authConfig.access_token);

    return {
      access_token: accessToken,
      token_type: authConfig.token_type || "Bearer",
    };
  }
}

export default OAuthManager;