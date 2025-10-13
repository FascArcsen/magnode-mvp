import {
  Organization,
  DepartmentWithMetrics,
  User,
  Platform,
  Insight,
  AuditLog
} from "@/types/database";

// ============================================================
// ORGANIZATION
// ============================================================
export const mockOrganization: Organization = {
  org_id: "org-001",
  name: "MagNode Fintech Corp",
  industry_code: "FINTECH",
  country_code: "US",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2025-10-13T00:00:00Z"
};

// ============================================================
// USER
// ============================================================
export const mockCurrentUser: User = {
  user_id: "user-001",
  org_id: "org-001",
  email: "carlos@magnode.io",
  name: "Carlos Herrera",
  status_code: "ACTIVE",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2025-10-13T00:00:00Z"
};

// ============================================================
// PLATFORMS
// ============================================================
export const mockPlatforms: Platform[] = [
  {
    platform_id: "plat-001",
    platform_name: "Stripe",
    category_code: "PAYMENTS",
    website_url: "https://stripe.com"
  },
  {
    platform_id: "plat-002",
    platform_name: "Plaid",
    category_code: "DATA_AGGREGATOR",
    website_url: "https://plaid.com"
  },
  {
    platform_id: "plat-003",
    platform_name: "HubSpot",
    category_code: "CRM",
    website_url: "https://hubspot.com"
  }
];

// ============================================================
// DEPARTMENTS
// ============================================================
export const mockDepartments: DepartmentWithMetrics[] = [
  {
    dept_id: "dept-001",
    org_id: "org-001",
    dept_name: "Sales",
    friction_score: 87,
    total_processes: 25,
    critical_processes: 8,
    status: "critical",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2025-10-13T00:00:00Z"
  },
  {
    dept_id: "dept-002",
    org_id: "org-001",
    dept_name: "Product",
    friction_score: 82,
    total_processes: 30,
    critical_processes: 6,
    status: "critical",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2025-10-12T00:00:00Z"
  },
  {
    dept_id: "dept-003",
    org_id: "org-001",
    dept_name: "Operations",
    friction_score: 79,
    total_processes: 40,
    critical_processes: 10,
    status: "critical",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2025-10-11T00:00:00Z"
  },
  {
    dept_id: "dept-004",
    org_id: "org-001",
    dept_name: "Support",
    friction_score: 85,
    total_processes: 20,
    critical_processes: 7,
    status: "critical",
    created_at: "2024-04-01T00:00:00Z",
    updated_at: "2025-10-10T00:00:00Z"
  },
  {
    dept_id: "dept-005",
    org_id: "org-001",
    dept_name: "Engineering",
    friction_score: 76,
    total_processes: 28,
    critical_processes: 5,
    status: "critical",
    created_at: "2024-05-01T00:00:00Z",
    updated_at: "2025-10-09T00:00:00Z"
  },
  {
    dept_id: "dept-006",
    org_id: "org-001",
    dept_name: "Compliance",
    friction_score: 92,
    total_processes: 35,
    critical_processes: 12,
    status: "critical",
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2025-10-08T00:00:00Z"
  },
  {
    dept_id: "dept-007",
    org_id: "org-001",
    dept_name: "Risk",
    friction_score: 88,
    total_processes: 22,
    critical_processes: 9,
    status: "critical",
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2025-10-07T00:00:00Z"
  },
  {
    dept_id: "dept-008",
    org_id: "org-001",
    dept_name: "Finance",
    friction_score: 54,
    total_processes: 15,
    critical_processes: 3,
    status: "warning",
    created_at: "2024-08-01T00:00:00Z",
    updated_at: "2025-10-06T00:00:00Z"
  },
  {
    dept_id: "dept-009",
    org_id: "org-001",
    dept_name: "Legal",
    friction_score: 71,
    total_processes: 10,
    critical_processes: 4,
    status: "critical",
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2025-10-05T00:00:00Z"
  }
];

