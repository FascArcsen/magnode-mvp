'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Mail, Bell, Globe, Clock, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'departments'>('general');
  const [settings, setSettings] = useState({
    language: 'es',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    notifications: true,
    emailReports: true,
    twoFactor: true,
    twoFactorMethod: 'sms'
  });

  const [newUser, setNewUser] = useState({
    email: '',
    role: 'supervisor',
    department: 'ventas'
  });

  const departments = [
    { id: 1, name: 'Marketing', status: 'critical', members: 25, metrics: ['MMR', 'CPC'], responsible: 'Luis Mariño', created: '25 Aug, 2025' },
    { id: 2, name: 'Ventas', status: 'stable', members: 30, metrics: ['Churn', 'Refunds'], responsible: 'Carlos Miranda', created: '25 Aug, 2025' },
    { id: 3, name: 'Product', status: 'stable', members: 12, metrics: ['CSAT', 'UX Index'], responsible: 'Maria Martinez', created: '25 Aug, 2025' },
    { id: 4, name: 'Customer Support', status: 'stable', members: 70, metrics: ['CSAT', 'Response Time'], responsible: 'Luis Erazo', created: '25 Aug, 2025' },
  ];

  const getDeptStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'warning': return 'bg-orange-100 text-orange-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Administra las preferencias de tu cuenta y organización</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'general' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Configuración general
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'departments' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Gestión departamental
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Preferences */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Preferencias Generales</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4" />
                    Idioma de Plataforma
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    Zona horaria
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  >
                    <option value="America/New_York">Automática (Estados Unidos)</option>
                    <option value="America/Los_Angeles">PST (Los Angeles)</option>
                    <option value="Europe/London">GMT (London)</option>
                    <option value="America/Bogota">COT (Bogotá)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Fechas y formato Numérico
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  >
                    <option value="MM/DD/YYYY">Formato: 07/22/2025 and 1,456.56</option>
                    <option value="DD/MM/YYYY">Formato: 22/07/2025 and 1.456,56</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Notificaciones</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Envío de notificaciones al correo corporativo</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Envío de reportes</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailReports}
                      onChange={(e) => setSettings({ ...settings, emailReports: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Seguridad
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Segundo sistema de autentificación</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactor}
                      onChange={(e) => setSettings({ ...settings, twoFactor: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {settings.twoFactor && (
                  <div>
                    <select
                      value={settings.twoFactorMethod}
                      onChange={(e) => setSettings({ ...settings, twoFactorMethod: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                    >
                      <option value="sms">SMS</option>
                      <option value="qr">QR CODE</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - User Management */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Roles y Permisos</h2>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-gray-900">Permisos Actuales</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">Supervisor</div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Agregar un nuevo usuario</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Corporativo
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="usuario@company.com"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de rol a asignar
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  >
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento asignado
                  </label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  >
                    <option value="ventas">Ventas</option>
                    <option value="marketing">Marketing</option>
                    <option value="soporte">Soporte</option>
                    <option value="logistica">Logística</option>
                  </select>
                </div>

                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  Enviar Invitación
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="col-span-2 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              <Save className="w-4 h-4" />
              Actualizar Configuraciones
            </button>
          </div>
        </div>
      )}

      {/* Department Management */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Gestión Departamental</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <Plus className="w-4 h-4" />
              Agregar Departamento
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado general</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de creación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Métricas asignadas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miembros Totales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getDeptStatusColor(dept.status)}`}>
                        {dept.status === 'critical' ? 'Crítico' : 'Estable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{dept.created}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {dept.metrics.map((metric, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{dept.responsible}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{dept.members}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-orange-600 hover:text-orange-700 text-sm">
                          Expandir
                        </button>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}