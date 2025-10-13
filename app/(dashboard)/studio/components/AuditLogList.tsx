"use client";
import React from "react";
import { mockAuditLogs } from "@/lib/mock-data";

export default function AuditLogList() {
  const getBadgeColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-700";
      case "updated":
        return "bg-blue-100 text-blue-700";
      case "deleted":
        return "bg-red-100 text-red-700";
      case "generated":
      case "executed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      day: "2-digit",
      month: "short"
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Historial de acciones
      </h2>
      <div className="space-y-3">
        {mockAuditLogs.map((log) => (
          <div
            key={log.audit_id}
            className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-none"
          >
            <div className="flex items-start gap-3">
              <div
                className={`px-2 py-1 rounded-md text-xs font-medium ${getBadgeColor(
                  log.action
                )}`}
              >
                {log.action.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">
                    {log.actor_type === "user" ? "Usuario" : "Sistema"}
                  </span>{" "}
                  realizó una acción sobre{" "}
                  <span className="font-semibold">{log.target_table}</span>
                </p>
                <p className="text-xs text-gray-500">
                  ID: {log.target_id} – {formatTime(log.ts)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}