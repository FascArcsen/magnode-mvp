import { mockDepartments } from "@/lib/mock-data";
import { criticalProcesses } from "@/lib/process-data";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export default function DepartmentTable() {
  // Calcular el top issue de cada departamento
  const getDepartmentTopIssue = (deptName: string) => {
    const deptProcesses = criticalProcesses.filter(
      (p) => p.from_dept === deptName || p.to_dept === deptName
    );

    if (deptProcesses.length === 0) return null;

    // Retornar el proceso con mayor tiempo
    return deptProcesses.reduce((prev, current) =>
      prev.avg_time_hours > current.avg_time_hours ? prev : current
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full bg-white rounded-xl shadow-sm">
        <thead>
          <tr className="text-left border-b-2 border-gray-200 bg-gray-50">
            <th className="p-4 font-syne font-semibold text-sm text-gray-700">
              Estado
            </th>
            <th className="p-4 font-syne font-semibold text-sm text-gray-700">
              Departamento
            </th>
            <th className="p-4 font-syne font-semibold text-sm text-gray-700">
              Total Procesos
            </th>
            <th className="p-4 font-syne font-semibold text-sm text-gray-700">
              Procesos Críticos
            </th>
            <th className="p-4 font-syne font-semibold text-sm text-gray-700">
              Friction Score
            </th>
            <th className="p-4 font-syne font-semibold text-sm text-gray-700">
              Top Issue
            </th>
          </tr>
        </thead>
        <tbody>
          {mockDepartments.map((dept) => {
            const topIssue = getDepartmentTopIssue(dept.dept_name);

            return (
              <tr
                key={dept.dept_id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Status Badge */}
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      dept.status === "critical"
                        ? "bg-red-100 text-red-700"
                        : dept.status === "warning"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {dept.status === "critical" && "🔴"}
                    {dept.status === "warning" && "🟡"}
                    {dept.status === "healthy" && "🟢"}
                    <span className="capitalize">{dept.status}</span>
                  </span>
                </td>

                {/* Department Name */}
                <td className="p-4">
                  <div className="font-semibold text-gray-900">
                    {dept.dept_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {dept.dept_id}
                  </div>
                </td>

                {/* Total Processes */}
                <td className="p-4">
                  <div className="text-lg font-bold text-gray-900">
                    {dept.total_processes}
                  </div>
                </td>

                {/* Critical Processes */}
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {dept.critical_processes > 0 && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-lg font-bold ${
                        dept.critical_processes > 3
                          ? "text-red-600"
                          : dept.critical_processes > 0
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {dept.critical_processes}
                    </span>
                  </div>
                </td>

                {/* Friction Score */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold ${
                        dept.friction_score > 80
                          ? "text-red-600"
                          : dept.friction_score > 60
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {dept.friction_score}
                    </span>
                    <div className="flex-1 max-w-[120px]">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            dept.friction_score > 80
                              ? "bg-red-500"
                              : dept.friction_score > 60
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${dept.friction_score}%` }}
                        />
                      </div>
                    </div>
                    {dept.friction_score > 70 ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </td>

                {/* Top Issue */}
                <td className="p-4">
                  {topIssue ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {topIssue.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {topIssue.avg_time_hours}h avg
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Sin issues críticos
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              Total Departments
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {mockDepartments.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">
              Critical Departments
            </div>
            <div className="text-2xl font-bold text-red-600">
              {mockDepartments.filter((d) => d.status === "critical").length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Processes</div>
            <div className="text-2xl font-bold text-gray-900">
              {mockDepartments.reduce((acc, d) => acc + d.total_processes, 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Avg Friction</div>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(
                mockDepartments.reduce((acc, d) => acc + d.friction_score, 0) /
                  mockDepartments.length
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}