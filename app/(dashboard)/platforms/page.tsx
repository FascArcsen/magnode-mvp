'use client';

import { useState } from 'react';
import { Plus, RefreshCw, CheckCircle, XCircle, AlertCircle, Trash2, Settings } from 'lucide-react';

// Mock data - en producción vendría de la BD
const mockConnections = [
  {
    connection_id: 'conn-001',
    platform_name: 'Google Sheets',
    platform_type: 'pre_built',
    status: 'active',
    last_sync_at: '2025-10-14T10:30:00Z',
    total_records_synced: 1247,
    created_at: '2025-10-01T00:00:00Z'
  },
  {
    connection_id: 'conn-002',
    platform_name: 'Internal CRM',
    platform_type: 'universal',
    status: 'active',
    last_sync_at: '2025-10-14T09:15:00Z',
    total_records_synced: 3891,
    created_at: '2025-10-05T00:00:00Z'
  },
  {
    connection_id: 'conn-003',
    platform_name: 'Slack Workspace',
    platform_type: 'pre_built',
    status: 'error',
    last_sync_at: '2025-10-13T18:45:00Z',
    total_records_synced: 542,
    error_message: 'Authentication failed',
    created_at: '2025-09-28T00:00:00Z'
  }
];

type ConnectionWizardStep = 'select' | 'configure' | 'map' | 'test' | 'complete';

export default function PlatformsPage() {
  const [connections, setConnections] = useState(mockConnections);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<ConnectionWizardStep>('select');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

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

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platforms</h1>
          <p className="text-gray-600 mt-1">
            Connect your tools and data sources to MagNode
          </p>
        </div>
        
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Platform
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Platforms</div>
          <div className="text-3xl font-bold text-gray-900">{connections.length}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-3xl font-bold text-green-600">
            {connections.filter(c => c.status === 'active').length}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Errors</div>
          <div className="text-3xl font-bold text-red-600">
            {connections.filter(c => c.status === 'error').length}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Records</div>
          <div className="text-3xl font-bold text-gray-900">
            {connections.reduce((sum, c) => sum + c.total_records_synced, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Connected Platforms</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {connections.map(conn => (
            <div key={conn.connection_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(conn.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{conn.platform_name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium border rounded ${getPlatformBadgeColor(conn.platform_type)}`}>
                        {conn.platform_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Last sync: {formatDate(conn.last_sync_at)}</span>
                      <span>•</span>
                      <span>{conn.total_records_synced.toLocaleString()} records</span>
                      {conn.error_message && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">{conn.error_message}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Platform Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Wizard Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add Platform</h2>
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-6">
                {['select', 'configure', 'map', 'test', 'complete'].map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                      wizardStep === step
                        ? 'bg-orange-500 text-white'
                        : i < ['select', 'configure', 'map', 'test', 'complete'].indexOf(wizardStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {i + 1}
                    </div>
                    {i < 4 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        i < ['select', 'configure', 'map', 'test', 'complete'].indexOf(wizardStep)
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard Content */}
            <div className="px-8 py-6">
              {wizardStep === 'select' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Platform Type</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Pre-built Connectors */}
                    <button
                      onClick={() => {
                        setSelectedPlatform('pre_built');
                        setWizardStep('configure');
                      }}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Pre-built Connectors</h4>
                      <p className="text-sm text-gray-600">
                        Connect to popular platforms like Google Sheets, Slack, GitHub with one click
                      </p>
                    </button>

                    {/* Universal API */}
                    <button
                      onClick={() => {
                        setSelectedPlatform('universal');
                        setWizardStep('configure');
                      }}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Universal API</h4>
                      <p className="text-sm text-gray-600">
                        Configure any REST API manually with full control over mapping and sync
                      </p>
                    </button>

                    {/* LLM Assisted */}
                    <button
                      onClick={() => {
                        setSelectedPlatform('llm_assisted');
                        setWizardStep('configure');
                      }}
                      className="border-2 border-orange-300 rounded-lg p-6 hover:border-orange-500 hover:bg-orange-50 transition-all text-left relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
                        AI
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">LLM Assisted</h4>
                      <p className="text-sm text-gray-600">
                        Paste API docs and let AI configure everything automatically
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 'configure' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedPlatform === 'llm_assisted' ? 'Paste API Documentation' : 'Configure Connection'}
                  </h3>
                  
                  {selectedPlatform === 'llm_assisted' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Base URL *
                        </label>
                        <input
                          type="text"
                          placeholder="https://api.example.com/v1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Documentation (Optional)
                        </label>
                        <textarea
                          rows={8}
                          placeholder="Paste your API documentation here... or provide a URL to the docs"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample API Response (Optional)
                        </label>
                        <textarea
                          rows={6}
                          placeholder='{"events": [{"id": "123", "user": "john@example.com", ...}]}'
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          💡 Our AI will analyze your API and automatically suggest the best configuration for extracting user actions and events.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-600">
                      Configuration form for {selectedPlatform} will appear here
                    </div>
                  )}
                </div>
              )}

              {wizardStep === 'test' && (
                <div className="text-center py-12">
                  <RefreshCw className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Testing Connection</h3>
                  <p className="text-gray-600">Verifying credentials and fetching sample data...</p>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="px-8 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  if (wizardStep === 'select') {
                    setShowWizard(false);
                  } else {
                    const steps: ConnectionWizardStep[] = ['select', 'configure', 'map', 'test', 'complete'];
                    const currentIndex = steps.indexOf(wizardStep);
                    setWizardStep(steps[currentIndex - 1]);
                  }
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Back
              </button>
              
              <button
                onClick={() => {
                  const steps: ConnectionWizardStep[] = ['select', 'configure', 'map', 'test', 'complete'];
                  const currentIndex = steps.indexOf(wizardStep);
                  if (currentIndex < steps.length - 1) {
                    setWizardStep(steps[currentIndex + 1]);
                  } else {
                    setShowWizard(false);
                  }
                }}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
              >
                {wizardStep === 'complete' ? 'Finish' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}