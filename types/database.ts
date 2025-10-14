// lib/mock-data.ts - Mock data for MagNode MVP
export const mockOrganization = {
  org_id: 'org-001',
  org_name: 'TechCorp Inc.',
  industry: 'Technology',
  size: '150-200 employees',
  created_at: '2024-01-01T00:00:00Z'
};

// ==========================================
// PLATFORM CONNECTIONS
// ==========================================

export const mockPlatformConnections = [
  {
    connection_id: 'conn-001',
    org_id: 'org-001',
    platform_type: 'pre_built' as const,
    platform_name: 'Google Sheets',
    platform_display_name: 'Activity Tracker Sheet',
    auth_config: {
      type: 'bearer' as const,
      credentials: { token: 'mock_token_123' }
    },
    connector_config: {
      connector_type: 'google_sheets' as const,
      settings: {
        spreadsheet_id: '1abc123',
        sheet_name: 'Activity Log',
        header_row: 1,
        columns: {
          id_column: 'ID',
          timestamp_column: 'Timestamp',
          actor_column: 'User Email',
          action_column: 'Action Type',
          department_column: 'Department'
        }
      }
    },
    status: 'active' as const,
    last_sync_at: '2025-10-14T10:30:00Z',
    last_sync_status: 'success' as const,
    next_sync_at: '2025-10-14T11:30:00Z',
    sync_frequency_minutes: 60,
    total_records_synced: 1247,
    total_audit_logs_created: 1247,
    created_at: '2025-10-01T00:00:00Z',
    updated_at: '2025-10-14T10:30:00Z'
  },
  {
    connection_id: 'conn-002',
    org_id: 'org-001',
    platform_type: 'universal' as const,
    platform_name: 'Internal CRM',
    platform_display_name: 'SalesPro CRM',
    auth_config: {
      type: 'api_key' as const,
      credentials: { api_key: 'sk_test_xyz789' }
    },
    connector_config: {
      base_url: 'https://api.salespro.internal',
      endpoints: [
        {
          endpoint_id: 'deals_endpoint',
          name: 'Deal Activities',
          path: '/v1/activities',
          method: 'GET' as const,
          response_data_path: '$.data',
          pagination: {
            type: 'offset' as const,
            page_param: 'offset',
            size_param: 'limit',
            page_size: 100,
            max_pages: 50
          }
        }
      ],
      data_mapping: {
        required_fields: {
          id: { source_path: '$.id', data_type: 'string' as const, required: true },
          timestamp: { source_path: '$.created_at', data_type: 'date' as const, required: true },
          actor: { source_path: '$.user.email', data_type: 'string' as const, required: true },
          action: { source_path: '$.activity_type', data_type: 'string' as const, required: true }
        }
      }
    },
    status: 'active' as const,
    last_sync_at: '2025-10-14T09:15:00Z',
    last_sync_status: 'success' as const,
    next_sync_at: '2025-10-14T10:15:00Z',
    sync_frequency_minutes: 60,
    total_records_synced: 3891,
    total_audit_logs_created: 3891,
    created_at: '2025-10-05T00:00:00Z',
    updated_at: '2025-10-14T09:15:00Z'
  },
  {
    connection_id: 'conn-003',
    org_id: 'org-001',
    platform_type: 'llm_assisted' as const,
    platform_name: 'ProjectHub API',
    platform_display_name: 'Project Management Hub',
    auth_config: {
      type: 'bearer' as const,
      credentials: { token: 'Bearer_abc456' }
    },
    connector_config: {
      base_url: 'https://api.projecthub.com',
      endpoints: [
        {
          endpoint_id: 'tasks_endpoint',
          name: 'Task Events',
          path: '/api/v2/events',
          method: 'GET' as const,
          response_data_path: '$.events',
          pagination: {
            type: 'cursor' as const,
            cursor_param: 'cursor',
            cursor_path: '$.meta.next_cursor',
            page_size: 50,
            max_pages: 100
          }
        }
      ],
      data_mapping: {
        required_fields: {
          id: { source_path: '$.event_id', data_type: 'string' as const, required: true },
          timestamp: { source_path: '$.timestamp', data_type: 'date' as const, required: true },
          actor: { source_path: '$.actor.email', data_type: 'string' as const, required: true },
          action: { source_path: '$.action', data_type: 'string' as const, required: true }
        }
      }
    },
    status: 'error' as const,
    last_sync_at: '2025-10-13T18:45:00Z',
    last_sync_status: 'failed' as const,
    error_message: 'Authentication token expired',
    sync_frequency_minutes: 30,
    total_records_synced: 542,
    total_audit_logs_created: 542,
    created_at: '2025-09-28T00:00:00Z',
    updated_at: '2025-10-13T18:45:00Z'
  }
];