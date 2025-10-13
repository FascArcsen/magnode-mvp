"use client";
import React from "react";
import { 
  TrendingUp, Calendar, Target, Zap, 
  Award, Clock, BarChart3 
} from "lucide-react";
import { mockAuditLogs } from "@/lib/mock-data";

export default function ActivitySummary() {
  // Calcular estadísticas
  const userLogs = mockAuditLogs.filter(log => log.actor_type === "user");
  
  const stats = {
    totalActions: userLogs.length,
    thisWeek: userLogs.filter(log => {
      const logDate = new Date(log.ts);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length,
    avgPerDay: (userLogs.length / 7).toFixed(1),
    mostProductiveHour: "14:00-15:00",
    streak: 5, // días consecutivos con actividad
    achievements: [
      { name: "Power User", icon: Zap, description: "10+ acciones en un día" },
      { name: "Organizador", icon: Target, description: "5 departamentos mejorados" },
      { name: "Explorador", icon: Award, description: "Probaste todas las features" }
    ]
  };

  const actionsByType = userLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topActions = Object.entries(actionsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-orange-500" />
        Tu Resumen de Actividad
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.totalActions}</div>
          <div className="text-xs text-gray-500 mt-1">Total acciones</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.thisWeek}</div>
          <div className="text-xs text-gray-500 mt-1">Esta semana</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.avgPerDay}</div>
          <div className="text-xs text-gray-500 mt-1">Promedio/día</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.streak}</div>
          <div className="text-xs text-gray-500 mt-1">Días seguidos</div>
        </div>
      </div>

      {/* Acciones más frecuentes */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Acciones Más Frecuentes</h3>
        <div className="space-y-2">
          {topActions.map(([action, count]) => {
            const percentage = ((count / stats.totalActions) * 100).toFixed(0);
            return (
              <div key={action} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-20 capitalize">{action}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-orange-500 h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs text-white font-semibold">{count}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-12">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights personales */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-blue-900 mb-1">💡 Insight Personal</div>
            <div className="text-sm text-blue-700">
              Tu hora más productiva es {stats.mostProductiveHour}. La mayoría de tus cambios 
              mejoran el friction score de departamentos.
            </div>
          </div>
        </div>
      </div>

      {/* Logros */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          Logros Desbloqueados
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {stats.achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={index}
                className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 text-center"
              >
                <Icon className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-gray-900 mb-1">
                  {achievement.name}
                </div>
                <div className="text-xs text-gray-600">
                  {achievement.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" />
          Descargar Reporte Semanal
        </button>
      </div>
    </div>
  );
}