// Generated from ERD schema
export interface Organization {
  org_id: string;
  name: string;
  industry_code: string;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  dept_id: string;
  org_id: string;
  dept_name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  org_id: string;
  email: string;
  name: string;
  status_code: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  role_code: string;
  name: string;
  description: string;
}

export interface UserRole {
  user_id: string;
  role_code: string;
  scope_org_id: string;
  scope_dept_id?: string;
  granted_at: string;
}

export interface Platform {
  platform_id: string;
  platform_name: string;
  category_code: string;
  website_url: string;
}

export interface DeptIntegration {
  integration_id: string;
  dept_id: string;
  platform_id: string;
  auth_type: string;
  vault_secret_ref: string;
  scopes: string;
  connected_at: string;
  status_code: string;
  last_health_check_at: string;
  rate_limit_hint: number;
}

export interface ProcessEvent {
  event_id: string;
  org_id: string;
  dept_id: string;
  integration_id: string;
  process_key: string;
  case_id: string;
  step: string;
  actor_type: string;
  event_ts: string;
  payload_json: Record<string, any>;
  ingest_at: string;
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

export interface Scenario {
  scenario_id: string;
  org_id: string;
  dept_id?: string;
  name: string;
  hypothesis_json: Record<string, any>;
  created_by: string;
  created_at: string;
  status_code: string;
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

export interface Insight {
  insight_id: string;
  org_id: string;
  dept_id?: string;
  source_run_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detail: string;
  metric_code?: string;
  created_at: string;
}

export interface Recommendation {
  rec_id: string;
  insight_id: string;
  type_code: string;
  action_json: Record<string, any>;
  expected_impact: Record<string, any>;
  p_success: number;
  created_at: string;
}

export interface Action {
  action_id: string;
  rec_id: string;
  action_type: string;
  target_ref: string;
  applied_by: string;
  applied_at: string;
  status_code: string;
  rollback_ref?: string;
}

export interface Recipe {
  recipe_id: string;
  sector_code: string;
  dept_template_json: Record<string, any>;
  default_metrics_json: Record<string, any>;
  default_panels_json: Record<string, any>;
  min_required_integrations_json: Record<string, any>;
  valid_from: string;
  valid_to?: string;
}

export interface Playbook {
  playbook_id: string;
  title: string;
  steps_json: Record<string, any>;
  owner_role: string;
  est_effort_hours: number;
  valid_from: string;
  valid_to?: string;
}

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

// Extended types for frontend use
export interface DepartmentWithMetrics extends Department {
  friction_score: number;
  total_processes: number;
  critical_processes: number;
  status: 'healthy' | 'warning' | 'critical';
}

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