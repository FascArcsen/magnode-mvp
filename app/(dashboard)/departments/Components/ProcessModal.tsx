import React from "react";
import type { ProcessSummary } from "@/types/database";
import { X } from "lucide-react";

interface ProcessModalProps {
  process: ProcessSummary;
  onClose: () => void;
}

export default function ProcessModal({ process, onClose }: ProcessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="font-syne text-xl font-bold text-gray-900">
            {process.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div
            className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
              process.status === "critical"
                ? "bg-red-100 text-red-700"
                : process.status === "warning"
                ? "bg-orange-100 text-orange-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {process.status === "critical"
              ? "🔴 CRÍTICO"
              : process.status === "warning"
              ? "🟡 ADVERTENCIA"
              : "🟢 SALUDABLE"}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {process.avg_time_hours}h
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tiempo Promedio
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {process.handoff_count}
              </div>
              <div className="text-xs text-gray-500 mt-1">Handoffs</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(process.completion_rate * 100)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tasa de Completado
              </div>
            </div>
          </div>

          {/* User Complaint */}
          {process.user_complaint && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🗣️</span>
                <span>Queja del Usuario</span>
              </div>
              <div className="text-sm text-gray-700 italic">
                "{process.user_complaint}"
              </div>
            </div>
          )}

          {/* Process Flow */}
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-3">
              Flujo del Proceso
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Origen</div>
                <div className="font-semibold text-gray-900">
                  {process.from_dept}
                </div>
              </div>
              <div className="text-orange-500 text-2xl">→</div>
              <div className="flex-1 bg-orange-50 rounded-lg p-3 text-center border-2 border-orange-500">
                <div className="text-xs text-orange-600 mb-1">Proceso</div>
                <div className="font-semibold text-orange-900 text-sm">
                  {process.name}
                </div>
              </div>
              <div className="text-orange-500 text-2xl">→</div>
              <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Destino</div>
                <div className="font-semibold text-gray-900">
                  {process.to_dept}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-900 mb-2">
              📊 Análisis Rápido
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              {process.avg_time_hours > 100 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">⚠️</span>
                  <span>
                    El tiempo promedio ({process.avg_time_hours}h) está muy por
                    encima del objetivo (&lt;24h)
                  </span>
                </li>
              )}
              {process.handoff_count > 5 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">⚠️</span>
                  <span>
                    Demasiados handoffs ({process.handoff_count}) pueden causar
                    delays y errores
                  </span>
                </li>
              )}
              {process.completion_rate < 0.7 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">⚠️</span>
                  <span>
                    Tasa de completado baja (
                    {Math.round(process.completion_rate * 100)}%) indica
                    problemas en el proceso
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Action Button */}
          <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
            <span>📋</span>
            <span>Ver Playbook de Solución</span>
          </button>
        </div>
      </div>
    </div>
  );
}