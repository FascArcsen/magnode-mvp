"use client";

import { useState } from "react";
import DepartmentsTabs, { TabType } from "./Components/DepartmentsTabs";
import DepartmentSidebar from "./Components/DepartmentSidebar";
import DepartmentGraph from "./Components/DepartmentGraph";
import DepartmentTable from "./Components/DepartmentTable";
import ProcessModal from "./Components/ProcessModal";

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("map");
  const [selectedProcess, setSelectedProcess] = useState<any>(null);

  return (
    <div className="flex flex-row w-full h-screen bg-gray-50">
      {/* Sidebar izquierdo */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Tabs superiores */}
        <DepartmentsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab} // ✅ aquí solo se pasa la referencia, no se ejecuta
        />

        {/* Contenido dinámico */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-4 overflow-auto">
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