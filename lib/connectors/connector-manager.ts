import type {
  PlatformConnection,
  UniversalAPIConfig,
  PreBuiltConfig,
  AuthConfig,
  SyncResult,
  ConnectionTestResult,
  DataPreview,
  LLMAssistedConfig
} from "@/types/connectors";
import type { AuditLog } from '@/types/database';
import { UniversalConnector } from "./universal-connector";
import { GoogleSheetsConnector } from "./google-sheets-connector";
import { LLMConfigGenerator } from "./llm-config-generator";

// ==========================================
// CONNECTOR MANAGER
// Orquestador central del sistema de conectores
// ==========================================

export class ConnectorManager {
  private llmGenerator: LLMConfigGenerator;

  constructor(anthropicApiKey: string) {
    this.llmGenerator = new LLMConfigGenerator(anthropicApiKey);
  }

  // ==========================================
  // TEST CONNECTION
  // ==========================================

  async testConnection(connection: PlatformConnection): Promise<ConnectionTestResult> {
    const connector = this.getConnector(connection);
    return connector.testConnection();
  }

  // ==========================================
  // SYNC DATA
  // ==========================================

  async syncConnection(
    connectionId: string,
    connection: PlatformConnection,
    since?: Date
  ): Promise<SyncResult> {
    const startTime = Date.now();

    const syncResult: SyncResult = {
      sync_id: `sync_${Date.now()}`,
      connection_id: connectionId,
      started_at: new Date().toISOString(),
      status: "running",
      stats: {
        endpoints_synced: 0,
        total_records_fetched: 0,
        total_records_processed: 0,
        audit_logs_created: 0,
        errors_count: 0
      },
      errors: []
    };

    try {
      const connector = this.getConnector(connection);

      // Fetch raw data
      const rawData = await connector.fetchData(since);
      syncResult.stats.total_records_fetched = rawData.reduce(
        (sum: number, raw: { raw_payload?: any[] }) =>
          sum + (Array.isArray(raw.raw_payload) ? raw.raw_payload.length : 0),
        0
      );

      // Map to audit logs
      const auditLogs = connector.mapToAuditLogs(rawData);
      syncResult.stats.audit_logs_created = auditLogs.length;
      syncResult.stats.total_records_processed = rawData.length;

      // TODO: Save rawData to database
      // TODO: Save auditLogs to database

      // Count errors
      const errors = rawData.flatMap(
        (raw: { processing_errors?: any[] }) => raw.processing_errors || []
      );
      syncResult.stats.errors_count = errors.length;
      syncResult.errors = errors.map((err: any) => ({
        error_id: err.error_id,
        error_type: err.error_type,
        error_message: err.error_message,
        occurred_at: err.occurred_at,
        retryable: err.error_type !== "validation"
      }));

      syncResult.status = errors.length === 0 ? "completed" : "partial";
      syncResult.completed_at = new Date().toISOString();
      syncResult.duration_ms = Date.now() - startTime;

      // Calculate next sync time
      const nextSyncAt = new Date();
      nextSyncAt.setMinutes(nextSyncAt.getMinutes() + connection.sync_frequency_minutes);
      syncResult.next_sync_at = nextSyncAt.toISOString();

      return syncResult;
    } catch (error: any) {
      syncResult.status = "failed";
      syncResult.completed_at = new Date().toISOString();
      syncResult.duration_ms = Date.now() - startTime;
      syncResult.errors = [
        {
          error_id: `err_${Date.now()}`,
          error_type: "unknown",
          error_message: error.message,
          occurred_at: new Date().toISOString(),
          retryable: true
        }
      ];
      syncResult.stats.errors_count = 1;

      return syncResult;
    }
  }

  // ==========================================
  // PREVIEW DATA (for configuration)
  // ==========================================

  async previewData(connection: PlatformConnection, limit: number = 10): Promise<DataPreview> {
    const connector = this.getConnector(connection);

    if (
      connection.platform_type === "pre_built" &&
      (connection.connector_config as PreBuiltConfig).connector_type === "google_sheets"
    ) {
      return (connector as GoogleSheetsConnector).fetchPreview(limit);
    }

    // For universal connectors, fetch and transform
    const rawData = await connector.fetchData();
    const records = rawData
      .flatMap((raw: { raw_payload?: any[] }) =>
        Array.isArray(raw.raw_payload) ? raw.raw_payload : []
      )
      .slice(0, limit);

    if (records.length === 0) {
      return {
        total_records: 0,
        sample_records: [],
        detected_fields: []
      };
    }

    // Detect fields
    const allKeys = new Set<string>();
    records.forEach((record: Record<string, unknown>) => {
      Object.keys(record).forEach((key: string) => allKeys.add(key));
    });

    const detectedFields = Array.from(allKeys).map((key: string) => {
      const values = records
        .map((r: Record<string, unknown>) => r[key])
        .filter((v: unknown) => v !== null && v !== undefined);
      return {
        field_name: key,
        data_type: this.detectDataType(values),
        sample_values: values.slice(0, 3),
        null_count: records.length - values.length
      };
    });

    return {
      total_records: records.length,
      sample_records: records,
      detected_fields: detectedFields
    };
  }

