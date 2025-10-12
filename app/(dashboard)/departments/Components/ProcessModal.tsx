import React from "react";
import type { Node } from "../data/mockDepartments";

interface ProcessModalProps {
  process: Node;
  onClose: () => void;
}

export default function ProcessModal({ process, onClose }: ProcessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>

        <h2 className="font-syne text-xl text-orange-500 mb-2">
          {process.name}
        </h2>

        <p className="text-sm text-gray-700">
          Estado:{" "}
          <strong>
            {process.color === "#ef4444" ? "🔴 Crítico" : "🟢 Operativo"}
          </strong>
        </p>
      </div>
    </div>
  );
}