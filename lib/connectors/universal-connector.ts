import type {
  UniversalAPIConfig,
  APIEndpoint,
  AuthConfig,
  DataMapping,
  FieldMapping,
  RawPlatformData,
  ConnectionTestResult,
  FieldTransform,
  FieldValidation
} from '@/types/connectors';
import type { AuditLog } from '@/types/database';
import { JSONPath } from 'jsonpath-plus';

// ==========================================
// UNIVERSAL CONNECTOR - El corazón del sistema
// ==========================================

export class UniversalConnector {
  private config: UniversalAPIConfig;
  private authConfig: AuthConfig;
  private connectionId: string;

  // Rate limiting state
  private requestCount = 0;
  private windowStart = Date.now();
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  constructor(config: UniversalAPIConfig, authConfig: AuthConfig, connectionId: string) {
    this.config = config;
    this.authConfig = authConfig;
    this.connectionId = connectionId;
  }

  // ==========================================
  // TEST CONNECTION
  // ==========================================

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const results = await Promise.allSettled(
        this.config.endpoints.slice(0, 3).map(endpoint => 
          this.fetchEndpoint(endpoint, { limit: 1 })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected');

      return {
        success: successful > 0,
        message: successful === results.length 
          ? 'All endpoints reachable' 
          : `${successful}/${results.length} endpoints reachable`,
        details: {
          can_authenticate: successful > 0,
          endpoints_reachable: successful,
          sample_data_count: successful > 0 ? 1 : 0
        },
        errors: failed.map((r: PromiseRejectedResult) => r.reason?.message || 'Unknown error')
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        message: 'Connection test failed',
        errors: [err.message]
      };
    }
  }

  // ==========================================
  // FETCH DATA (Main method)
  // ==========================================

