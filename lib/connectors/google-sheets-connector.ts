import { BaseConnector } from './base-connector';
import { OAuthManager } from "@/lib/oauth/oauth-manager";
import type {
  PreBuiltConfig,
  AuthConfig,
  RawPlatformData,
  ConnectionTestResult,
  DataPreview,
} from '@/types/connectors';
import type { AuditLog } from '@/types/database';

// ==========================================
// GOOGLE SHEETS CONNECTOR
// ==========================================

export interface GoogleSheetsConfig {
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

export class GoogleSheetsConnector extends BaseConnector<GoogleSheetsConfig> {
  constructor(preBuiltConfig: PreBuiltConfig, authConfig: AuthConfig, connectionId: string) {
    super(preBuiltConfig, authConfig, connectionId);
  }

  // ==========================================
  // TEST CONNECTION
  // ==========================================
  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const tokens = await OAuthManager.getValidTokens(this.connectionId);

      const response = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!response.ok)
        throw new Error(`Google API returned ${response.status}: ${response.statusText}`);

      const userData = await response.json();

      return {
        success: true,
        message: `Connected as ${userData.user.displayName}`,
        details: {
          can_authenticate: true,
          endpoints_reachable: 1,
          sample_data_count: 1,
          sample_records: [userData.user],
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        message: 'Failed to connect to Google Sheets',
        errors: [err.message],
      };
    }
  }

  // ==========================================
  // FETCH DATA
  // ==========================================
  async fetchData(since?: Date): Promise<RawPlatformData[]> {
    try {
      const rows = await this.fetchRows({ since });

      return [
        {
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
            response_time_ms: 0,
          },
        },
      ];
    } catch (error: unknown) {
      const err = error as Error;
      return [
        {
          raw_data_id: `raw_error_${Date.now()}`,
          connection_id: this.connectionId,
          endpoint_id: 'google_sheets_main',
          raw_payload: null,
          extracted_at: new Date().toISOString(),
          processed: false,
          mapped_to_audit_log: false,
          processing_errors: [
            {
              error_id: `err_${Date.now()}`,
              error_type: 'unknown',
              error_message: err.message,
              occurred_at: new Date().toISOString(),
            },
          ],
        },
      ];
    }
  }

  // ==========================================
  // FETCH ROWS (helper)
  // ==========================================
  private async fetchRows(options: { limit?: number; since?: Date } = {}): Promise<Record<string, string | number | null>[]> {
    const { spreadsheet_id, sheet_name, range } = this.config;
    const sheetRange = range || (sheet_name ? `${sheet_name}!A:ZZ` : 'A:ZZ');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${encodeURIComponent(sheetRange)}`;

    const tokens = await OAuthManager.getValidTokens(this.connectionId);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok)
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);

    const data = await response.json();
    const values = data.values || [];
    if (values.length === 0) return [];

    const headers = values[this.config.header_row - 1] || values[0];
    const dataRows = values.slice(this.config.header_row);

    let rows = dataRows.map((row: any[]) => {
      const obj: Record<string, string | number | null> = {};
      headers.forEach((header: string, i: number) => (obj[header] = row[i] || null));
      return obj;
    });

    // ✅ Incremental filtering - tipado y validado
    if (options.since && this.config.incremental_sync?.enabled) {
      const col = this.config.incremental_sync.timestamp_column;
      rows = rows.filter((row: Record<string, string | number | null>) => {
        const value = row[col];
        if (!value) return false;
        const timestamp = new Date(String(value));
        return !isNaN(timestamp.getTime()) && timestamp >= options.since!;
      });
    }

    if (options.limit) rows = rows.slice(0, options.limit);
    return rows;
  }

  // ==========================================
  // MAP TO AUDIT LOGS
  // ==========================================
  mapToAuditLogs(rawData: RawPlatformData[]): AuditLog[] {
    const logs: AuditLog[] = [];

    for (const raw of rawData) {
      if (!Array.isArray(raw.raw_payload)) continue;

      for (const row of raw.raw_payload) {
        const log = this.mapRow(row as Record<string, string | number | null>);
        if (log) logs.push(log);
      }
    }

    return logs;
  }

  private mapRow(row: Record<string, string | number | null>): AuditLog | null {
    const { columns } = this.config;
    const id = row[columns.id_column];
    const timestamp = row[columns.timestamp_column];
    const actor = row[columns.actor_column];
    const action = row[columns.action_column];

    if (!id || !timestamp || !actor || !action) return null;

    const target = columns.target_column ? row[columns.target_column] : undefined;
    const metadata: Record<string, any> = {};
    columns.metadata_columns?.forEach((c) => {
      if (row[c] != null) metadata[c] = row[c];
    });

    return {
      audit_id: `audit_sheets_${id}`,
      actor_type: "user",
      actor_id: String(actor),
      action: String(action),
      target_table: target ? "resource" : "unknown",
      target_id: target ? String(target) : "unknown",
      ts: new Date(String(timestamp)).toISOString(),
      diff_json: Object.keys(metadata).length > 0 ? metadata : row,
    };
  }

  // ==========================================
  // FETCH PREVIEW (for ConnectorManager)
  // ==========================================
  async fetchPreview(limit: number = 10): Promise<DataPreview> {
    const rows = await this.fetchRows({ limit });
    if (!rows.length) return { total_records: 0, sample_records: [], detected_fields: [] };

    const sample = rows.slice(0, limit);
    const keys = new Set<string>();
    sample.forEach((r) => Object.keys(r).forEach((k) => keys.add(k)));

    const detected_fields = Array.from(keys).map((key) => {
      const vals = sample.map((r) => r[key]).filter((v) => v !== null && v !== undefined);
      return {
        field_name: key,
        data_type: typeof vals[0],
        sample_values: vals.slice(0, 3),
        null_count: sample.length - vals.length,
      };
    });

    return {
      total_records: sample.length,
      sample_records: sample,
      detected_fields,
    };
  }
}