// ============================================================
// INSIGHTS
// ============================================================
export const mockInsights: Insight[] = [
  {
    insight_id: "ins-001",
    org_id: "org-001",
    dept_id: "dept-004",
    severity: "critical",
    title: "Soporte excesivamente lento",
    detail:
      "Clientes reportan demoras mayores a 48h para respuestas y tickets sin cierre oportuno.",
    metric_code: "support_delay",
    created_at: "2025-10-10T10:00:00Z"
  },
  {
    insight_id: "ins-002",
    org_id: "org-001",
    dept_id: "dept-006",
    severity: "critical",
    title: "Bloqueo automático de cuentas sin aviso",
    detail:
      "Cuentas deshabilitadas por mecanismos antifraude sin explicación clara ni canal de apelación.",
    metric_code: "account_auto_block",
    created_at: "2025-10-09T18:30:00Z"
  },
  {
    insight_id: "ins-003",
    org_id: "org-001",
    dept_id: "dept-006",
    severity: "high",
    title: "Filtros antifraude demasiado agresivos",
    detail:
      "Transacciones legítimas rechazadas por políticas automáticas de detección de fraude.",
    metric_code: "fraud_false_positive",
    created_at: "2025-10-08T14:45:00Z"
  },
  {
    insight_id: "ins-004",
    org_id: "org-001",
    dept_id: "dept-001",
    severity: "high",
    title: "Errores de conciliación entre ventas y facturación",
    detail:
      "Discrepancias entre ventas declaradas y cobros procesados generan conflictos con Finance.",
    metric_code: "billing_discrepancy",
    created_at: "2025-10-07T11:20:00Z"
  },
  {
    insight_id: "ins-005",
    org_id: "org-001",
    dept_id: "dept-003",
    severity: "medium",
    title: "Retrasos en procesamiento de crédito",
    detail:
      "Procesos de evaluación manual provocan demoras del 25% sobre el estándar esperado.",
    metric_code: "credit_processing_delay",
    created_at: "2025-10-06T09:50:00Z"
  },
  {
    insight_id: "ins-006",
    org_id: "org-001",
    dept_id: "dept-008",
    severity: "medium",
    title: "Pagos interbancarios rechazados",
    detail:
      "Transferencias ACH fallan por discrepancias en validación de cuentas o errores de formato.",
    metric_code: "interbank_payment_failure",
    created_at: "2025-10-06T08:30:00Z"
  },
  {
    insight_id: "ins-007",
    org_id: "org-001",
    dept_id: "dept-008",
    severity: "low",
    title: "Errores menores en cálculo de comisiones",
    detail:
      "Se detectan redondeos inconsistentes y pequeños ajustes automáticos en comisiones.",
    metric_code: "commission_miscalculation",
    created_at: "2025-10-05T15:00:00Z"
  },
  {
    insight_id: "ins-008",
    org_id: "org-001",
    dept_id: "dept-005",
    severity: "low",
    title: "Automatización del pipeline CI/CD",
    detail:
      "El equipo de ingeniería redujo el tiempo de despliegue de 2h a 15min mediante CI/CD.",
    metric_code: "deployment_speedup",
    created_at: "2025-10-03T12:00:00Z"
  },
  {
    insight_id: "ins-009",
    org_id: "org-001",
    dept_id: "dept-002",
    severity: "low",
    title: "Alta adopción de módulo de analítica",
    detail:
      "70% del equipo adoptó el nuevo panel de análisis, incrementando visibilidad operativa.",
    metric_code: "feature_adoption",
    created_at: "2025-09-28T09:00:00Z"
  },
  {
    insight_id: "ins-010",
    org_id: "org-001",
    dept_id: "dept-003",
    severity: "low",
    title: "Reducción de errores humanos en conciliación",
    detail:
      "La automatización de reconciliaciones redujo en 80% los errores manuales en un mes.",
    metric_code: "reconciliation_automation",
    created_at: "2025-09-20T14:30:00Z"
  }
];

// ============================================================
// DASHBOARD METRICS MOCK
// ============================================================
export const mockDashboardMetrics = {
  new_customers: 12,
  open_tickets: 30,
  avg_response_time_hours: 1.6,
  global_efficiency_pct: 88,
  churn_rate_pct: 7,
  monthly_revenue_usd: 24000,
  processing_volume_gb: 60,
  token_usage: 200000
};

// ============================================================
// AUDIT LOG (nuevo módulo de historial de acciones)
// ============================================================
export const mockAuditLogs: AuditLog[] = [
  {
    audit_id: "audit-001",
    actor_type: "user",
    actor_id: "user-001",
    action: "created",
    target_table: "Scenario",
    target_id: "scn-101",
    ts: "2025-10-13T09:24:00Z",
    diff_json: { name: "Risk simulation v1", params: { p_success: 0.82 } }
  },
  {
    audit_id: "audit-002",
    actor_type: "system",
    actor_id: "mag-ai",
    action: "generated",
    target_table: "Insight",
    target_id: "ins-009",
    ts: "2025-10-13T09:30:00Z",
    diff_json: { severity: "medium", title: "Retrasos en conciliación detectados" }
  },
  {
    audit_id: "audit-003",
    actor_type: "user",
    actor_id: "user-001",
    action: "updated",
    target_table: "Department",
    target_id: "dept-004",
    ts: "2025-10-13T10:05:00Z",
    diff_json: { friction_score: { old: 85, new: 79 } }
  },
  {
    audit_id: "audit-004",
    actor_type: "user",
    actor_id: "user-002",
    action: "deleted",
    target_table: "Scenario",
    target_id: "scn-087",
    ts: "2025-10-13T10:40:00Z",
    diff_json: { reason: "outdated scenario" }
  },
  {
    audit_id: "audit-005",
    actor_type: "system",
    actor_id: "magnode-engine",
    action: "executed",
    target_table: "SimulationRun",
    target_id: "run-222",
    ts: "2025-10-13T11:05:00Z",
    diff_json: { success: true, cost_estimate: 0.43 }
  }
];