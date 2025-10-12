"use client";
import React from "react";

export type TabType = "map" | "table";

interface DepartmentsTabsProps {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
}

export default function DepartmentsTabs({
  activeTab,
  setActiveTab,
}: DepartmentsTabsProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: "map", label: "Mapa de Relaciones" },
    { id: "table", label: "Vista por Departamentos" },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)} // ✅ este es el único lugar correcto
          className={`px-4 py-2 font-syne text-sm transition-colors ${
            activeTab === tab.id
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-500 hover:text-orange-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
