"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { mockDepartments } from "@/lib/mock-data";
import { criticalProcesses, departmentConnections } from "@/lib/process-data";
import type { ProcessSummary } from "@/types/database";

// =============================
// Tipos de datos explícitos
// =============================
interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "customer" | "department" | "process";
  status?: "healthy" | "warning" | "critical";
  data?: any;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  status: "healthy" | "warning" | "critical";
  processes: number;
}

interface GraphProps {
  onSelectProcess: (process: ProcessSummary) => void;
}

// =============================
// Componente principal
// =============================
export default function DepartmentGraph({ onSelectProcess }: GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 1000;
    const height = 700;

    // Limpiar gráfico previo
    d3.select(svgRef.current).selectAll("*").remove();

    // =============================
    // Construir nodos desde datos reales
    // =============================
    const nodes: Node[] = [
      { 
        id: "Customer", 
        name: "Customer", 
        type: "customer",
        status: "healthy"
      },
      ...mockDepartments.map(d => ({
        id: d.dept_name,
        name: d.dept_name,
        type: "department" as const,
        status: d.status,
        data: d
      })),
      ...criticalProcesses.slice(0, 10).map(p => ({
        id: p.process_key,
        name: p.name,
        type: "process" as const,
        status: p.status,
        data: p
      }))
    ];

    // Validar que todos los nodos existen
    const nodeIds = new Set(nodes.map(n => n.id));

    // =============================
    // Construir enlaces desde datos reales
    // =============================
    const links: Link[] = [];

    // Enlaces entre departamentos
    departmentConnections.forEach(conn => {
      if (nodeIds.has(conn.source) && nodeIds.has(conn.target)) {
        links.push({
          source: conn.source,
          target: conn.target,
          status: conn.status,
          processes: conn.processes
        });
      }
    });

    // Enlaces de procesos
    criticalProcesses.slice(0, 10).forEach(p => {
      if (nodeIds.has(p.from_dept) && nodeIds.has(p.process_key)) {
        links.push({
          source: p.from_dept,
          target: p.process_key,
          status: p.status,
          processes: 1
        });
      }
      if (nodeIds.has(p.process_key) && nodeIds.has(p.to_dept)) {
        links.push({
          source: p.process_key,
          target: p.to_dept,
          status: p.status,
          processes: 1
        });
      }
    });

    // =============================
    // Configurar SVG
    // =============================
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g");

    // =============================
    // Zoom y Pan
    // =============================
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // =============================
    // Simulación con fuerzas
    // =============================
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d: Node) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(60));

    // =============================
    // Enlaces
    // =============================
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => {
        if (d.status === "critical") return "#dc2626";
        if (d.status === "warning") return "#f59e0b";
        return "#10b981";
      })
      .attr("stroke-width", (d) => Math.min(d.processes * 2, 6))
      .attr("stroke-opacity", 0.6);

    // =============================
    // Nodos
    // =============================
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3.drag<any, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Círculos de nodos
    node
      .append("circle")
      .attr("r", (d) => (d.type === "process" ? 20 : 45))
      .attr("fill", (d) => {
        if (d.type === "customer") return "#3b82f6";
        if (d.type === "process") {
          if (d.status === "critical") return "#dc2626";
          if (d.status === "warning") return "#f59e0b";
          return "#10b981";
        }
        if (d.status === "critical") return "#fee2e2";
        if (d.status === "warning") return "#fef3c7";
        return "#d1fae5";
      })
      .attr("stroke", (d) => {
        if (d.type === "customer") return "#2563eb";
        if (d.type === "process") return "white";
        if (d.status === "critical") return "#dc2626";
        if (d.status === "warning") return "#f59e0b";
        return "#10b981";
      })
      .attr("stroke-width", 3);

    // Etiquetas de nodos
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.type === "process" ? 5 : -10))
      .attr("font-size", (d) => (d.type === "process" ? 16 : 12))
      .attr("font-weight", 600)
      .attr("fill", (d) => (d.type === "process" ? "white" : "#1f2937"))
      .text((d) => (d.type === "process" ? "⚙" : d.name));

    // Click handler para procesos
    node.on("click", (event, d) => {
      if (d.type === "process" && d.data) {
        onSelectProcess(d.data);
      }
    });

    // Métricas para departamentos
    node
      .filter((d) => d.type === "department" && d.data)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 10)
      .attr("font-size", 10)
      .attr("fill", "#6b7280")
      .text((d) => `${d.data.total_processes} processes`);

    // =============================
    // Actualización de posiciones
    // =============================
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Limpieza
    return () => {
      simulation.stop();
    };
  }, [onSelectProcess]);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="bg-white rounded-xl shadow-md w-full h-full"
      />
      
      {/* Leyenda */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md text-xs">
        <div className="font-semibold mb-2">Leyenda:</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Customer</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full bg-red-600"></div>
          <span>Critical (&gt;100h)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Healthy</span>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md text-xs text-gray-600">
        🖱️ Drag nodes | 🔍 Scroll to zoom | ⚙️ Click process for details
      </div>
    </div>
  );
}