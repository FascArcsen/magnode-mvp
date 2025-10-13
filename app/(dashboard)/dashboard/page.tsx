'use client';

import { TrendingUp, Users, Activity, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Resumen operativo
        </h1>
        <p className="text-sm text-gray-500">
          Vista general del rendimiento operativo de tu organización.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Nuevos clientes</span>
            <Users className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold">8</h2>
          <p className="text-xs text-green-600">+0.5% vs ayer</p>
        </div>

        <div className="card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tickets abiertos</span>
            <Activity className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold">22</h2>
          <p className="text-xs text-red-600">-2 desde ayer</p>
        </div>

        <div className="card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tiempo medio de respuesta</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold">1h 25min</h2>
          <p className="text-xs text-gray-500">Objetivo: &lt; 1h</p>
        </div>

        <div className="card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Eficiencia global</span>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold">92%</h2>
          <p className="text-xs text-green-600">+4% semana pasada</p>
        </div>
      </div>

      {/* Section 2 — Activity Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Actividad reciente</h2>
        <ul className="divide-y divide-gray-100">
          <li className="py-2 text-sm text-gray-700 flex justify-between">
            <span>Ticket #302 resuelto por Laura</span>
            <span className="text-gray-400">Hace 2h</span>
          </li>
          <li className="py-2 text-sm text-gray-700 flex justify-between">
            <span>Nuevo cliente: NovaTech</span>
            <span className="text-gray-400">Hace 4h</span>
          </li>
          <li className="py-2 text-sm text-gray-700 flex justify-between">
            <span>Actualización de integración con HubSpot</span>
            <span className="text-gray-400">Hace 6h</span>
          </li>
        </ul>
      </div>
    </section>
  );
}