  // ==========================================
  // LLM ASSISTANCE
  // ==========================================

  async generateConfigWithLLM(input: {
    api_documentation?: string;
    base_url: string;
    sample_response?: string;
    api_description?: string;
  }): Promise<LLMAssistedConfig> {
    return this.llmGenerator.analyzeAPI(input);
  }

  async refineConfigWithLLM(
    originalConfig: UniversalAPIConfig,
    userFeedback: string,
    testResults?: any
  ): Promise<UniversalAPIConfig> {
    return this.llmGenerator.refineConfig(originalConfig, userFeedback, testResults);
  }

  // ==========================================
  // CREATE CONNECTION FROM LLM CONFIG
  // ==========================================

  createConnectionFromLLMConfig(
    llmConfig: LLMAssistedConfig,
    authConfig: AuthConfig,
    orgId: string
  ): PlatformConnection {
    return {
      connection_id: `conn_${Date.now()}`,
      org_id: orgId,
      platform_type: "llm_assisted",
      platform_name: this.extractPlatformName(llmConfig.suggested_config.base_url),
      auth_config: authConfig,
      connector_config: llmConfig.suggested_config,
      status: "testing",
      sync_frequency_minutes: 60,
      total_records_synced: 0,
      total_audit_logs_created: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // ==========================================
  // BATCH SYNC (for scheduled jobs)
  // ==========================================

  async syncAllConnections(connections: PlatformConnection[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const connection of connections) {
      if (connection.status !== "active") continue;
      if (connection.next_sync_at && new Date(connection.next_sync_at) > new Date()) continue;

      try {
        const since = connection.last_sync_at ? new Date(connection.last_sync_at) : undefined;
        const result = await this.syncConnection(connection.connection_id, connection, since);
        results.push(result);
      } catch (error: any) {
        console.error(`Failed to sync ${connection.connection_id}:`, error);
        results.push({
          sync_id: `sync_${Date.now()}`,
          connection_id: connection.connection_id,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          status: "failed",
          stats: {
            endpoints_synced: 0,
            total_records_fetched: 0,
            total_records_processed: 0,
            audit_logs_created: 0,
            errors_count: 1
          },
          errors: [
            {
              error_id: `err_${Date.now()}`,
              error_type: "unknown",
              error_message: error.message,
              occurred_at: new Date().toISOString(),
              retryable: true
            }
          ]
        });
      }
    }

    return results;
  }

  // ==========================================
  // CONNECTOR FACTORY
  // ==========================================

  private getConnector(connection: PlatformConnection): any {
    const { platform_type, connector_config, auth_config, connection_id } = connection;

    if (platform_type === "pre_built") {
      const preBuiltConfig = connector_config as PreBuiltConfig;

      switch (preBuiltConfig.connector_type) {
        case "google_sheets":
          return new GoogleSheetsConnector(preBuiltConfig, auth_config, connection_id);
        default:
          throw new Error(`Unknown pre-built connector: ${preBuiltConfig.connector_type}`);
      }
    } else if (platform_type === "universal" || platform_type === "llm_assisted") {
      const universalConfig = connector_config as UniversalAPIConfig;
      return new UniversalConnector(universalConfig, auth_config, connection_id);
    } else {
      throw new Error(`Unknown platform type: ${platform_type}`);
    }
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  private detectDataType(values: unknown[]): string {
    if (values.length === 0) return "string";

    const sample = values[0];

    if (typeof sample === "number") return "number";
    if (typeof sample === "boolean") return "boolean";
    if (typeof sample === "object") return "object";

    if (typeof sample === "string") {
      const date = new Date(sample);
      if (!isNaN(date.getTime()) && sample.includes("-")) {
        return "date";
      }
    }

    return "string";
  }

  private extractPlatformName(baseUrl: string): string {
    try {
      const url = new URL(baseUrl);
      const hostname = url.hostname;
      const parts = hostname.replace("www.", "").split(".");
      return parts.length > 1 ? parts[parts.length - 2] : parts[0];
    } catch {
      return "Custom API";
    }
  }

  // ==========================================
  // VALIDATE CONFIGURATION
  // ==========================================

  validateConfig(config: UniversalAPIConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.base_url) errors.push("base_url is required");
    if (!config.endpoints || config.endpoints.length === 0)
      errors.push("At least one endpoint is required");

    config.endpoints?.forEach((endpoint, i) => {
      if (!endpoint.path) errors.push(`Endpoint ${i}: path is required`);
      if (!endpoint.response_data_path)
        errors.push(`Endpoint ${i}: response_data_path is required`);
    });

    if (!config.data_mapping) {
      errors.push("data_mapping is required");
    } else {
      const required = ["id", "timestamp", "actor", "action"];
      required.forEach((field) => {
        if (
          !config.data_mapping.required_fields?.[
            field as keyof typeof config.data_mapping.required_fields
          ]
        ) {
          errors.push(`data_mapping.required_fields.${field} is required`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
