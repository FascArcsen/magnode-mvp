// ==========================================
// CORE TYPES - Sistema de Conectores MagNode
// ==========================================

// ==========================================
// 1. PLATFORM CONNECTION (Tabla principal)
// ==========================================

export type PlatformType = 'pre_built' | 'universal' | 'llm_assisted';
export type AuthType = 'api_key' | 'bearer' | 'oauth2' | 'basic' | 'custom';
export type ConnectionStatus = 'active' | 'error' | 'disconnected' | 'testing';

export interface PlatformConnection {
  connection_id: string;
  org_id: string;
  platform_type: PlatformType;
  platform_name: string;
  platform_display_name?: string; // Nombre amigable

  // Autenticación
  auth_config: AuthConfig;

  // Configuración del conector
  connector_config: UniversalAPIConfig | PreBuiltConfig;

  // Estado y sincronización
  status: ConnectionStatus;
  last_sync_at?: string;
  last_sync_status?: 'success' | 'partial' | 'failed';
  next_sync_at?: string;
  sync_frequency_minutes: number; // 15, 30, 60, etc.

  // Metadata
  total_records_synced: number;
  total_audit_logs_created: number;
  error_message?: string;

  created_at: string;
  updated_at: string;
}

// ==========================================
// 2. AUTENTICACIÓN (versión segura)
// ==========================================

export interface AuthConfig {
  type: AuthType;

  // Para autenticación directa (api_key, bearer, basic)
  credentials?: {
    api_key?: string;
    token?: string;
    username?: string;
    password?: string;
    [key: string]: string | undefined;
  };

  // Para OAuth2 (autenticación externa)
  oauth_config?: OAuthConfig;

  /**
   * 🆕 Referencia al registro seguro de credenciales cifradas.
   * El OAuthManager la usa para recuperar tokens válidos desde BD.
   */
  credential_ref_id?: string;

  // Headers personalizados adicionales
  custom_headers?: Record<string, string>;
}

export interface OAuthConfig {
  client_id: string;
  client_secret?: string;
  authorization_url: string;
  token_url: string;
  redirect_uri: string;
  scope?: string[];

  /**
   * 🆕 Tokens temporales usados antes de guardarse de forma segura.
   * No deben almacenarse en producción ni en BD.
   */
  transient_tokens?: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: string;
  };
}

/**
 * 🆕 Registro seguro de credenciales (para tabla o KV storage).
 * Tipado compatible con Prisma u ORM similar.
 */
export interface SecureCredentialRecord {
  credential_ref_id: string;
  connection_id: string;
  provider: string; // Ej: "google", "slack", "github"
  access_token_encrypted: string;
  refresh_token_encrypted?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 3. CONECTOR UNIVERSAL (El más importante)
// ==========================================

export interface UniversalAPIConfig {
  base_url: string;

  // Configuración global de headers
  global_headers?: Record<string, string>;

  // Endpoints a consultar
  endpoints: APIEndpoint[];

  // Mapeo de datos
  data_mapping: DataMapping;

  // Rate limiting
  rate_limit?: RateLimitConfig;

  // Retry strategy
  retry_config?: RetryConfig;
}

export interface APIEndpoint {
  endpoint_id: string;
  name: string; // "User Actions", "Deals", "Events"
  description?: string;

  // Request
  path: string; // "/api/v1/events"
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  // Query params
  query_params?: Record<string, any>;

  // Body para POST/PUT
  request_body?: Record<string, any>;

  // Headers específicos del endpoint
  headers?: Record<string, string>;

  // Paginación
  pagination?: PaginationConfig;

  // Donde están los datos en la respuesta
  response_data_path: string; // JSONPath: "data.results" o "events" o "$"

  // Filtros de tiempo (para sincronización incremental)
  time_filter?: {
    param_name: string; // "since", "from_date", "after"
    param_type: 'query' | 'body';
    date_format: string; // "ISO8601", "UNIX", "YYYY-MM-DD"
  };
}

export interface PaginationConfig {
  type: 'offset' | 'cursor' | 'page' | 'link_header' | 'none';

  // Para offset/page
  page_param?: string; // "page", "offset"
  size_param?: string; // "limit", "per_page"
  page_size: number;

  // Para cursor
  cursor_param?: string; // "cursor", "next_token"
  cursor_path?: string; // JSONPath al cursor en respuesta: "pagination.next_cursor"

  // Para link header (GitHub style)
  link_header_name?: string; // "Link"

  // Límites de seguridad
  max_pages?: number;
  max_total_records?: number;
}

export interface RateLimitConfig {
  requests_per_minute: number;
  requests_per_hour?: number;
  concurrent_requests: number; // Cuántas requests simultáneas

  // Estrategia al llegar al límite
  strategy: 'wait' | 'skip' | 'error';
}

export interface RetryConfig {
  max_retries: number;
  strategy: 'exponential' | 'linear' | 'fixed';
  initial_delay_ms: number;
  max_delay_ms: number;
  retry_on_status_codes?: number[]; // [429, 500, 502, 503]
}

// ==========================================
// 4. MAPEO DE DATOS (Crítico)
// ==========================================

export interface DataMapping {
  required_fields: {
    id: FieldMapping;
    timestamp: FieldMapping;
    actor: FieldMapping;
    action: FieldMapping;
  };

