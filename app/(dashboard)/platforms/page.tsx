
'use client';

import { useState } from 'react';
import { Plus, Settings, RefreshCw, Trash2, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'error' | 'syncing';
  connected_at: string;
  last_sync: string;
  last_sync_result: 'success' | 'error' | 'slow';
}

const mockPlatforms: Platform[] = [
  {
    id: 'plt-001',
    name: 'Hubspot CRM',
    type: 'CRM / Ventas',
    status: 'connected',
    connected_at: 'Aug 12, 2025',
    last_sync: 'hace 5 min',
    last_sync_result: 'success'
  },
  {
    id: 'plt-002',
    name: 'Slack',
    type: 'Comunicación',
    status: 'connected',
    connected_at: 'Aug 10, 2025',
    last_sync: 'hace 2 min',
    last_sync_result: 'success'
  },
  {
    id: 'plt-003',
    name: 'Jira',
    type: 'Gestión de Proyectos',
    status: 'error',
    connected_at: 'Aug 15, 2025',
    last_sync: 'hace 5 min',
    last_sync_result: 'error'
  },
  {
    id: 'plt-004',
    name: 'Appian',
    type: 'BPM / Automatización',
    status: 'connected',
    connected_at: 'Aug 08, 2025',
    last_sync: 'hace 1h 23min',
    last_sync_result: 'slow'
  }
];

const syncHistory = [
  { platform: 'Hubspot', last_sync: '1h 23min', result: 'success', id: 'sync-1' },
  { platform: 'Jira', last_sync: '5 min', result: 'error', id: 'sync-2' },
  { platform: 'Slack', last_sync: '15 min', result: 'success', id: 'sync-3' },
  { platform: 'Appian', last_sync: '2h 10min', result: 'slow', id: 'sync-4' },
];

export default function PlatformsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    apiKey: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'syncing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getSyncResultBadge = (result: string) => {
    switch (result) {
      case 'success':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Éxito</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">Fallo</span>;
      case 'slow':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">Lento</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plataformas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus integraciones de plataformas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Plataforma
        </button>
      </div>

      {/* Connected Platforms */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Plataformas conectadas ({mockPlatforms.length}/4)
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {mockPlatforms.map((platform) => (
            <div
              key={platform.id}
              className={`border rounded-lg p-4 ${
                platform.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(platform.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                    <p className="text-xs text-gray-500">{platform.type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1.5 hover:bg-red-100 rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className={`font-medium ${
                    platform.status === 'connected' ? 'text-green-600' :
                    platform.status === 'error' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {platform.status === 'connected' ? 'Conectado' :
                     platform.status === 'error' ? 'Requiere Atención' : 'Sincronizando'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha de conexión:</span>
                  <span>{platform.connected_at}</span>
                </div>
                <div className="flex justify-between">
                  <span>Última sincronización:</span>
                  <span>{platform.last_sync}</span>
                </div>
              </div>

              {platform.status === 'error' && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <button className="w-full text-xs text-red-700 font-medium hover:text-red-800">
                    Ver detalles del error →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sync History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Historial de sincronizaciones</h2>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Ver todas →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plataforma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Sync</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resultado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {syncHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.platform}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.last_sync}</td>
                  <td className="px-6 py-4">{getSyncResultBadge(item.result)}</td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-orange-600 hover:text-orange-700">
                      Ver log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Platform Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Agregar Nueva Plataforma</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID de plataforma (Asignado automáticamente)
                </label>
                <input
                  type="text"
                  disabled
                  value="Generado automáticamente"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la plataforma
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  placeholder="Ej: HubSpot, Slack, Jira..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                >
                  <option value="">Selecciona un tipo...</option>
                  <option value="crm">CRM / Ventas</option>
                  <option value="communication">Comunicación</option>
                  <option value="project">Gestión de Proyectos</option>
                  <option value="bpm">BPM / Automatización</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  placeholder="Ingresa tu API key..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Conectar Plataforma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}