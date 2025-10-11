'use client';

import { TrendingUp, AlertCircle } from 'lucide-react';
import { mockDashboardMetrics, mockInsights, mockDepartments } from '@/lib/mock-data';

export default function DashboardPage() {
  const metrics = [
    { label: 'New Customers', value: mockDashboardMetrics.newCustomers, change: '+0.5%' },
    { label: 'CSAT', value: mockDashboardMetrics.csat, change: '+0.5%' },
    { label: 'Product Sold', value: mockDashboardMetrics.productSold, change: '+1.2%' },
    { label: 'Total Order', value: mockDashboardMetrics.totalOrder, change: '+5%' },
    { label: 'Total Sales', value: `$${mockDashboardMetrics.totalSales}k`, change: '+8%' },
    { label: 'Fulfillment Rate', value: `${mockDashboardMetrics.fulfillmentRate}`, change: '+8%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resumen operativo</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your operational performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-2">{metric.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="flex items-center text-xs font-medium text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                {metric.change}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">from yesterday</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recomendaciones basadas en tus procesos</h2>
            <p className="text-sm text-gray-500 mt-1">Critical issues detected</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockInsights.map((insight) => (
                <div key={insight.insight_id} className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{insight.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{insight.detail}</p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        {insight.severity.toUpperCase()}
                      </span>
                    </div>
                    <button className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium">
                      Ver detalles →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rendimiento por Departamento</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockDepartments.slice(0, 4).map((dept) => (
                <div key={dept.dept_id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{dept.dept_name}</span>
                    <span className={`text-sm font-semibold ${
                      dept.status === 'critical' ? 'text-red-600' :
                      dept.status === 'warning' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {dept.friction_score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        dept.status === 'critical' ? 'bg-red-600' :
                        dept.status === 'warning' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${dept.friction_score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{dept.total_processes} procesos</span>
                    <span className="text-xs text-gray-500">{dept.critical_processes} críticos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}