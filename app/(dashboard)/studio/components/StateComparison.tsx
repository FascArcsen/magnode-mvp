"use client";
import React from "react";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StateComparisonProps {
  before: Record<string, any>;
  after: Record<string, any>;
  resourceType: string;
}

export default function StateComparison({ before, after, resourceType }: StateComparisonProps) {
  const changes = Object.keys({ ...before, ...after }).map(key => {
    const beforeVal = before[key];
    const afterVal = after[key];
    
    if (beforeVal === afterVal) return null;
    
    let changeType: "increase" | "decrease" | "changed" = "changed";
    let icon = <Minus className="w-4 h-4" />;
    
    if (typeof beforeVal === "number" && typeof afterVal === "number") {
      if (afterVal > beforeVal) {
        changeType = "increase";
        icon = <TrendingUp className="w-4 h-4 text-green-600" />;
      } else {
        changeType = "decrease";
        icon = <TrendingDown className="w-4 h-4 text-red-600" />;
      }
    }
    
    return {
      key,
      beforeVal,
      afterVal,
      changeType,
      icon
    };
  }).filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Comparación de Estados</h3>
      
      <div className="space-y-3">
        {changes.map((change: any) => (
          <div key={change.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3 flex-1">
              {change.icon}
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-700 capitalize">
                  {change.key.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 line-through">
                    {typeof change.beforeVal === "object" 
                      ? JSON.stringify(change.beforeVal)
                      : String(change.beforeVal)}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className={`text-xs font-semibold ${
                    change.changeType === "increase" ? "text-green-600" :
                    change.changeType === "decrease" ? "text-red-600" :
                    "text-blue-600"
                  }`}>
                    {typeof change.afterVal === "object"
                      ? JSON.stringify(change.afterVal)
                      : String(change.afterVal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {changes.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          Sin cambios detectados
        </div>
      )}
    </div>
  );
}