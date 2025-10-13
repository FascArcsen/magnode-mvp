'use client';

import { AlertCircle } from 'lucide-react';
import { mockDashboardMetrics, mockInsights, mockDepartments } from '@/lib/mock-data';
import { MetricCard, Card, Button, StatusIndicator } from '@/components/ui';

export default function DashboardPage() {
  const metrics = [
    { label: 'New Customers', value: mockDashboardMetrics.newCustomers, change: '+0.5%', changeType: 'positive' as const },
    { label: 'CSAT', value: mockDashboardMetrics.csat, change: '+0.5%', changeType: 'positive' as const },
    { label: 'Product Sold', value: mockDashboardMetrics.productSold, change: '+1.2%', changeType: 'positive' as const },
    { label: 'Total Order', value: mockDashboardMetrics.totalOrder, change: '+5%', changeType: 'positive' as const },
    { label: 'Total Sales', value: `$${mockDashboardMetrics.totalSales}k`, change: '+8%', changeType: 'positive' as const },
    { label: 'Fulfillment Rate', value: `${mockDashboardMetrics.fulfillmentRate}`, change: '+8%', changeType: 'positive' as const },
  ];

  return (
    <div className="space-y-section">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-syne font-bold text-text-primary">Resumen operativo</h1>
        <p className="text-sm font-exo text-text-secondary mt-1">Overview of your operational performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations - 2/3 width */}
        <div className="lg:col-span-2">
          <Card padding="none" shadow="md">
            <div className="p-6 border-b border-border">
              <h2 className="text-h2 font-syne font-bold text-text-primary">Recomendaciones basadas en tus procesos</h2>
              <p className="text-sm font-exo text-text-secondary mt-1">Critical issues detected</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockInsights.map((insight) => (
                  <div
                    key={insight.insight_id}
                    className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-status-critical flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-exo font-semibold text-text-primary">{insight.title}</h3>
                          <p className="text-sm font-exo text-text-secondary mt-1">{insight.detail}</p>
                        </div>
                        <StatusIndicator status="critical" size="sm" />
                      </div>
                      <Button variant="ghost" size="sm" className="mt-3 text-status-critical hover:text-red-700">
                        Ver detalles →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Department Performance - 1/3 width */}
        <div>
          <Card padding="none" shadow="md">
            <div className="p-6 border-b border-border">
              <h2 className="text-h2 font-syne font-bold text-text-primary">Rendimiento por Departamento</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockDepartments.slice(0, 4).map((dept) => {
                  // Determinar el color basado en el status
                  const getStatusColor = (status: string) => {
                    if (status === 'critical') return 'bg-status-critical';
                    if (status === 'warning') return 'bg-status-warning';
                    return 'bg-status-success';
                  };

                  const getTextColor = (status: string) => {
                    if (status === 'critical') return 'text-status-critical';
                    if (status === 'warning') return 'text-status-warning';
                    return 'text-status-success';
                  };

                  return (
                    <div key={dept.dept_id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-exo font-medium text-text-primary">{dept.dept_name}</span>
                        <span className={`text-sm font-exo font-bold ${getTextColor(dept.status)}`}>
                          {dept.friction_score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getStatusColor(dept.status)}`}
                          style={{ width: `${dept.friction_score}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-exo text-text-tertiary">{dept.total_processes} procesos</span>
                        <span className="text-xs font-exo text-text-tertiary">{dept.critical_processes} críticos</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}