  optional_fields?: {
    target?: FieldMapping;
    target_type?: FieldMapping;
    department?: FieldMapping;
    metadata?: FieldMapping;
    description?: FieldMapping;
    status?: FieldMapping;
    [key: string]: FieldMapping | undefined;
  };

  transformations?: FieldTransformation[];
  filters?: DataFilter[];
}

export interface FieldMapping {
  source_path: string;
  data_type: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
  transform?: FieldTransform;
  default_value?: any;
  validation?: FieldValidation;
  required?: boolean;
}

export interface FieldTransform {
  type:
    | 'lowercase'
    | 'uppercase'
    | 'trim'
    | 'parse_date'
    | 'parse_json'
    | 'extract_domain'
    | 'custom';
  date_format?: string;
  extract_type?: 'domain' | 'username';
  custom_function?: string;
}

export interface FieldValidation {
  required: boolean;
  regex?: string;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  allowed_values?: any[];
}

export interface FieldTransformation {
  transformation_id: string;
  name: string;
  description?: string;
  source_fields: string[];
  target_field: string;
  logic: 'concat' | 'sum' | 'avg' | 'join' | 'split' | 'custom';
  params?: {
    separator?: string;
    default_value?: any;
    custom_function?: string;
  };
}

export interface DataFilter {
  filter_id: string;
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in'
    | 'exists'
    | 'not_exists';
  value: any;
  logic?: 'AND' | 'OR';
}

// ==========================================
// 5. CONECTORES PRE-CONSTRUIDOS
// ==========================================

export type PreBuiltConnectorType =
  | 'google_sheets'
  | 'slack'
  | 'google_drive'
  | 'gmail'
  | 'github'
  | 'jira'
  | 'asana'
  | 'linear'
  | 'notion'
  | 'trello'
  | 'hubspot'
  | 'salesforce'
  | 'zendesk';

export interface PreBuiltConfig {
  connector_type: PreBuiltConnectorType;
  settings: Record<string, any>;
  custom_mapping?: Partial<DataMapping>;
}

// ==========================================
// 6. DATOS EXTRAÍDOS (Raw data storage)
// ==========================================

export interface RawPlatformData {
  raw_data_id: string;
  connection_id: string;
  endpoint_id: string;
  raw_payload: any;
  extracted_at: string;
  source_timestamp?: string;
  processed: boolean;
  mapped_to_audit_log: boolean;
  audit_log_ids?: string[];
  processing_errors?: ProcessingError[];
  request_metadata?: {
    endpoint_path: string;
    query_params?: Record<string, any>;
    response_status: number;
    response_time_ms: number;
  };
}

export interface ProcessingError {
  error_id: string;
  error_type: 'mapping' | 'validation' | 'transformation' | 'unknown';
  error_message: string;
  field_path?: string;
  occurred_at: string;
}

// ==========================================
// 7. LLM ASSISTANCE
// ==========================================

export interface LLMAssistedConfig {
  config_id: string;
  connection_id?: string;
  input: {
    api_documentation?: string;
    base_url: string;
    sample_response?: string;
    api_description?: string;
  };
  suggested_config: UniversalAPIConfig;
  confidence_score: number;
  warnings?: string[];
  suggestions?: string[];
  status: 'pending' | 'generated' | 'approved' | 'rejected';
  user_approved: boolean;
  user_modifications?: Partial<UniversalAPIConfig>;
  generated_at: string;
  llm_model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
}

// ==========================================
// 8. RESULTADOS DE SINCRONIZACIÓN
// ==========================================

export interface SyncResult {
  sync_id: string;
  connection_id: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  status: 'running' | 'completed' | 'partial' | 'failed';
  stats: {
    endpoints_synced: number;
    total_records_fetched: number;
    total_records_processed: number;
    audit_logs_created: number;
    errors_count: number;
  };
  errors?: SyncError[];
  next_sync_at?: string;
}

export interface SyncError {
  error_id: string;
  endpoint_id?: string;
  error_type:
    | 'connection'
    | 'authentication'
    | 'rate_limit'
    | 'parsing'
    | 'mapping'
    | 'unknown';
  error_message: string;
  occurred_at: string;
  retryable: boolean;
}

// ==========================================
// 9. UTILIDADES Y HELPERS
// ==========================================

export interface ConnectorMetadata {
  connector_type: PreBuiltConnectorType | 'universal';
  display_name: string;
  description: string;
  icon_url?: string;
  documentation_url?: string;
  required_fields: ConfigField[];
  optional_fields: ConfigField[];
  capabilities: {
    supports_pagination: boolean;
    supports_incremental_sync: boolean;
    supports_webhooks: boolean;
    max_lookback_days?: number;
  };
}

export interface ConfigField {
  field_name: string;
  display_name: string;
  field_type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'select'
    | 'multiselect'
    | 'secret';
  description?: string;
  placeholder?: string;
  default_value?: any;
  options?: { label: string; value: any }[];
  validation?: FieldValidation;
}

// ==========================================
// 10. RESPONSES (Para UI)
// ==========================================

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    can_authenticate: boolean;
    endpoints_reachable: number;
    sample_data_count?: number;
    sample_records?: any[];
  };
  errors?: string[];
}

export interface DataPreview {
  total_records: number;
  sample_records: any[];
  detected_fields: {
    field_name: string;
    data_type: string;
    sample_values: any[];
    null_count: number;
  }[];
  suggested_mapping?: Partial<DataMapping>;
}
