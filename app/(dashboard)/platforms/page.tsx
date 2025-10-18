'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Settings,
  Loader2,
  Zap,
  Code,
  Sparkles,
  ArrowLeft,
  Send,
} from 'lucide-react';

// =========================================
// 🔹 INTERFACES
// =========================================
interface PlatformConnection {
  connection_id: string;
  platform_name: string;
  platform_type: string;
  status: string;
  last_sync_at?: string;
  total_records_synced: number;
  error_message?: string;
  created_at: string;
}

type ConnectionType = 'pre_built' | 'universal' | 'llm_assisted';
type WizardStep = 'select_type' | 'select_platform' | 'configure' | 'test';

interface UniversalConfig {
  platform_name: string;
  base_url: string;
  auth_type: 'api_key' | 'bearer' | 'basic' | 'oauth';
  api_key?: string;
  bearer_token?: string;
  username?: string;
  password?: string;
  endpoints: {
    name: string;
    path: string;
    method: string;
  }[];
}

// =========================================
// 🔹 PLATAFORMAS PRE-BUILT
// =========================================
const PREBUILT_PLATFORMS = [
  { id: 'google', name: 'Google Workspace', icon: '🔷' },
  { id: 'slack', name: 'Slack', icon: '💬' },
  { id: 'microsoft', name: 'Microsoft 365', icon: '🪟' },
  { id: 'hubspot', name: 'HubSpot', icon: '🧡' },
  { id: 'notion', name: 'Notion', icon: '📝' },
  { id: 'linear', name: 'Linear', icon: '📊' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦' },
  { id: 'intercom', name: 'Intercom', icon: '💬' },
];

// =========================================
// 🔹 COMPONENTE PRINCIPAL
// =========================================
export default function PlatformsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('select_type');
  const [selectedType, setSelectedType] = useState<ConnectionType | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Universal Connector State
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>({
    platform_name: '',
    base_url: '',
    auth_type: 'api_key',
    endpoints: [{ name: '', path: '', method: 'GET' }],
  });

  // LLM-Assisted State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  // =========================================
  // 🔸 CARGA DE CONEXIONES
  // =========================================
  const loadConnections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/platforms?org_id=org-001');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch connections');
      setConnections(data.data || []);
    } catch (err) {
      console.error('❌ Error loading connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();

    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    if (connected) {
      alert(`✅ ${connected.toUpperCase()} connected successfully!`);
      window.history.replaceState({}, document.title, window.location.pathname);
      loadConnections();
    }
  }, []);

  // =========================================
  // 🔸 UTILIDADES VISUALES
  // =========================================
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getPlatformBadgeColor = (type: string) => {
    switch (type) {
      case 'pre_built':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'universal':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'llm_assisted':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  // =========================================
  // 🔸 ACCIONES
  // =========================================
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    try {
      const res = await fetch(`/api/platforms?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Delete failed');
      setConnections((prev) => prev.filter((c) => c.connection_id !== id));
    } catch (err: any) {
      alert(`❌ Failed to delete connection: ${err.message}`);
    }
  };

  const handleSync = async (id: string) => {
    try {
      setSyncingId(id);
      const res = await fetch(`/api/platforms/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: id, incremental: true }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Sync failed');

      alert('✅ Sync completed successfully!');
      loadConnections();
    } catch (err: any) {
      alert(`❌ Sync failed: ${err.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  // =========================================
  // 🔸 WIZARD - Handlers
  // =========================================
  const resetWizard = () => {
    setWizardStep('select_type');
    setSelectedType(null);
    setSelectedPlatform(null);
    setUniversalConfig({
      platform_name: '',
      base_url: '',
      auth_type: 'api_key',
      endpoints: [{ name: '', path: '', method: 'GET' }],
    });
    setAiPrompt('');
    setAiResponse(null);
  };

  const handleSelectType = (type: ConnectionType) => {
    setSelectedType(type);
    setWizardStep('select_platform');
  };

  const handleConnectPlatform = (platformId: string) => {
    console.log(`🔗 Connecting to ${platformId}...`);
    window.location.href = `/api/platforms/oauth/${platformId}/authorize`;
  };

  // =========================================
  // 🔸 UNIVERSAL CONNECTOR
  // =========================================
  const handleUniversalSubmit = async () => {
    try {
      const res = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          platform_type: 'universal',
          platform_name: universalConfig.platform_name,
          auth_config: {
            type: universalConfig.auth_type,
            credentials: {
              api_key: universalConfig.api_key,
              bearer_token: universalConfig.bearer_token,
              username: universalConfig.username,
              password: universalConfig.password,
            },
          },
          connector_config: {
            base_url: universalConfig.base_url,
            endpoints: universalConfig.endpoints,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create connection');

      alert('✅ Universal connector created successfully!');
      setShowWizard(false);
      resetWizard();
      loadConnections();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const addEndpoint = () => {
    setUniversalConfig({
      ...universalConfig,
      endpoints: [...universalConfig.endpoints, { name: '', path: '', method: 'GET' }],
    });
  };

  const removeEndpoint = (index: number) => {
    setUniversalConfig({
      ...universalConfig,
      endpoints: universalConfig.endpoints.filter((_, i) => i !== index),
    });
  };

  const updateEndpoint = (index: number, field: string, value: string) => {
    const newEndpoints = [...universalConfig.endpoints];
    newEndpoints[index] = { ...newEndpoints[index], [field]: value };
    setUniversalConfig({ ...universalConfig, endpoints: newEndpoints });
  };

  // =========================================
  // 🔸 LLM-ASSISTED CONNECTOR
  // =========================================
  const handleAIGenerate = async () => {
    try {
      setAiLoading(true);
      const res = await fetch('/api/platforms/llm-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate config');

      setAiResponse(data.data);
      alert('✅ Configuration generated! Review and save.');
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISave = async () => {
    try {
      const res = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          platform_type: 'llm_assisted',
          platform_name: aiResponse.platform_name,
          auth_config: aiResponse.auth_config,
          connector_config: aiResponse.connector_config,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create connection');

      alert('✅ AI-generated connector created successfully!');
      setShowWizard(false);
      resetWizard();
      loadConnections();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  // =========================================
  // 🔸 RENDER WIZARD STEPS
  // =========================================
  const renderWizardContent = () => {
    // STEP 1: Seleccionar tipo de conexión
    if (wizardStep === 'select_type') {
      return (
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Choose Connection Type
          </h3>
          
          <div className="grid gap-4">
            {/* PRE-BUILT */}
            <button
              onClick={() => handleSelectType('pre_built')}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Pre-built Connectors
                  </h4>
                  <p className="text-sm text-gray-600">
                    Quick OAuth setup for popular platforms like Google, Slack, HubSpot, and more
                  </p>
                  <div className="flex gap-2 mt-3">
                    {PREBUILT_PLATFORMS.slice(0, 6).map((p) => (
                      <span key={p.id} className="text-xl">{p.icon}</span>
                    ))}
                    <span className="text-gray-400">+{PREBUILT_PLATFORMS.length - 6}</span>
                  </div>
                </div>
              </div>
            </button>

            {/* UNIVERSAL */}
            <button
              onClick={() => handleSelectType('universal')}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Code className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Universal Connector
                  </h4>
                  <p className="text-sm text-gray-600">
                    Configure any REST API manually with custom endpoints, headers, and authentication
                  </p>
                  <div className="mt-3 text-xs text-purple-700 font-medium">
                    Perfect for custom or niche platforms
                  </div>
                </div>
              </div>
            </button>

            {/* LLM ASSISTED */}
            <button
              onClick={() => handleSelectType('llm_assisted')}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    AI-Assisted Setup
                  </h4>
                  <p className="text-sm text-gray-600">
                    Describe your data source and let AI generate the connector configuration for you
                  </p>
                  <div className="mt-3 text-xs text-orange-700 font-medium">
                    🪄 Powered by Claude
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      );
    }

    // STEP 2A: Pre-built platforms
    if (wizardStep === 'select_platform' && selectedType === 'pre_built') {
      return (
        <div className="p-8">
          <button
            onClick={resetWizard}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to connection types
          </button>

          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Select Platform
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PREBUILT_PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleConnectPlatform(platform.id)}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="text-4xl mb-3">{platform.icon}</div>
                <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                <p className="text-sm text-gray-600 mt-1">OAuth 2.0</p>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> You'll be redirected to authenticate with the platform.
            </p>
          </div>
        </div>
      );
    }

    // STEP 2B: Universal Connector
    if (wizardStep === 'select_platform' && selectedType === 'universal') {
      return (
        <div className="p-8">
          <button
            onClick={resetWizard}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to connection types
          </button>

          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Universal Connector Configuration
          </h3>

          <div className="space-y-6">
            {/* Platform Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={universalConfig.platform_name}
                onChange={(e) =>
                  setUniversalConfig({ ...universalConfig, platform_name: e.target.value })
                }
                placeholder="e.g. My Custom API"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL
              </label>
              <input
                type="url"
                value={universalConfig.base_url}
                onChange={(e) =>
                  setUniversalConfig({ ...universalConfig, base_url: e.target.value })
                }
                placeholder="https://api.example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Authentication Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authentication Type
              </label>
              <select
                value={universalConfig.auth_type}
                onChange={(e) =>
                  setUniversalConfig({
                    ...universalConfig,
                    auth_type: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="api_key">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            {/* Auth Credentials */}
            {universalConfig.auth_type === 'api_key' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={universalConfig.api_key || ''}
                  onChange={(e) =>
                    setUniversalConfig({ ...universalConfig, api_key: e.target.value })
                  }
                  placeholder="Your API key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {universalConfig.auth_type === 'bearer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bearer Token
                </label>
                <input
                  type="password"
                  value={universalConfig.bearer_token || ''}
                  onChange={(e) =>
                    setUniversalConfig({ ...universalConfig, bearer_token: e.target.value })
                  }
                  placeholder="Your bearer token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {universalConfig.auth_type === 'basic' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={universalConfig.username || ''}
                    onChange={(e) =>
                      setUniversalConfig({ ...universalConfig, username: e.target.value })
                    }
                    placeholder="Username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={universalConfig.password || ''}
                    onChange={(e) =>
                      setUniversalConfig({ ...universalConfig, password: e.target.value })
                    }
                    placeholder="Password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Endpoints */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Endpoints
                </label>
                <button
                  onClick={addEndpoint}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  + Add Endpoint
                </button>
              </div>

              {universalConfig.endpoints.map((endpoint, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={endpoint.name}
                        onChange={(e) => updateEndpoint(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={endpoint.method}
                        onChange={(e) => updateEndpoint(index, 'method', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                      </select>
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={endpoint.path}
                        onChange={(e) => updateEndpoint(index, 'path', e.target.value)}
                        placeholder="/endpoint/path"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      {universalConfig.endpoints.length > 1 && (
                        <button
                          onClick={() => removeEndpoint(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={resetWizard}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUniversalSubmit}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Connection
              </button>
            </div>
          </div>
        </div>
      );
    }

    // STEP 2C: LLM-Assisted
    if (wizardStep === 'select_platform' && selectedType === 'llm_assisted') {
      return (
        <div className="p-8">
          <button
            onClick={resetWizard}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to connection types
          </button>

          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            AI-Assisted Connector Setup
          </h3>

          {!aiResponse ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your data source
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: I want to connect to Zendesk Support API to fetch tickets and users. The API uses Bearer token authentication and the base URL is https://mycompany.zendesk.com/api/v2"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-900">
                  <strong>Tip:</strong> Include the platform name, base URL, authentication method, and what data you want to fetch.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  ✅ Configuration generated successfully! Review the details below and save to create the connection.
                </p>
              </div>

              {/* Generated Config Preview */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-4">Generated Configuration</h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Platform Name:</span>
                    <span className="ml-2 text-gray-900">{aiResponse.platform_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Base URL:</span>
                    <span className="ml-2 text-gray-900">{aiResponse.connector_config?.base_url}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Authentication:</span>
                    <span className="ml-2 text-gray-900">{aiResponse.auth_config?.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Endpoints:</span>
                    <ul className="ml-6 mt-2 space-y-1">
                      {aiResponse.connector_config?.endpoints?.map((ep: any, i: number) => (
                        <li key={i} className="text-gray-900">
                          <span className="font-mono bg-white px-2 py-1 rounded text-xs">{ep.method}</span>
                          {' '}{ep.path} - {ep.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Raw JSON (collapsible) */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    View raw configuration JSON
                  </summary>
                  <pre className="mt-2 bg-white p-4 rounded border border-gray-200 text-xs overflow-x-auto">
                    {JSON.stringify(aiResponse, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAiResponse(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleAISave}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Save Connection
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // =========================================
  // 🔸 RENDER PRINCIPAL
  // =========================================
  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platforms</h1>
          <p className="text-gray-600 mt-1">
            Connect your tools and data sources to MagNode
          </p>
        </div>
        <button
          onClick={() => {
            resetWizard();
            setShowWizard(true);
          }}
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Platform
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Platforms', value: connections.length },
          {
            label: 'Active',
            value: connections.filter((c) => c.status === 'active').length,
            color: 'text-green-600',
          },
          {
            label: 'Errors',
            value: connections.filter((c) => c.status === 'error').length,
            color: 'text-red-600',
          },
          {
            label: 'Total Records',
            value: connections
              .reduce((sum, c) => sum + (c.total_records_synced || 0), 0)
              .toLocaleString(),
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="text-sm text-gray-600 mb-1">{label}</div>
            <div className={`text-3xl font-bold ${color || 'text-gray-900'}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* CONNECTIONS LIST */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Connected Platforms
          </h2>
          {loading && (
            <div className="flex items-center text-gray-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {!loading && connections.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No platforms connected yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by connecting your first platform
              </p>
              <button
                onClick={() => {
                  resetWizard();
                  setShowWizard(true);
                }}
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Platform
              </button>
            </div>
          )}

          {connections.map((conn) => (
            <div
              key={conn.connection_id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(conn.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {conn.platform_name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium border rounded ${getPlatformBadgeColor(
                          conn.platform_type
                        )}`}
                      >
                        {conn.platform_type.replaceAll('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Last sync: {formatDate(conn.last_sync_at)}</span>
                      <span>•</span>
                      <span>
                        {conn.total_records_synced?.toLocaleString() || 0} records
                      </span>
                      {conn.error_message && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">
                            {conn.error_message}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSync(conn.connection_id)}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                    disabled={syncingId === conn.connection_id}
                  >
                    {syncingId === conn.connection_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>

                  <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(conn.connection_id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL WIZARD */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Platform</h2>
                <p className="text-gray-600 mt-1">Connect a new data source to MagNode</p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {renderWizardContent()}
          </div>
        </div>
      )}
    </div>
  );
}

