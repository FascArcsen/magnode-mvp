"use client";

import { useEffect, useState } from "react";

interface Dashboard {
  dashboard_id: string;
  org_id: string;
  title: string;
  description: string;
  layout_config: any;
  created_at: string;
  updated_at: string;
}

interface Report {
  report_id: string;
  name: string;
  type: string;
  data_source: string;
  created_at: string;
  visualization: any;
}

export default async function DashboardPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // ✅ ← corrección clave

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 🔹 Cargar dashboard
        const dashRes = await fetch(`/api/dashboards/${id}`);
        const dashData = await dashRes.json();
        setDashboard(dashData);

        // 🔹 Cargar reports asociados
        const repRes = await fetch(`/api/dashboards/${id}/reports`);
        const repData = await repRes.json();
        setReports(repData);
      } catch (err) {
        console.error("❌ Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [id]);

  if (loading)
    return <div className="p-6 text-gray-500">Cargando dashboard...</div>;
  if (!dashboard)
    return <div className="p-6 text-red-500">Dashboard no encontrado.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* 🧭 Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{dashboard.title}</h1>
        <p className="text-gray-600">{dashboard.description}</p>
      </div>

      {/* 📊 Sección de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.report_id}
              className="border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all bg-white"
            >
              <h2 className="text-lg font-semibold">{report.name}</h2>
              <p className="text-sm text-gray-500 mb-2">Tipo: {report.type}</p>
              <div className="text-xs text-gray-400">
                Fuente: {report.data_source}
              </div>
              <div className="mt-3 text-gray-700 text-sm">
                {report.visualization?.summary ||
                  "Sin visualización disponible"}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">
            Aún no hay reportes asociados a este dashboard.
          </p>
        )}
      </div>
    </div>
  );
}