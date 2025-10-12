"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { departmentsData } from "../data/mockDepartments";

// =============================
// Tipos de datos explícitos
// =============================
interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "customer" | "department" | "process";
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  color: string;
  width: number;
}

interface GraphProps {
  onSelectProcess: (node: Node) => void;
}

// =============================
// Componente principal
// =============================
export default function DepartmentGraph({ onSelectProcess }: GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Limpiar gráfico previo
    svg.selectAll("*").remove();

    // =============================
    // Simulación con fuerzas
    // =============================
    const simulation = d3
      .forceSimulation<Node>(departmentsData.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(departmentsData.links)
          .id((d: Node) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // =============================
    // Enlaces
    // =============================
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.8)
      .selectAll("line")
      .data(departmentsData.links)
      .join("line")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", (d) => d.width);

    // =============================
    // Nodos
    // =============================
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(departmentsData.nodes)
      .join("circle")
      .attr("r", (d) => (d.type === "process" ? 10 : 18))
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("click", (_, d) => {
        if (d.type === "process") onSelectProcess(d);
      });

    // =============================
    // Etiquetas
    // =============================
    const label = svg
      .append("g")
      .selectAll("text")
      .data(departmentsData.nodes)
      .join("text")
      .text((d) => d.name)
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .attr("dy", -25)
      .attr("fill", "#1f1f1f");

    // =============================
    // Actualización de posiciones
    // =============================
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (typeof d.source !== "string" ? d.source.x ?? 0 : 0))
        .attr("y1", (d) => (typeof d.source !== "string" ? d.source.y ?? 0 : 0))
        .attr("x2", (d) => (typeof d.target !== "string" ? d.target.x ?? 0 : 0))
        .attr("y2", (d) => (typeof d.target !== "string" ? d.target.y ?? 0 : 0));

      node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);

      label.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
    });

    // Limpieza
    return () => {
      simulation.stop();
    };
  }, [onSelectProcess]);

  return <svg ref={svgRef} className="bg-white rounded-xl shadow-md" />;
}