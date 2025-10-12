// mockDepartments.ts
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

export interface Node extends SimulationNodeDatum {
  id: string;
  name: string;
  type: "customer" | "department" | "process";
  color: string;
  x?: number;
  y?: number;
}

export interface Link extends SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  color: string;
  width: number;
}

export const departmentsData: {
  nodes: Node[];
  links: Link[];
} = {
  nodes: [
    { id: "customer", name: "Customer", type: "customer", color: "#3b82f6" },
    { id: "sales", name: "Sales", type: "department", color: "#ef4444" },
    { id: "support", name: "Support", type: "department", color: "#ef4444" },
    { id: "finance", name: "Finance", type: "department", color: "#eab308" },
    { id: "kyc", name: "⚙️ KYC Blocked", type: "process", color: "#ef4444" },
    { id: "account", name: "⚙️ Account Opening", type: "process", color: "#ef4444" },
  ],
  links: [
    { source: "customer", target: "kyc", color: "#ef4444", width: 4 },
    { source: "kyc", target: "sales", color: "#ef4444", width: 3 },
    { source: "sales", target: "account", color: "#ef4444", width: 2 },
    { source: "account", target: "finance", color: "#9ca3af", width: 1 },
  ],
};