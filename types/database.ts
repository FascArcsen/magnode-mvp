// ==========================================
// DATABASE TYPES - MagNode MVP
// ==========================================

export interface Organization {
  org_id: string;
  name: string;
  industry_code: string;
  country_code: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// USERS & ROLES
// ==========================================

export interface User {
  user_id: string;
  org_id: string;
  email: string;
  name: string;
  status_code: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

// ==========================================
// DEPARTMENTS
// ==========================================

export interface Department {
  dept_id: string;
  org_id: string;
  dept_name: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentWithMetrics extends Department {
  friction_score: number;
  total_processes: number;
  critical_processes: number;
  status: 'healthy' | 'warning' | 'critical';
}

// ==========================================
// PLATFORMS & INTEGRATIONS
// ==========================================

export interface Platform {
  platform_id: string;
  platform_name: string;
  category_code: string;
  website_url?: string;
}

export interface DeptIntegration {
  integration_id: string;
  dept_id: string;
  platform_id: string;
  auth_type: string;
  vault_secret_ref: string;
  scopes: string;
  connected_at: string;
  status_code: 'active' | 'inactive' | 'error';
  last_health_check_at: string;
  rate_limit_hint: number;
}

// ==========================================
// METRICS & INSIGHTS
// ==========================================

export interface Insight {
  insight_id: string;
  org_id: string;
  dept_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detail: string;
  metric_code?: string;
  created_at: string;
}

export interface MetricDefinition {
  metric_code: string;
  name: string;
  definition_sql_or_json: string;
  unit_code: string;
  window: string;
  threshold_warn: number;
  threshold_crit: number;
  owner_user_id: string;
  is_primary: boolean;
  valid_from: string;
  valid_to?: string;
}

export interface MetricValue {
  metric_value_id: string;
  metric_code: string;
  org_id: string;
  dept_id: string;
  ts: string;
  value: number;
  source_run_id?: string;
}

// ==========================================
// AUDIT LOGS
// ==========================================

export interface AuditLog {
  audit_id: string;
  actor_type: string;
  actor_id: string;
  action: string;
  target_table: string;
  target_id: string;
  ts: string;
  diff_json: Record<string, any>;
}

// ==========================================
// SIMULATIONS & SCENARIOS
// ==========================================

export interface Scenario {
  scenario_id: string;
  org_id: string;
  dept_id?: string;
  name: string;
  hypothesis_json: Record<string, any>;
  created_by: string;
  created_at: string;
  status_code: 'draft' | 'running' | 'completed' | 'failed';
}

export interface SimulationRun {
  run_id: string;
  scenario_id: string;
  started_at: string;
  ended_at?: string;
  engine: string;
  params_json: Record<string, any>;
  result_json?: Record<string, any>;
  success: boolean;
  p_success: number;
  cost_estimate: number;
}

// ==========================================
// PROCESS SUMMARY
// ==========================================

export interface ProcessSummary {
  process_key: string;
  name: string;
  from_dept: string;
  to_dept: string;
  avg_time_hours: number;
  handoff_count: number;
  completion_rate: number;
  status: 'healthy' | 'warning' | 'critical';
  user_complaint?: string;
}

// ==========================================
// EXPORTS
// ==========================================

export type {
  Organization as Org,
  DepartmentWithMetrics as DeptMetrics,
  Insight as InsightRecord,
  AuditLog as AuditRecord
};