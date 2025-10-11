import { 
  Organization, 
  Department, 
  User,
  Platform,
  Insight,
  DepartmentWithMetrics 
} from '@/types/database';

export const mockOrganization: Organization = {
  org_id: 'org-001',
  name: 'Google Business Unit',
  industry_code: 'TECH',
  country_code: 'US',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2025-10-11T00:00:00Z'
};

export const mockCurrentUser: User = {
  user_id: 'user-001',
  org_id: 'org-001',
  email: 'carlos@google.com',
  name: 'Carlos',
  status_code: 'ACTIVE',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2025-10-11T00:00:00Z'
};

export const mockDepartments: DepartmentWithMetrics[] = [
  {
    dept_id: 'dept-001',
    org_id: 'org-001',
    dept_name: 'Sales',
    friction_score: 87,
    total_processes: 12,
    critical_processes: 4,
    status: 'critical',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-10-11T00:00:00Z'
  },
  {
    dept_id: 'dept-002',
    org_id: 'org-001',
    dept_name: 'Product',
    friction_score: 82,
    total_processes: 15,
    critical_processes: 3,
    status: 'critical',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-10-11T00:00:00Z'
  },
  {
    dept_id: 'dept-003',
    org_id: 'org-001',
    dept_name: 'Operations',
    friction_score: 79,
    total_processes: 18,
    critical_processes: 5,
    status: 'critical',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-10-11T00:00:00Z'
  },
  {
    dept_id: 'dept-004',
    org_id: 'org-001',
    dept_name: 'Support',
    friction_score: 85,
    total_processes: 10,
    critical_processes: 3,
    status: 'critical',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-10-11T00:00:00Z'
  },
  {
    dept_id: 'dept-005',
    org_id: 'org-001',
    dept_name: 'Engineering',
    friction_score: 76,
    total_processes: 14,
    critical_processes: 2,
    status: 'critical',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-10-11T00:00:00Z'
  },
  {
    dept_id: 'dept-006',
    org_id: 'org-001',
    dept_name: 'Legal',
    friction_score: 71,
    total_processes: 8,
    critical_processes: 2,
    status: 'critical',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-10-11T00:00:00Z'
  },
  {
    dept_id: 'dept-007',
    org_id: 'org-001',
    dept_name: 'Finance',
    friction_score: 54,
    total_processes: 6,
    critical_processes: 0,
    status: 'warning',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-10-11T00:00:00Z'
  }
];

export const mockInsights: Insight[] = [
  {
    insight_id: 'ins-001',
    org_id: 'org-001',
    dept_id: 'dept-003',
    severity: 'high',
    title: 'Tiempo de entrega en pedidos tardío',
    detail: 'El departamento de Operations está experimentando retrasos de 18% en delivery time debido a asignación ineficiente de turnos.',
    metric_code: 'delivery_time',
    created_at: '2025-08-22T00:00:00Z'
  },
  {
    insight_id: 'ins-002',
    org_id: 'org-001',
    dept_id: 'dept-001',
    severity: 'critical',
    title: 'Control Insuficiente en el proceso de Billing',
    detail: 'Se detectaron múltiples errores en el proceso de facturación entre Sales y Finance.',
    metric_code: 'billing_errors',
    created_at: '2025-08-25T00:00:00Z'
  }
];

export const mockDashboardMetrics = {
  newCustomers: 8,
  csat: 8,
  productSold: 5,
  totalOrder: 300,
  totalSales: 1000,
  fulfillmentRate: 1000,
  deliveryTime: 300
};