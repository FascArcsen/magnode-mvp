import { OAuthManager } from "@/lib/oauth/oauth-manager";
import type {
  PreBuiltConfig,
  AuthConfig,
  RawPlatformData,
  ConnectionTestResult,
  DataPreview
} from '@/types/connectors';
import type { AuditLog } from '@/types/database';

// ==========================================
// GOOGLE SHEETS CONNECTOR
// ==========================================

interface GoogleSheetsConfig {
  spreadsheet_id: string;
  sheet_name?: string;
  range?: string;
  header_row: number;
  
  columns: {
    id_column: string;
    timestamp_column: string;
    actor_column: string;
    action_column: string;
    target_column?: string;
    department_column?: string;
    metadata_columns?: string[];
  };
  
  incremental_sync?: {
    enabled: boolean;
    timestamp_column: string;
  };
}

export class GoogleSheetsConnector {
  private config: GoogleSheetsConfig;
  private authConfig: AuthConfig;
  private connectionId: string;

  constructor(preBuiltConfig: PreBuiltConfig, authConfig: AuthConfig, connectionId: string) {
    this.config = preBuiltConfig.settings as GoogleSheetsConfig;
    this.authConfig = authConfig;
    this.connectionId = connectionId;
  }

  // ==========================================
  // TEST CONNECTION
  // ==========================================
  async testConnection(): Promise<ConnectionTestResult> {
    try {
      // ✅ Obtén token real desde OAuthManager
      const tokens = await OAuthManager.getValidTokens(this.connectionId);

      // ✅ Llamada simple para verificar acceso a Google Drive API
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/about?fields=user",
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );

      if (!response.ok) {
        throw new Error(`Google API returned ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();

      return {
        success: true,
        message: `Connected as ${userData.user.displayName}`,
        details: {
          can_authenticate: true,
          endpoints_reachable: 1,
          sample_data_count: 1,
          sample_records: [userData.user]
        }
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        message: 'Failed to connect to Google Sheets',
        errors: [err.message]
      };
    }
  }

  // ==========================================
  // FETCH DATA (Main method)
  // ==========================================
  async fetchData(since?: Date): Promise<RawPlatformData[]> {
    try {
      const rows = await this.fetchRows({ since });
      
      return [{
        raw_data_id: `raw_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        connection_id: this.connectionId,
        endpoint_id: 'google_sheets_main',
        raw_payload: rows,
        extracted_at: new Date().toISOString(),
        processed: false,
        mapped_to_audit_log: false,
        request_metadata: {
          endpoint_path: `/spreadsheets/${this.config.spreadsheet_id}`,
          response_status: 200,
          response_time_ms: 0
        }
      }];
    } catch (error: unknown) {
      const err = error as Error;
      return [{
        raw_data_id: `raw_error_${Date.now()}`,
        connection_id: this.connectionId,
        endpoint_id: 'google_sheets_main',
        raw_payload: null,
        extracted_at: new Date().toISOString(),
        processed: false,
        mapped_to_audit_log: false,
        processing_errors: [{
          error_id: `err_${Date.now()}`,
          error_type: 'unknown',
          error_message: err.message,
          occurred_at: new Date().toISOString()
        }]
      }];
    }
  }

  // ==========================================
  // FETCH ROWS FROM SHEETS API
  // ==========================================
  private async fetchRows(options: { limit?: number; since?: Date } = {}): Promise<any[]> {
    const { spreadsheet_id, sheet_name, range } = this.config;
    const sheetRange = range || (sheet_name ? `${sheet_name}!A:ZZ` : 'A:ZZ');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${encodeURIComponent(sheetRange)}`;

    // ✅ Usa tokens reales en lugar de authConfig
    const tokens = await OAuthManager.getValidTokens(this.connectionId);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const values = data.values || [];

    if (values.length === 0) return [];

    const headers = values[this.config.header_row - 1] || values[0];
    const dataRows = values.slice(this.config.header_row);

    let rows = dataRows.map((row: any[]) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || null;
      });
      return obj;
    });

    // ✅ Filtra incrementalmente si aplica
    if (options.since && this.config.incremental_sync?.enabled) {
      const timestampCol = this.config.incremental_sync.timestamp_column;
      rows = rows.filter((row: any) => {
        const timestamp = new Date(row[timestampCol]);
        return timestamp >= options.since!;
      });
    }

    if (options.limit) {
      rows = rows.slice(0, options.limit);
    }

    return rows;
  }

  // ==========================================
  // MAP TO AUDIT LOGS (sin cambios)
  // ==========================================
  mapToAuditLogs(rawData: RawPlatformData[]): AuditLog[] {
    const auditLogs: AuditLog[] = [];

    for (const raw of rawData) {
      if (!raw.raw_payload || !Array.isArray(raw.raw_payload)) continue;

      for (const row of raw.raw_payload) {
        try {
          const auditLog = this.mapRow(row);
          if (auditLog) auditLogs.push(auditLog);
        } catch (error: unknown) {
          const err = error as Error;
          console.error("Error mapping row:", err);
          if (!raw.processing_errors) raw.processing_errors = [];
          raw.processing_errors.push({
            error_id: `map_err_${Date.now()}`,
            error_type: "mapping",
            error_message: err.message,
            occurred_at: new Date().toISOString()
          });
        }
      }
    }

    return auditLogs;
  }

  private mapRow(row: any): AuditLog | null {
    const { columns } = this.config;

    const id = row[columns.id_column];
    const timestamp = row[columns.timestamp_column];
    const actor = row[columns.actor_column];
    const action = row[columns.action_column];

    if (!id || !timestamp || !actor || !action) {
      console.warn("Missing required fields in row:", row);
      return null;
    }

    const target = columns.target_column ? row[columns.target_column] : undefined;
    const department = columns.department_column ? row[columns.department_column] : undefined;

    const metadata: any = {};
    if (columns.metadata_columns) {
      columns.metadata_columns.forEach((col: string) => {
        if (row[col] !== null && row[col] !== undefined) {
          metadata[col] = row[col];
        }
      });
    }

    return {
      audit_id: `audit_sheets_${id}`,
      actor_type: "user",
      actor_id: String(actor),
      action: String(action),
      target_table: target ? "resource" : "unknown",
      target_id: target ? String(target) : "unknown",
      ts: new Date(timestamp).toISOString(),
      diff_json: Object.keys(metadata).length > 0 ? metadata : row
    };
  }

  // ==========================================
  // UTILITIES (sin cambios)
  // ==========================================
  private detectDataType(values: any[]): string {
    if (values.length === 0) return "string";
    const sample = values[0];
    if (typeof sample === "number") return "number";
    if (typeof sample === "boolean") return "boolean";
    if (typeof sample === "object") return "object";
    if (typeof sample === "string") {
      const date = new Date(sample);
      if (!isNaN(date.getTime()) && sample.includes("-")) return "date";
    }
    return "string";
  }

  private suggestMapping(fields: any[]): any {
    // … (igual al tuyo)
    return {};
  }
}