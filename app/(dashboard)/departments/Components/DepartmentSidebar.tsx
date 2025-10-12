import { criticalProcesses } from "@/lib/process-data";
import { AlertCircle } from "lucide-react";

export default function DepartmentSidebar() {
  // Calcular top 5 procesos críticos dinámicamente
  const topIssues = criticalProcesses
    .filter((p) => p.status === "critical")
    .sort((a, b) => b.avg_time_hours - a.avg_time_hours)
    .slice(0, 5);

  // Stats generales
  const stats = {
    totalProcesses: criticalProcesses.length,
    criticalCount: criticalProcesses.filter((p) => p.status === "critical")
      .length,
    warningCount: criticalProcesses.filter((p) => p.status === "warning")
      .length,
    avgTime: Math.round(
      criticalProcesses.reduce((acc, p) => acc + p.avg_time_hours, 0) /
        criticalProcesses.length
    ),
  };

  return (
    <aside className="w-80 p-6 bg-white border-l border-gray-200 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-syne font-bold text-gray-900 mb-1">
          Top 5 Critical Processes
        </h3>
        <p className="text-xs text-gray-500">
          Procesos con mayor tiempo de resolución
        </p>
      </div>

      {/* Top Issues List */}
      <div className="flex flex-col gap-3">
        {topIssues.map((process) => (
          <div
            key={process.process_key}
            className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {process.name}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-red-600 font-bold">
                    {process.avg_time_hours}h avg
                  </span>
                  <span className="text-xs text-gray-500">
                    {process.handoff_count} handoffs
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Statistics */}
      <div>
        <h3 className="text-sm font-syne font-bold text-gray-900 mb-4">
          Statistics
        </h3>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500">Total Processes</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalProcesses}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Critical Issues</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.criticalCount}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Warnings</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.warningCount}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Avg Resolution Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.avgTime}h
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
          Ver Todos los Procesos →
        </button>
      </div>
    </aside>
  );
}