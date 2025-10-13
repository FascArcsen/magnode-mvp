'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import AuditLogList from './components/AuditLogList';

interface Case {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'pending';
  risk_level: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  detected_cause: string;
  suggested_action: string;
  score: number;
}

const mockCases: Case[] = [
  {
    id: 'AUD-0035',
    title: 'Control Insuficiente en el proceso de Billing',
    description: 'Inconsistencias detectadas en el proceso de facturación',
    status: 'active',
    risk_level: 'low',
    urgency: 'medium',
    created_at: '25 Aug, 2025',
    updated_at: '03 Sept, 2025',
    detected_cause: 'Falta de validación automática',
    suggested_action: 'Implementar reglas de validación',
    score: 7.7
  },
  {
    id: 'AUD-0036',
    title: 'Demora en aprobación de órdenes',
    description: 'Tiempo de aprobación excede el SLA establecido',
    status: 'active',
    risk_level: 'high',
    urgency: 'high',
    created_at: '22 Aug, 2025',
    updated_at: '05 Sept, 2025',
    detected_cause: 'Cuello de botella en aprobaciones',
    suggested_action: 'Redistribuir carga de trabajo',
    score: 8.9
  },
  {
    id: 'AUD-0037',
    title: 'Errores en sincronización CRM',
    description: 'Datos inconsistentes entre plataformas',
    status: 'pending',
    risk_level: 'medium',
    urgency: 'high',
    created_at: '28 Aug, 2025',
    updated_at: '04 Sept, 2025',
    detected_cause: 'Configuración incorrecta de API',
    suggested_action: 'Revisar credenciales y permisos',
    score: 6.5
  },
  {
    id: 'AUD-0038',
    title: 'Bajo rendimiento en entrega de productos',
    description: 'Tasa de entrega por debajo del objetivo',
    status: 'resolved',
    risk_level: 'low',
    urgency: 'low',
    created_at: '15 Aug, 2025',
    updated_at: '30 Aug, 2025',
    detected_cause: 'Falta de recursos en logística',
    suggested_action: 'Optimización de rutas',
    score: 5.8
  }
];

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'active' | 'history'>('active');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = mockCases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalCases: 300,
    globalRisk: 34,
    acceptanceRate: 28.3,
    urgentCases: 15,
    unresolvedCases: 47
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MagNode Studio</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión de casos de estudio y análisis</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.totalCases}</div>
          <div className="text-xs text-gray-500 mt-1">Total de estudios de caso</div>
          <div className="text-xs text-green-600 mt-1">+5% from yesterday</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.globalRisk}</div>
          <div className="text-xs text-gray-500 mt-1">Riesgo Global</div>
          <div className="text-xs text-gray-600 mt-1">Nivel: Moderado</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.acceptanceRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Tasa de aceptación</div>
          <div className="text-xs text-green-600 mt-1">+5% from yesterday</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.urgentCases}</div>
          <div className="text-xs text-gray-500 mt-1">Casos Urgentes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.unresolvedCases}</div>
          <div className="text-xs text-gray-500 mt-1">Casos sin resolución</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('new')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'new' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nuevo estudio de caso
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'active' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Casos activos
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'history' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial de acciones
        </button>
      </div>

      {/* New Case Form */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Crear nuevo caso de estudio</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe brevemente tu solicitud
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                rows={4}
                placeholder="Describe el problema o caso que quieres analizar..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agrega las métricas clave
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  placeholder="Ej: Tiempo de entrega, CSAT, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Establece un periodo de tiempo
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  placeholder="Ej: 30 días, 3 meses, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué plataformas están relacionadas a este caso?
              </label>
              <select className="w-full border border-gray-300 rounded-lg p-3 text-sm">
                <option>Selecciona plataformas...</option>
                <option>HubSpot</option>
                <option>Slack</option>
                <option>Jira</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona los equipos involucrados
              </label>
              <select className="w-full border border-gray-300 rounded-lg p-3 text-sm">
                <option>Selecciona departamentos...</option>
                <option>Marketing</option>
                <option>Ventas</option>
                <option>Soporte</option>
                <option>Logística</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restricciones del caso
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                rows={3}
                placeholder="Describe soluciones que deseas excluir o restricciones específicas..."
              />
            </div>

            <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Crear caso de estudio
            </button>
          </div>
        </div>
      )}

      {/* Active Cases */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar casos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Filtrar Por
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción del caso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha creación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última actualización</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel de riesgo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <>
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{caseItem.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Puntuación: {caseItem.score}/10 • ID: {caseItem.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status === 'resolved' ? 'Resuelto' : caseItem.status === 'pending' ? 'Pendiente' : 'Sin Resolución'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{caseItem.created_at}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{caseItem.updated_at}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getRiskColor(caseItem.risk_level)}`}>
                          {caseItem.risk_level === 'high' ? 'Alto' : caseItem.risk_level === 'medium' ? 'Medio' : 'Bajo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getRiskColor(caseItem.urgency)}`}>
                          {caseItem.urgency === 'high' ? 'Alto' : caseItem.urgency === 'medium' ? 'Medio' : 'Bajo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedCase(expandedCase === caseItem.id ? null : caseItem.id)}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          {expandedCase === caseItem.id ? 'Contraer' : 'Expandir'}
                        </button>
                      </td>
                    </tr>
                    {expandedCase === caseItem.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-3">
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Causa Detectada</div>
                              <div className="text-sm text-gray-600">{caseItem.detected_cause}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Acción Sugerida</div>
                              <div className="text-sm text-gray-600">{caseItem.suggested_action}</div>
                            </div>
                            <div className="flex gap-3">
                              <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">
                                Reanalizar
                              </button>
                              <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                                Ver detalles completos
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History - Historial de Acciones */}
      {activeTab === 'history' && <AuditLogList />}
    </div>
  );
}