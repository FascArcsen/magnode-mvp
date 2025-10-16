/**
 * OAuthManager — MagNode MVP
 * Optimizado para trabajar con el schema actual de Prisma
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
   * Genera la URL de autorización
   */
  static getAuthUrl(provider: OAuthProviderKey, orgId: string): string {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) throw new Error(`Provider ${provider} not supported`);

    // ✅ Genera un state token único con el org_id embebido
    const state = Buffer.from(
      JSON.stringify({
        org_id: orgId,
        provider,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).slice(2)
      })
    ).toString('base64');

    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      response_type: "code",
      scope: config.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state
    });

    return `${config.auth_url}?${params.toString()}`;
  }

  /**
   * Intercambia el código por tokens
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
   * ✅ Guarda tokens usando el schema actual (sin modificaciones)
   */
  static async saveTokensToDB(
    provider: OAuthProviderKey,
    org_id: string,
    tokens: OAuthTokenResponse
  ) {
    // Encriptar tokens
    const encryptedAccessToken = TokenManager.encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? TokenManager.encrypt(tokens.refresh_token)
      : null;

    // Calcular fecha de expiración
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    // ✅ Usar el schema actual - auth_config almacena todo
    const authConfig = {
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_in: tokens.expires_in || 3600,
      expires_at: expiresAt?.toISOString(),
      token_type: tokens.token_type || "Bearer",
      scope: tokens.scope || OAUTH_PROVIDERS[provider].scopes.join(" "),
      created_at: new Date().toISOString()
    };

    // ✅ Upsert usando el índice único existente
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
        error_message: null, // Limpiar errores previos
        updated_at: new Date(),
      },
      create: {
        org_id,
        platform_type: "pre_built",
        platform_name: provider,
        status: "active",
        auth_config: authConfig,
        connector_config: {
          connector_type: provider,
          version: "1.0"
        },
        sync_frequency_minutes: 60,
        total_records_synced: 0,
        total_audit_logs_created: 0,
      },
    });

    return connection;
  }

  /**
   * ✅ Verifica si el token está expirado
   */
  static isTokenExpired(connection: any): boolean {
    if (!connection?.auth_config) return true;
    
    const authConfig = connection.auth_config as any;
    if (!authConfig.expires_at) return false; // Si no hay fecha, asumir válido
    
    const expiresAt = new Date(authConfig.expires_at);
    const now = new Date();
    
    // Considerar expirado si faltan menos de 5 minutos
    const bufferMs = 5 * 60 * 1000;
    return expiresAt.getTime() - now.getTime() < bufferMs;
  }

  /**
   * ✅ Renueva un token expirado
   */
  static async refreshToken(
    provider: OAuthProviderKey,
    connectionId: string
  ): Promise<OAuthTokenResponse> {
    // Obtener conexión actual
    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id: connectionId }
    });

    if (!connection?.auth_config) {
      throw new Error("No auth config found");
    }

    const authConfig = connection.auth_config as any;
    if (!authConfig.refresh_token) {
      throw new Error("No refresh token available");
    }

    // Desencriptar refresh token
    const refreshToken = TokenManager.decrypt(authConfig.refresh_token);

    // Llamar al proveedor
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
      
      // ✅ Marcar conexión como error
      await prisma.platform_connections.update({
        where: { connection_id: connectionId },
        data: {
          status: "error",
          error_message: `Token refresh failed: ${errorText}`,
          updated_at: new Date()
        }
      });

      throw new Error(`Failed to refresh token: ${errorText}`);
    }

    const newTokens = await response.json();

    // ✅ Guardar nuevos tokens
    await this.saveTokensToDB(
      provider,
      connection.org_id,
      newTokens
    );

    return newTokens;
  }

  /**
   * ✅ Obtiene tokens desencriptados (con auto-refresh si es necesario)
   */
  static async getValidTokens(connectionId: string): Promise<{
    access_token: string;
    token_type: string;
  }> {
    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id: connectionId }
    });

    if (!connection) {
      throw new Error("Connection not found");
    }

    // Verificar si el token está expirado
    if (this.isTokenExpired(connection)) {
      console.log("Token expired, refreshing...");
      await this.refreshToken(
        connection.platform_name as OAuthProviderKey,
        connectionId
      );

      // Recargar la conexión con el nuevo token
      const refreshedConnection = await prisma.platform_connections.findUnique({
        where: { connection_id: connectionId }
      });

      if (!refreshedConnection) {
        throw new Error("Failed to reload connection");
      }

      connection.auth_config = refreshedConnection.auth_config;
    }

    const authConfig = connection.auth_config as any;
    const accessToken = TokenManager.decrypt(authConfig.access_token);

    return {
      access_token: accessToken,
      token_type: authConfig.token_type || "Bearer"
    };
  }
}

export default OAuthManager;