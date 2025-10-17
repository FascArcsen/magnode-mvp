import type {
  PreBuiltConfig,
  AuthConfig,
  RawPlatformData,
  ConnectionTestResult,
} from '@/types/connectors';
import type { AuditLog } from '@/types/database';

/**
 * 🔧 BaseConnector<T>
 * Clase base genérica que define la estructura y comportamiento mínimo
 * para todos los conectores del sistema (Google Sheets, Slack, HubSpot, etc.).
 */
export abstract class BaseConnector<TConfig extends Record<string, any> = Record<string, any>> {
  protected config: TConfig;
  protected authConfig: AuthConfig;
  protected connectionId: string;

  constructor(preBuiltConfig: PreBuiltConfig, authConfig: AuthConfig, connectionId: string) {
    this.config = preBuiltConfig.settings as TConfig;
    this.authConfig = authConfig;
    this.connectionId = connectionId;
  }

  // ==========================================
  // Métodos abstractos (deben implementarse)
  // ==========================================
  abstract testConnection(): Promise<ConnectionTestResult>;
  abstract fetchData(since?: Date): Promise<RawPlatformData[]>;
  abstract mapToAuditLogs(rawData: RawPlatformData[]): AuditLog[];

  // ==========================================
  // Métodos comunes de utilidad
  // ==========================================
  protected getAuthHeader(): Record<string, string> {
    const creds = this.authConfig.credentials || {};
    if (creds.token) return { Authorization: `Bearer ${creds.token}` };
    if (creds.api_key) return { 'X-API-Key': creds.api_key };
    return {};
  }

  protected log(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.constructor.name}] ${message}`, ...args);
    }
  }
}