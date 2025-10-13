"use client";
import React, { useState, useMemo } from "react";
import { mockAuditLogs } from "@/lib/mock-data";
import { 
  Activity, User, Cpu, Plus, Edit, Trash2, Play, 
  Search, Filter, Download, Calendar, RotateCcw, 
  Copy, Star, MessageSquare, TrendingUp, ChevronDown,
  ChevronRight, X, Clock, AlertCircle, CheckCircle
} from "lucide-react";

interface ExpandedLog {
  logId: string;
  showFullDiff: boolean;
}

export default function AuditLogList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    action: "all",
    resource: "all",
    dateRange: "all",
    actor: "all"
  });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [groupBy, setGroupBy] = useState<"none" | "date" | "resource" | "session">("none");

  // Filtrar y buscar logs
  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      // Búsqueda
      const searchMatch = searchQuery === "" || 
        log.target_table.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtros
      const actionMatch = selectedFilters.action === "all" || log.action === selectedFilters.action;
      const resourceMatch = selectedFilters.resource === "all" || log.target_table === selectedFilters.resource;
      const actorMatch = selectedFilters.actor === "all" || log.actor_type === selectedFilters.actor;

      // Filtro de fecha
      let dateMatch = true;
      if (selectedFilters.dateRange !== "all") {
        const logDate = new Date(log.ts);
        const now = new Date();
        const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);
        
        switch (selectedFilters.dateRange) {
          case "24h": dateMatch = diffHours <= 24; break;
          case "7d": dateMatch = diffHours <= 168; break;
          case "30d": dateMatch = diffHours <= 720; break;
        }
      }

      return searchMatch && actionMatch && resourceMatch && actorMatch && dateMatch;
    });
  }, [searchQuery, selectedFilters]);

  // Análisis de actividad
  const activityStats = useMemo(() => {
    const userLogs = mockAuditLogs.filter(log => log.actor_type === "user");
    const actionCounts = userLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resourceCounts = userLogs.reduce((acc, log) => {
      acc[log.target_table] = (acc[log.target_table] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Actividad por día
    const dayActivity = userLogs.reduce((acc, log) => {
      const day = new Date(log.ts).toLocaleDateString('es-ES', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveDay = Object.entries(dayActivity).sort((a, b) => b[1] - a[1])[0];
    const mostModifiedResource = Object.entries(resourceCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total: userLogs.length,
      actionCounts,
      resourceCounts,
      mostActiveDay,
      mostModifiedResource
    };
  }, []);

  // Heatmap data
  const heatmapData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return days.map(day => {
      const count = mockAuditLogs.filter(log => {
        const logDay = new Date(log.ts).toLocaleDateString('es-ES', { weekday: 'short' });
        return logDay === day && log.actor_type === "user";
      }).length;
      return { day, count };
    });
  }, []);

  const maxHeatmapCount = Math.max(...heatmapData.map(d => d.count));

  // Funciones de utilidad
  const getBadgeColor = (action: string) => {
    switch (action) {
      case "created": return "bg-green-100 text-green-700 border-green-200";
      case "updated": return "bg-blue-100 text-blue-700 border-blue-200";
      case "deleted": return "bg-red-100 text-red-700 border-red-200";
      case "generated": return "bg-purple-100 text-purple-700 border-purple-200";
      case "executed": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created": return <Plus className="w-4 h-4" />;
      case "updated": return <Edit className="w-4 h-4" />;
      case "deleted": return <Trash2 className="w-4 h-4" />;
      case "generated": return <Activity className="w-4 h-4" />;
      case "executed": return <Play className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActorIcon = (actorType: string) => {
    return actorType === "user" ? (
      <User className="w-4 h-4 text-blue-600" />
    ) : (
      <Cpu className="w-4 h-4 text-purple-600" />
    );
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins} min`;
    else if (diffHours < 24) return `hace ${diffHours}h`;
    else if (diffDays < 7) return `hace ${diffDays}d`;
    else return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: "Creado",
      updated: "Actualizado",
      deleted: "Eliminado",
      generated: "Generado",
      executed: "Ejecutado",
    };
    return labels[action] || action;
  };

  const getTargetLabel = (targetTable: string) => {
    const labels: Record<string, string> = {
      Scenario: "Escenario",
      Insight: "Insight",
      Department: "Departamento",
      Recommendation: "Recomendación",
    };
    return labels[targetTable] || targetTable;
  };

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ["Fecha", "Actor", "Acción", "Recurso", "ID", "Detalles"];
    const rows = filteredLogs.map(log => [
      new Date(log.ts).toLocaleString(),
      log.actor_type === "user" ? "Usuario" : log.actor_id,
      getActionLabel(log.action),
      getTargetLabel(log.target_table),
      log.target_id,
      JSON.stringify(log.diff_json)
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-acciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Toggle favorito
  const toggleFavorite = (logId: string) => {
    setFavorites(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  // Agregar nota
  const addNote = (logId: string, note: string) => {
    setNotes(prev => ({ ...prev, [logId]: note }));
  };

  // Calcular impacto
  const getImpactInfo = (log: any) => {
    // Simular cálculo de impacto basado en el tipo de acción
    if (log.action === "updated" && log.diff_json.friction_score) {
      const oldScore = log.diff_json.friction_score.old;
      const newScore = log.diff_json.friction_score.new;
      const improvement = oldScore - newScore;
      return {
        type: improvement > 0 ? "positive" : "negative",
        description: `Score ${improvement > 0 ? 'mejoró' : 'empeoró'} ${Math.abs(improvement)}%`,
        cascade: ["2 insights actualizados", "1 recomendación generada"]
      };
    }
    
    if (log.action === "created") {
      return {
        type: "neutral",
        description: "Recurso creado exitosamente",
        cascade: ["Disponible para análisis", "Visible en dashboard"]
      };
    }

    return null;
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSelectedFilters({
      action: "all",
      resource: "all",
      dateRange: "all",
      actor: "all"
    });
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {/* Header con stats y análisis personal */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {activityStats.total}
          </div>
          <div className="text-xs text-gray-500 mt-1">Tus acciones</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {activityStats.actionCounts.updated || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Actualizaciones</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {activityStats.actionCounts.created || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Creaciones</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {activityStats.mostActiveDay?.[0] || "N/A"}
          </div>
          <div className="text-xs text-gray-500 mt-1">Día más activo</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900 truncate">
            {activityStats.mostModifiedResource?.[0] || "N/A"}
          </div>
          <div className="text-xs text-gray-500 mt-1">Más modificado</div>
        </div>
      </div>

      {/* Heatmap de actividad */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Heatmap de Actividad Semanal</h3>
          <span className="text-xs text-gray-500">
            {heatmapData.reduce((acc, d) => acc + d.count, 0)} acciones esta semana
          </span>
        </div>
        <div className="space-y-2">
          {heatmapData.map(({ day, count }) => {
            const percentage = maxHeatmapCount > 0 ? (count / maxHeatmapCount) * 100 : 0;
            return (
              <div key={day} className="flex items-center gap-3 group">
                <span className="text-xs text-gray-600 w-8 font-medium">{day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden group-hover:bg-gray-200 transition-colors">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  >
                    {count > 0 && (
                      <span className="text-xs font-semibold text-white">{count}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 w-20 text-right">
                  {count} {count === 1 ? 'acción' : 'acciones'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por recurso, ID, acción..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {Object.values(selectedFilters).some(v => v !== "all") && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {Object.values(selectedFilters).filter(v => v !== "all").length}
              </span>
            )}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4 bg-gray-50 -mx-4 px-4 py-4 rounded-b-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Acción</label>
                <select
                  value={selectedFilters.action}
                  onChange={(e) => setSelectedFilters({...selectedFilters, action: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="all">Todas</option>
                  <option value="created">Creado</option>
                  <option value="updated">Actualizado</option>
                  <option value="deleted">Eliminado</option>
                  <option value="generated">Generado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Recurso</label>
                <select
                  value={selectedFilters.resource}
                  onChange={(e) => setSelectedFilters({...selectedFilters, resource: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="Scenario">Escenarios</option>
                  <option value="Insight">Insights</option>
                  <option value="Department">Departamentos</option>
                  <option value="Recommendation">Recomendaciones</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Período</label>
                <select
                  value={selectedFilters.dateRange}
                  onChange={(e) => setSelectedFilters({...selectedFilters, dateRange: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="all">Todo el tiempo</option>
                  <option value="24h">Últimas 24h</option>
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Actor</label>
                <select
                  value={selectedFilters.actor}
                  onChange={(e) => setSelectedFilters({...selectedFilters, actor: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="user">Solo mis acciones</option>
                  <option value="system">Solo sistema</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                {Object.values(selectedFilters).filter(v => v !== "all").length} filtros activos
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline de acciones */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Timeline de Actividad
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'acción encontrada' : 'acciones encontradas'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Vista:</span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setGroupBy("none")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  groupBy === "none" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setGroupBy("date")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  groupBy === "date" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No se encontraron acciones con los filtros seleccionados</p>
            </div>
          ) : groupBy === "date" ? (
            // Vista de Cards (Moderna)
            <div className="p-4 grid grid-cols-1 gap-3">
              {filteredLogs.map((log) => {
                const impact = getImpactInfo(log);
                const isExpanded = expandedLog === log.audit_id;
                const isFavorite = favorites.includes(log.audit_id);
                const hasNote = notes[log.audit_id];

                return (
                  <div
                    key={log.audit_id}
                    className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-orange-200 transition-all duration-200"
                  >
                    {/* Header del Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getBadgeColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${getBadgeColor(log.action)}`}>
                              {getActionLabel(log.action).toUpperCase()}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                              {getTargetLabel(log.target_table)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getActorIcon(log.actor_type)}
                            <span className="text-sm font-medium text-gray-900">
                              {log.actor_type === "user" ? "Tú" : log.actor_id === "mag-ai" ? "MagNode AI" : "Sistema"}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{formatTime(log.ts)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Icons */}
                      <div className="flex items-center gap-2">
                        {isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        {hasNote && <MessageSquare className="w-4 h-4 text-blue-500 fill-blue-100" />}
                      </div>
                    </div>

                    {/* ID y Metadata */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                      <span className="font-mono bg-gray-50 px-2 py-1 rounded">ID: {log.target_id}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.ts).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Diff Preview */}
                    {log.diff_json && Object.keys(log.diff_json).length > 0 && (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                          <span className="text-xs font-semibold text-gray-700">Cambios realizados</span>
                        </div>
                        <div className="space-y-1 text-xs font-mono text-gray-700">
                          {Object.entries(log.diff_json)
                            .slice(0, isExpanded ? undefined : 2)
                            .map(([key, value]) => (
                              <div key={key} className="flex items-start gap-2">
                                <span className="text-orange-600">→</span>
                                <span className="text-gray-600">{key}:</span>
                                <span className="text-gray-900 font-medium flex-1 truncate">
                                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Impacto (si está expandido) */}
                    {impact && isExpanded && (
                      <div className={`rounded-lg p-3 mb-3 border ${
                        impact.type === "positive" ? "bg-green-50 border-green-200" :
                        impact.type === "negative" ? "bg-red-50 border-red-200" :
                        "bg-blue-50 border-blue-200"
                      }`}>
                        <div className="flex items-start gap-2">
                          {impact.type === "positive" ? <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" /> : 
                           impact.type === "negative" ? <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" /> :
                           <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />}
                          <div className="flex-1">
                            <div className="text-xs font-semibold mb-1">Análisis de Impacto</div>
                            <div className="text-xs mb-2">{impact.description}</div>
                            {impact.cascade && (
                              <div className="space-y-1">
                                {impact.cascade.map((effect, i) => (
                                  <div key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                    <span>•</span>
                                    <span>{effect}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nota del usuario */}
                    {hasNote && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-blue-900 mb-1">Tu nota</div>
                            <div className="text-xs text-blue-700">{hasNote}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedLog(isExpanded ? null : log.audit_id)}
                          className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {isExpanded ? "Contraer" : "Ver más"}
                        </button>
                        
                        {log.actor_type === "user" && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors">
                              <RotateCcw className="w-3 h-3" />
                              Revertir
                            </button>
                            <button className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors">
                              <Copy className="w-3 h-3" />
                              Replicar
                            </button>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(log.audit_id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isFavorite 
                              ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" 
                              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          }`}
                        >
                          <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => {
                            const note = prompt("Agregar nota:");
                            if (note) addNote(log.audit_id, note);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            hasNote
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          }`}
                        >
                          <MessageSquare className={`w-4 h-4 ${hasNote ? 'fill-blue-100' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Vista Timeline (Original mejorada)
            <div className="divide-y divide-gray-100">
              {filteredLogs.map((log) => {
                const impact = getImpactInfo(log);
                const isExpanded = expandedLog === log.audit_id;
                const isFavorite = favorites.includes(log.audit_id);
                const hasNote = notes[log.audit_id];

                return (
                  <div
                    key={log.audit_id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${getBadgeColor(
                            log.action
                          )}`}
                        >
                          {getActionIcon(log.action)}
                        </div>
                        {/* Línea vertical conectora */}
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getActorIcon(log.actor_type)}
                          <span className="text-sm font-semibold text-gray-900">
                            {log.actor_type === "user"
                              ? "Tú"
                              : log.actor_id === "mag-ai"
                              ? "MagNode AI"
                              : "Sistema"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {getActionLabel(log.action).toLowerCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {getTargetLabel(log.target_table)}
                          </span>
                          {isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        </div>

                        {/* Details */}
                        <div className="text-sm text-gray-600 mb-2">
                          ID: <span className="font-mono text-xs">{log.target_id}</span>
                        </div>

                        {/* Diff preview */}
                        {log.diff_json && Object.keys(log.diff_json).length > 0 && (
                          <div className="bg-gray-50 rounded px-3 py-2 text-xs font-mono text-gray-700 mb-2">
                            {Object.entries(log.diff_json)
                              .slice(0, isExpanded ? undefined : 2)
                              .map(([key, value]) => (
                                <div key={key} className="truncate">
                                  <span className="text-gray-500">{key}:</span>{" "}
                                  <span className="text-gray-900">
                                    {typeof value === "object"
                                      ? JSON.stringify(value)
                                      : String(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Impacto */}
                        {impact && isExpanded && (
                          <div className={`rounded-lg p-3 mb-2 ${
                            impact.type === "positive" ? "bg-green-50 border border-green-200" :
                            impact.type === "negative" ? "bg-red-50 border border-red-200" :
                            "bg-blue-50 border border-blue-200"
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {impact.type === "positive" ? <TrendingUp className="w-4 h-4 text-green-600" /> : 
                               impact.type === "negative" ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                               <CheckCircle className="w-4 h-4 text-blue-600" />}
                              <span className="text-sm font-semibold">Impacto</span>
                            </div>
                            <div className="text-xs text-gray-700 mb-2">{impact.description}</div>
                            {impact.cascade && (
                              <div className="text-xs text-gray-600 space-y-1">
                                <div className="font-semibold">Efectos en cascada:</div>
                                {impact.cascade.map((effect, i) => (
                                  <div key={i} className="pl-3">• {effect}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Nota del usuario */}
                        {hasNote && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-blue-900">Tu nota:</div>
                                <div className="text-xs text-blue-700">{hasNote}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(log.ts)}</span>
                          <span>•</span>
                          <span>
                            {new Date(log.ts).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setExpandedLog(isExpanded ? null : log.audit_id)}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                          >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            {isExpanded ? "Contraer" : "Ver detalles"}
                          </button>
                          
                          {log.actor_type === "user" && (
                            <>
                              <button className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" />
                                Revertir
                              </button>
                              <button className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1">
                                <Copy className="w-3 h-3" />
                                Replicar
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => toggleFavorite(log.audit_id)}
                            className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
                          >
                            <Star className={`w-3 h-3 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            {isFavorite ? "Favorito" : "Marcar"}
                          </button>
                          
                          <button
                            onClick={() => {
                              const note = prompt("Agregar nota:");
                              if (note) addNote(log.audit_id, note);
                            }}
                            className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Nota
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Mostrando {filteredLogs.length} de {mockAuditLogs.length} acciones totales
          </span>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Ver historial completo →
          </button>
        </div>
      </div>
    </div>
  );
}