'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, LayoutDashboard } from 'lucide-react';

interface Dashboard {
  dashboard_id: string;
  org_id?: string;
  title: string;
  description?: string;
  created_by?: string;
  layout_config?: any;
  created_at?: string;
  updated_at?: string;
}

export default function DashboardList() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setDashboards);
  }, []);

  const createDashboard = async () => {
    const title = prompt('Nombre del nuevo dashboard:');
    if (!title) return;
    const res = await fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const newDashboard = await res.json();
    setDashboards(prev => [newDashboard, ...prev]);
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboards</h1>
          <p className="text-sm text-gray-500">
            Crea y gestiona tus paneles personalizados.
          </p>
        </div>
        <button
          onClick={createDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <PlusCircle className="w-4 h-4" />
          Crear Dashboard
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboards.map((d) => (
          <a
            key={d.dashboard_id}
            href={`/dashboard/${d.dashboard_id}`}
            className="card p-4 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="text-orange-500" />
              <h2 className="font-medium">{d.title}</h2>
            </div>
            <p className="text-sm text-gray-500">
              {d.description || 'Sin descripción'}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}