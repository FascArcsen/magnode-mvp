'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { X, AlertCircle } from 'lucide-react';
import { mockDepartments } from '@/lib/mock-data';
import { criticalProcesses, departmentConnections } from '@/lib/process-data';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'customer' | 'department' | 'process';
  status?: 'healthy' | 'warning' | 'critical';
  data?: any;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  status: 'healthy' | 'warning' | 'critical';
  processes: number;
}

export default function DepartmentsPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 1200;
    const height = 700;

    // Create nodes - primero creamos todos los nodos
    const nodes: Node[] = [
      { id: 'Customer', name: 'Customer', type: 'customer' },
      ...mockDepartments.map(d => ({
        id: d.dept_name,
        name: d.dept_name,
        type: 'department' as const,
        status: d.status,
        data: d
      })),
      ...criticalProcesses.slice(0, 10).map(p => ({
        id: p.process_key,
        name: p.name,
        type: 'process' as const,
        status: p.status,
        data: p
      }))
    ];

    // Crear un Set con todos los IDs de nodos existentes para validación
    const nodeIds = new Set(nodes.map(n => n.id));

    // Create links - solo crear enlaces si ambos nodos existen
    const links: Link[] = [];

    // Links entre departamentos
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

    // Links de procesos
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

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        if (d.status === 'critical') return '#dc2626';
        if (d.status === 'warning') return '#f59e0b';
        return '#10b981';
      })
      .attr('stroke-width', d => Math.min(d.processes * 2, 6))
      .attr('stroke-opacity', 0.6);

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Node circles
    node.append('circle')
      .attr('r', d => d.type === 'process' ? 20 : 45)
      .attr('fill', d => {
        if (d.type === 'customer') return '#3b82f6';
        if (d.type === 'process') {
          if (d.status === 'critical') return '#dc2626';
          if (d.status === 'warning') return '#f59e0b';
          return '#10b981';
        }
        if (d.status === 'critical') return '#fee2e2';
        if (d.status === 'warning') return '#fef3c7';
        return '#d1fae5';
      })
      .attr('stroke', d => {
        if (d.type === 'customer') return '#2563eb';
        if (d.type === 'process') return 'white';
        if (d.status === 'critical') return '#dc2626';
        if (d.status === 'warning') return '#f59e0b';
        return '#10b981';
      })
      .attr('stroke-width', 3);

    // Node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'process' ? 5 : -10)
      .attr('font-size', d => d.type === 'process' ? 16 : 12)
      .attr('font-weight', 600)
      .attr('fill', d => d.type === 'process' ? 'white' : '#1f2937')
      .text(d => d.type === 'process' ? '⚙' : d.name);

    // Process click handler
    node.on('click', (event, d) => {
      if (d.type === 'process' && d.data) {
        setSelectedProcess(d.data);
      }
    });

    // Metrics for departments
    node.filter(d => d.type === 'department' && d.data).append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 10)
      .attr('font-size', 10)
      .attr('fill', '#6b7280')
      .text(d => `${d.data.total_processes} processes`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  }, []);

  const topCritical = criticalProcesses
    .filter(p => p.status === 'critical')
    .sort((a, b) => b.avg_time_hours - a.avg_time_hours)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mapa de Relaciones</h1>
        <p className="text-sm text-gray-500 mt-1">Visualización de procesos entre departamentos</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Main Map */}
        <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Leyenda:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">Customer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span className="text-xs text-gray-600">Critical (&gt; 6h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-600">Warning (3-6h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Healthy (&lt; 3h)</span>
              </div>
            </div>
          </div>
          <svg ref={svgRef} className="w-full border border-gray-100 rounded"></svg>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 5 Critical Processes</h3>
            <div className="space-y-3">
              {topCritical.map(process => (
                <div
                  key={process.process_key}
                  className="p-3 bg-red-50 border border-red-200 rounded cursor-pointer hover:bg-red-100"
                  onClick={() => setSelectedProcess(process)}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-900">{process.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{process.avg_time_hours}h avg</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Total Processes</div>
                <div className="text-2xl font-bold text-gray-900">{criticalProcesses.length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Critical Issues</div>
                <div className="text-2xl font-bold text-red-600">
                  {criticalProcesses.filter(p => p.status === 'critical').length}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg Resolution Time</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(criticalProcesses.reduce((acc, p) => acc + p.avg_time_hours, 0) / criticalProcesses.length)}h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{selectedProcess.name}</h2>
              <button onClick={() => setSelectedProcess(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                selectedProcess.status === 'critical' ? 'bg-red-100 text-red-700' :
                selectedProcess.status === 'warning' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {selectedProcess.status.toUpperCase()}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{selectedProcess.avg_time_hours}h</div>
                  <div className="text-xs text-gray-500 mt-1">Avg Time</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{selectedProcess.handoff_count}</div>
                  <div className="text-xs text-gray-500 mt-1">Handoffs</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{Math.round(selectedProcess.completion_rate * 100)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Completion</div>
                </div>
              </div>

              {selectedProcess.user_complaint && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">🗣️ User Complaint</div>
                  <div className="text-sm text-gray-700 italic">"{selectedProcess.user_complaint}"</div>
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-gray-900 mb-2">Process Flow</div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{selectedProcess.from_dept}</span>
                  <span>→</span>
                  <span className="font-semibold text-gray-900">{selectedProcess.name}</span>
                  <span>→</span>
                  <span>{selectedProcess.to_dept}</span>
                </div>
              </div>

              <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                View Playbook Solution →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}