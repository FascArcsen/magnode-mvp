"use client";
import React from "react";
import { 
  TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, GitBranch, Target 
} from "lucide-react";

interface ImpactAnalysisProps {
  action: string;
  resource: string;
  changes: Record<string, any>;
}

export default function ImpactAnalysis({ action, resource, changes }: ImpactAnalysisProps) {
  // Calcular impacto basado en el tipo de recurso y cambios
  const calculateImpact = () => {
    if (resource === "Department" && changes.friction_score) {
      const old = changes.friction_score.old;
      const current = changes.friction_score.new;
      const improvement = old - current;
      
      return {
        immediate: {
          type: improvement > 0 ? "positive" : "negative",
          description: `Friction Score ${improvement > 0 ? 'mejoró' : 'empeoró'} ${Math.abs(improvement)} puntos`,
          percentage: `${Math.abs((improvement / old) * 100).toFixed(1)}%`,
          icon: improvement > 0 ? TrendingUp : TrendingDown
        },
        cascade: [
          {
            type: "info",
            description: "3 insights fueron recalculados automáticamente",
            icon: GitBranch
          },
          {
            type: improvement > 0 ? "success" : "warning",
            description: `${improvement > 0 ? '2 alertas fueron resueltas' : '1 nueva alerta fue generada'}`,
            icon: improvement > 0 ? CheckCircle : AlertTriangle
          }
        ],
        metrics: {
          affected: 5,
          improved: improvement > 0 ? 3 : 0,
          degraded: improvement > 0 ? 0 : 2
        }
      };
    }

    if (action === "created") {
      return {
        immediate: {
          type: "neutral",
          description: `${resource} creado exitosamente`,
          icon: CheckCircle
        },
        cascade: [
          {
            type: "info",
            description: "Disponible para análisis y visualización",
            icon: Target
          },
          {
            type: "info",
            description: "Visible en dashboard principal",
            icon: GitBranch
          }
        ],
        metrics: {
          affected: 1,
          improved: 1,
          degraded: 0
        }
      };
    }

    if (action === "deleted") {
      return {
        immediate: {
          type: "warning",
          description: `${resource} eliminado`,
          icon: AlertTriangle
        },
        cascade: [
          {
            type: "warning",
            description: "Referencias actualizadas en recursos relacionados",
            icon: GitBranch
          }
        ],
        metrics: {
          affected: 2,
          improved: 0,
          degraded: 0
        }
      };
    }

    return null;
  };

  const impact = calculateImpact();

  if (!impact) return null;

  const getImpactColor = (type: string) => {
    switch (type) {
      case "positive": return "text-green-600 bg-green-50 border-green-200";
      case "negative": return "text-red-600 bg-red-50 border-red-200";
      case "warning": return "text-orange-600 bg-orange-50 border-orange-200";
      case "success": return "text-green-600 bg-green-50 border-green-200";
      case "info": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const Icon = impact.immediate.icon;

  return (
    <div className="space-y-4">
      {/* Impacto Inmediato */}
      <div className={`rounded-lg p-4 border ${getImpactColor(impact.immediate.type)}`}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold mb-1">Impacto Inmediato</div>
            <div className="text-sm">{impact.immediate.description}</div>
            {impact.immediate.percentage && (
              <div className="text-lg font-bold mt-2">{impact.immediate.percentage}</div>
            )}
          </div>
        </div>
      </div>

      {/* Efectos en Cascada */}
      {impact.cascade && impact.cascade.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">Efectos en Cascada</div>
          <div className="space-y-2">
            {impact.cascade.map((effect: any, index: number) => {
              const CascadeIcon = effect.icon;
              return (
                <div key={index} className="flex items-start gap-2">
                  <CascadeIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    effect.type === "success" ? "text-green-600" :
                    effect.type === "warning" ? "text-orange-600" :
                    "text-blue-600"
                  }`} />
                  <span className="text-sm text-gray-700">{effect.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Métricas de Impacto */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{impact.metrics.affected}</div>
          <div className="text-xs text-gray-600 mt-1">Recursos afectados</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{impact.metrics.improved}</div>
          <div className="text-xs text-green-700 mt-1">Mejoras</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{impact.metrics.degraded}</div>
          <div className="text-xs text-red-700 mt-1">Degradaciones</div>
        </div>
      </div>
    </div>
  );
}