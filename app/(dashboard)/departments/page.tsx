"use client";

import { useState } from "react";
import DepartmentsTabs, { TabType } from "./Components/DepartmentsTabs";
import DepartmentSidebar from "./Components/DepartmentSidebar";
import DepartmentGraph from "./Components/DepartmentGraph";
import DepartmentTable from "./Components/DepartmentTable";
import ProcessModal from "./Components/ProcessModal";
import type { ProcessSummary } from "@/types/database";

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("map");
  const [selectedProcess, setSelectedProcess] = useState<ProcessSummary | null>(null);

  return (
    <div className="flex flex-row w-full min-h-screen bg-gray-50">
      {/* Contenido Principal */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-syne font-bold text-gray-900">
            Departamentos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualiza y gestiona procesos entre departamentos
          </p>
        </div>

        {/* Tabs superiores */}
        <DepartmentsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Contenido dinámico */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6 overflow-auto">
          {activeTab === "map" ? (
            <DepartmentGraph onSelectProcess={setSelectedProcess} />
          ) : (
            <DepartmentTable />
          )}
        </div>
      </div>

      {/* Sidebar derecho */}
      <DepartmentSidebar />

      {/* Modal de proceso */}
      {selectedProcess && (
        <ProcessModal
          process={selectedProcess}
          onClose={() => setSelectedProcess(null)}
        />
      )}
    </div>
  );
}