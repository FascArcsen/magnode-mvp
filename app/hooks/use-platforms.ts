import { useState, useCallback } from 'react';
import type { 
  PlatformConnection, 
  LLMAssistedConfig,
  SyncResult,
  ConnectionTestResult 
} from '@/types/connectors';

// ==========================================
// CUSTOM HOOK - usePlatforms
// ==========================================

interface UsePlatformsReturn {
  // State
  connections: PlatformConnection[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchConnections: () => Promise<void>;
  createConnection: (data: any) => Promise<PlatformConnection>;
  deleteConnection: (connectionId: string) => Promise<void>;
  syncConnection: (connectionId: string, incremental?: boolean) => Promise<SyncResult>;
  testConnection: (connection: PlatformConnection) => Promise<ConnectionTestResult>;
  
  // LLM Assistance
  generateConfigWithLLM: (input: {
    base_url: string;
    api_documentation?: string;
    sample_response?: string;
    api_description?: string;
  }) => Promise<LLMAssistedConfig>;
  
  refineConfigWithLLM: (config: any, feedback: string) => Promise<any>;
}

export function usePlatforms(orgId: string = 'org-001'): UsePlatformsReturn {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // FETCH CONNECTIONS
  // ==========================================

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/platforms?org_id=${orgId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setConnections(result.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  // ==========================================
  // CREATE CONNECTION
  // ==========================================

  const createConnection = useCallback(async (data: any): Promise<PlatformConnection> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, org_id: orgId })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create connection');
      }

      // Add to local state
      setConnections(prev => [...prev, result.data]);

      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  // ==========================================
  // DELETE CONNECTION
  // ==========================================

  const deleteConnection = useCallback(async (connectionId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/platforms?id=${connectionId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Remove from local state
      setConnections(prev => prev.filter(c => c.connection_id !== connectionId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // SYNC CONNECTION
  // ==========================================

  const syncConnection = useCallback(async (
    connectionId: string, 
    incremental: boolean = true
  ): Promise<SyncResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/platforms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId, incremental })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      setConnections(prev => prev.map(c => 
        c.connection_id === connectionId
          ? {
              ...c,
              last_sync_at: result.data.completed_at,
              last_sync_status: result.data.status,
              total_records_synced: c.total_records_synced + result.data.stats.total_records_fetched
            }
          : c
      ));

      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // TEST CONNECTION
  // ==========================================

  const testConnection = useCallback(async (
    connection: PlatformConnection
  ): Promise<ConnectionTestResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/platforms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connection)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // LLM ASSISTANCE - GENERATE CONFIG
  // ==========================================

  const generateConfigWithLLM = useCallback(async (input: {
    base_url: string;
    api_documentation?: string;
    sample_response?: string;
    api_description?: string;
  }): Promise<LLMAssistedConfig> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/platforms/llm-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // LLM ASSISTANCE - REFINE CONFIG
  // ==========================================

  const refineConfigWithLLM = useCallback(async (
    config: any, 
    feedback: string
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/platforms/llm-assist/refine', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, feedback })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    connections,
    loading,
    error,
    
    // Actions
    fetchConnections,
    createConnection,
    deleteConnection,
    syncConnection,
    testConnection,
    
    // LLM
    generateConfigWithLLM,
    refineConfigWithLLM
  };
}

// ==========================================
// EXAMPLE USAGE
// ==========================================

/*
function MyComponent() {
  const { 
    connections, 
    loading, 
    error,
    fetchConnections,
    createConnection,
    generateConfigWithLLM 
  } = usePlatforms('org-001');

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleAddPlatform = async () => {
    // LLM assisted flow
    const llmConfig = await generateConfigWithLLM({
      base_url: 'https://api.example.com',
      api_documentation: '...'
    });

    await createConnection({
      platform_type: 'llm_assisted',
      platform_name: 'My API',
      auth_config: { type: 'api_key', credentials: { api_key: 'xxx' } },
      connector_config: llmConfig.suggested_config
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {connections.map(conn => (
        <div key={conn.connection_id}>{conn.platform_name}</div>
      ))}
    </div>
  );
}
*/