  async fetchData(since?: Date): Promise<RawPlatformData[]> {
    const allRawData: RawPlatformData[] = [];

    for (const endpoint of this.config.endpoints) {
      try {
        const records = await this.fetchEndpoint(endpoint, { since });
        
        // Guardar raw data
        const rawData: RawPlatformData = {
          raw_data_id: `raw_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          connection_id: this.connectionId,
          endpoint_id: endpoint.endpoint_id,
          raw_payload: records,
          extracted_at: new Date().toISOString(),
          processed: false,
          mapped_to_audit_log: false,
          request_metadata: {
            endpoint_path: endpoint.path,
            query_params: endpoint.query_params,
            response_status: 200,
            response_time_ms: 0
          }
        };

        allRawData.push(rawData);
      } catch (error: unknown) {
        const err = error as Error;
        console.error(`Error fetching endpoint ${endpoint.name}:`, err);
        
        // Guardar error
        allRawData.push({
          raw_data_id: `raw_error_${Date.now()}`,
          connection_id: this.connectionId,
          endpoint_id: endpoint.endpoint_id,
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
        });
      }
    }

    return allRawData;
  }

  // ==========================================
  // FETCH SINGLE ENDPOINT
  // ==========================================

  private async fetchEndpoint(
    endpoint: APIEndpoint, 
    options: { since?: Date; limit?: number } = {}
  ): Promise<any[]> {
    const url = new URL(endpoint.path, this.config.base_url);
    
    // Add query params
    if (endpoint.query_params) {
      Object.entries(endpoint.query_params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Add time filter if incremental sync
    if (options.since && endpoint.time_filter) {
      const formattedDate = this.formatDate(options.since, endpoint.time_filter.date_format);
      
      if (endpoint.time_filter.param_type === 'query') {
        url.searchParams.append(endpoint.time_filter.param_name, formattedDate);
      }
    }

    // Handle pagination
    if (!endpoint.pagination || endpoint.pagination.type === 'none') {
      const data = await this.makeRequest(url.toString(), endpoint);
      return this.extractDataFromResponse(data, endpoint.response_data_path);
    }

    return this.fetchPaginated(url, endpoint, options.limit);
  }

  // ==========================================
  // PAGINATION HANDLER
  // ==========================================

  private async fetchPaginated(
    baseUrl: URL, 
    endpoint: APIEndpoint, 
    limit?: number
  ): Promise<any[]> {
    const pagination = endpoint.pagination!;
    const allRecords: any[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(baseUrl.toString());

      // Add pagination params
      if (pagination.type === 'offset') {
        const offset = (currentPage - 1) * pagination.page_size;
        url.searchParams.set(pagination.page_param || 'offset', String(offset));
        url.searchParams.set(pagination.size_param || 'limit', String(pagination.page_size));
      } else if (pagination.type === 'page') {
        url.searchParams.set(pagination.page_param || 'page', String(currentPage));
        url.searchParams.set(pagination.size_param || 'per_page', String(pagination.page_size));
      }

      const response = await this.makeRequest(url.toString(), endpoint);
      const records = this.extractDataFromResponse(response, endpoint.response_data_path);

      if (records.length === 0) {
        hasMore = false;
      } else {
        allRecords.push(...records);
        currentPage++;

        // Check limits
        if (pagination.max_pages && currentPage > pagination.max_pages) hasMore = false;
        if (pagination.max_total_records && allRecords.length >= pagination.max_total_records) {
          hasMore = false;
          allRecords.splice(pagination.max_total_records);
        }
        if (limit && allRecords.length >= limit) {
          hasMore = false;
          allRecords.splice(limit);
        }
        if (records.length < pagination.page_size) hasMore = false;
      }

      // Handle cursor pagination
      if (pagination.type === 'cursor' && pagination.cursor_path) {
        const nextCursor = JSONPath({ path: pagination.cursor_path, json: response })[0];
        if (!nextCursor) {
          hasMore = false;
        } else {
          baseUrl.searchParams.set(pagination.cursor_param || 'cursor', nextCursor);
        }
      }
    }

    return allRecords;
  }

  // ==========================================
  // MAKE HTTP REQUEST (with rate limiting)
  // ==========================================

  private async makeRequest(url: string, endpoint: APIEndpoint): Promise<any> {
    return this.rateLimitedRequest(async () => {
      const headers = this.buildHeaders(endpoint);
      
      const options: RequestInit = {
        method: endpoint.method,
        headers
      };

      if (endpoint.method !== 'GET' && endpoint.request_body) {
        options.body = JSON.stringify(endpoint.request_body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }

  // ==========================================
  // RATE LIMITING
  // ==========================================

  private async rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.config.rate_limit) {
      return fn();
    }

    const { requests_per_minute } = this.config.rate_limit;
    const now = Date.now();
    const windowDuration = 60 * 1000; // 1 minute

    // Reset window if needed
    if (now - this.windowStart > windowDuration) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // Check if we're at limit
    if (this.requestCount >= requests_per_minute) {
      const waitTime = windowDuration - (now - this.windowStart);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
    return fn();
  }

  // ==========================================
  // BUILD HEADERS
  // ==========================================

  private buildHeaders(endpoint: APIEndpoint): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.config.global_headers || {}),
      ...(endpoint.headers || {})
    };

    // Add authentication
    const { type, credentials, custom_headers } = this.authConfig;

    if (type === 'api_key' && credentials?.api_key) {
      headers['X-API-Key'] = credentials.api_key;
    } else if (type === 'bearer' && credentials?.token) {
      headers['Authorization'] = `Bearer ${credentials.token}`;
    } else if (type === 'basic' && credentials?.username && credentials?.password) {
      const encoded = btoa(`${credentials.username}:${credentials.password}`);
      headers['Authorization'] = `Basic ${encoded}`;
    }

    if (custom_headers) {
      Object.assign(headers, custom_headers);
    }

    return headers;
  }

  // ==========================================
  // EXTRACT DATA FROM RESPONSE
  // ==========================================

  private extractDataFromResponse(response: any, dataPath: string): any[] {
    if (dataPath === '$' || dataPath === '') {
      return Array.isArray(response) ? response : [response];
    }

    try {
      const extracted = JSONPath({ path: dataPath, json: response });
      return Array.isArray(extracted[0]) ? extracted[0] : extracted;
    } catch (error: unknown) {
      console.error('Error extracting data with JSONPath:', error);
      return [];
    }
  }

  // ==========================================
  // MAP TO AUDIT LOGS
  // ==========================================

  mapToAuditLogs(rawData: RawPlatformData[]): AuditLog[] {
    const auditLogs: AuditLog[] = [];

    for (const raw of rawData) {
      if (!raw.raw_payload || !Array.isArray(raw.raw_payload)) continue;

      for (const record of raw.raw_payload) {
        try {
          const auditLog = this.mapSingleRecord(record);
          if (auditLog) {
            auditLogs.push(auditLog);
          }
        } catch (error: unknown) {
          const err = error as Error;
          console.error('Error mapping record:', err);
          if (!raw.processing_errors) raw.processing_errors = [];
          raw.processing_errors.push({
            error_id: `map_err_${Date.now()}`,
            error_type: 'mapping',
            error_message: err.message,
            occurred_at: new Date().toISOString()
          });
        }
      }
    }

    return auditLogs;
  }

  private mapSingleRecord(record: any): AuditLog | null {
    const mapping = this.config.data_mapping;

    // Extract required fields
    const id = this.extractField(record, mapping.required_fields.id);
    const timestamp = this.extractField(record, mapping.required_fields.timestamp);
    const actor = this.extractField(record, mapping.required_fields.actor);
    const action = this.extractField(record, mapping.required_fields.action);

    if (!id || !timestamp || !actor || !action) {
      console.warn('Missing required fields:', { id, timestamp, actor, action });
      return null;
    }

    // Extract optional fields
    const optionalFields = mapping.optional_fields || {};
    const target = optionalFields.target ? this.extractField(record, optionalFields.target) : undefined;
    const department = optionalFields.department ? this.extractField(record, optionalFields.department) : undefined;
    const metadata = optionalFields.metadata ? this.extractField(record, optionalFields.metadata) : undefined;

    return {
      audit_id: `audit_${this.connectionId}_${id}`,
      actor_type: 'user',
      actor_id: String(actor),
      action: String(action),
      target_table: target ? 'resource' : 'unknown',
      target_id: target ? String(target) : 'unknown',
      ts: new Date(timestamp).toISOString(),
      diff_json: metadata || record
    };
  }

  // ==========================================
  // EXTRACT FIELD (with JSONPath and transforms)
  // ==========================================

  private extractField(record: any, mapping: FieldMapping): any {
    try {
      // Extract using JSONPath
      let value = JSONPath({ path: mapping.source_path, json: record })[0];

      // Use default if not found
      if (value === undefined || value === null) {
        value = mapping.default_value;
      }

      // Apply transformation
      if (value !== undefined && mapping.transform) {
        value = this.transformValue(value, mapping.transform);
      }

      // Validate
      if (mapping.validation && !this.validateField(value, mapping.validation)) {
        throw new Error(`Validation failed for field ${mapping.source_path}`);
      }

      return value;
    } catch (error: unknown) {
      const err = error as Error;
      if (mapping.required) {
        throw new Error(`Required field ${mapping.source_path} not found: ${err.message}`);
      }
      return mapping.default_value;
    }
  }

  private transformValue(value: any, transform: FieldTransform): any {
    switch (transform.type) {
      case 'lowercase':
        return String(value).toLowerCase();
      case 'uppercase':
        return String(value).toUpperCase();
      case 'trim':
        return String(value).trim();
      case 'parse_date':
        return new Date(value).toISOString();
      case 'parse_json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'extract_domain':
        const email = String(value);
        return transform.extract_type === 'domain' 
          ? email.split('@')[1] 
          : email.split('@')[0];
      default:
        return value;
    }
  }

  private validateField(value: any, validation: FieldValidation): boolean {
    if (validation.required && (value === null || value === undefined)) {
      return false;
    }
    if (validation.regex && !new RegExp(validation.regex).test(String(value))) {
      return false;
    }
    return true;
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  private formatDate(date: Date, format: string): string {
    switch (format) {
      case 'ISO8601':
        return date.toISOString();
      case 'UNIX':
        return String(Math.floor(date.getTime() / 1000));
      case 'YYYY-MM-DD':
        return date.toISOString().split('T')[0];
      default:
        return date.toISOString();
    }
  }
}