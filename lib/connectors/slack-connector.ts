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
// SLACK CONNECTOR
// ==========================================

export interface SlackConfig {
  channels: string[];              // IDs de los canales a sincronizar
  include_threads?: boolean;       // Si se deben traer mensajes dentro de hilos
  lookback_days?: number;          // Límite de tiempo hacia atrás
  message_limit?: number;          // Máximo de mensajes a traer
}

export class SlackConnector extends BaseConnector<SlackConfig> {
  constructor(preBuiltConfig: PreBuiltConfig, authConfig: AuthConfig, connectionId: string) {
    super(preBuiltConfig, authConfig, connectionId);
  }

  // ==========================================
  // TEST CONNECTION
  // ==========================================
  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const tokens = await OAuthManager.getValidTokens(this.connectionId);

      // Verificamos identidad del bot
      const authTest = await fetch("https://slack.com/api/auth.test", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const data = await authTest.json();
      if (!data.ok) throw new Error(data.error || "Failed to authenticate with Slack");

      // Consultamos el workspace
      const teamInfo = await fetch("https://slack.com/api/team.info", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const teamData = await teamInfo.json();

      return {
        success: true,
        message: `Connected to Slack workspace: ${teamData.team?.name || data.team}`,
        details: {
          can_authenticate: true,
          endpoints_reachable: 2,
          sample_data_count: 1,
          sample_records: [{ team: teamData.team }],
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        message: "Failed to connect to Slack",
        errors: [err.message],
      };
    }
  }

  // ==========================================
  // FETCH DATA
  // ==========================================
  async fetchData(since?: Date): Promise<RawPlatformData[]> {
    try {
      const tokens = await OAuthManager.getValidTokens(this.connectionId);
      const lookback = this.config.lookback_days || 7;
      const messageLimit = this.config.message_limit || 100;
      const channels = this.config.channels || [];

      const oldest = since
        ? Math.floor(since.getTime() / 1000)
        : Math.floor(Date.now() / 1000 - lookback * 86400);

      const results: RawPlatformData[] = [];

      for (const channelId of channels) {
        const response = await fetch(
          `https://slack.com/api/conversations.history?channel=${channelId}&oldest=${oldest}&limit=${messageLimit}`,
          {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          }
        );

        const data = await response.json();
        if (!data.ok) throw new Error(data.error || "Slack API error fetching history");

        const payload = this.config.include_threads
          ? await this.includeThreadMessages(data.messages, channelId, tokens.access_token)
          : data.messages;

        results.push({
          raw_data_id: `raw_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          connection_id: this.connectionId,
          endpoint_id: `slack_channel_${channelId}`,
          raw_payload: payload,
          extracted_at: new Date().toISOString(),
          processed: false,
          mapped_to_audit_log: false,
          request_metadata: {
            endpoint_path: `/conversations.history/${channelId}`,
            response_status: 200,
            response_time_ms: 0,
          },
        });
      }

      return results;
    } catch (error: unknown) {
      const err = error as Error;
      return [
        {
          raw_data_id: `raw_error_${Date.now()}`,
          connection_id: this.connectionId,
          endpoint_id: 'slack_main',
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
  // INCLUDE THREADS (if enabled)
  // ==========================================
  private async includeThreadMessages(messages: any[], channelId: string, token: string): Promise<any[]> {
    const results = [...messages];
    const threadMessages: any[] = [];

    for (const msg of messages) {
      if (msg.thread_ts && msg.ts === msg.thread_ts) {
        const threadRes = await fetch(
          `https://slack.com/api/conversations.replies?channel=${channelId}&ts=${msg.thread_ts}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const threadData = await threadRes.json();
        if (threadData.ok && Array.isArray(threadData.messages)) {
          threadMessages.push(...threadData.messages);
        }
      }
    }

    return results.concat(threadMessages);
  }

  // ==========================================
  // MAP TO AUDIT LOGS
  // ==========================================
  mapToAuditLogs(rawData: RawPlatformData[]): AuditLog[] {
    const logs: AuditLog[] = [];

    for (const raw of rawData) {
      if (!Array.isArray(raw.raw_payload)) continue;

      for (const msg of raw.raw_payload as Record<string, any>[]) {
        const log = this.mapMessage(msg);
        if (log) logs.push(log);
      }
    }

    return logs;
  }

  private mapMessage(msg: Record<string, any>): AuditLog | null {
    if (!msg.user || !msg.text || !msg.ts) return null;

    const metadata = {
      channel: msg.channel || "unknown",
      thread: msg.thread_ts ? true : false,
      reactions: msg.reactions || [],
    };

    return {
      audit_id: `audit_slack_${msg.ts}`,
      actor_type: "user",
      actor_id: String(msg.user),
      action: "posted_message",
      target_table: "slack_messages",
      target_id: msg.ts,
      ts: new Date(Number(msg.ts) * 1000).toISOString(),
      diff_json: metadata,
    };
  }

  // ==========================================
  // FETCH PREVIEW (for ConnectorManager)
  // ==========================================
  async fetchPreview(limit: number = 10): Promise<DataPreview> {
    const data = await this.fetchData();
    const firstPayload = data[0]?.raw_payload as Record<string, any>[] || [];
    const sample = firstPayload.slice(0, limit);

    if (!sample.length) return { total_records: 0, sample_records: [], detected_fields: [] };

    const keys = new Set<string>();
    sample.forEach((m: Record<string, any>) =>
      Object.keys(m).forEach((k: string) => keys.add(k))
    );

    const detected_fields = Array.from(keys).map((key: string) => {
      const vals = sample
        .map((m: Record<string, any>) => m[key])
        .filter((v: unknown) => v !== null && v !== undefined);

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