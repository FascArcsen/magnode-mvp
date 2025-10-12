export default function DepartmentTable() {
  const data = [
    { dept: "Sales", processes: 12, friction: 87, issue: "KYC Blocked" },
    { dept: "Support", processes: 8, friction: 82, issue: "Ticket Ignored" },
    { dept: "Finance", processes: 6, friction: 54, issue: "Approval Slow" },
  ];

  return (
    <table className="w-full bg-white rounded-xl shadow-sm">
      <thead>
        <tr className="text-left border-b border-gray-200">
          <th className="p-3">Departamento</th>
          <th className="p-3">Procesos</th>
          <th className="p-3">Friction</th>
          <th className="p-3">Top Issue</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="p-3">{row.dept}</td>
            <td className="p-3">{row.processes}</td>
            <td
              className={`p-3 font-semibold ${
                row.friction > 80 ? "text-red-500" : "text-yellow-500"
              }`}
            >
              {row.friction}/100
            </td>
            <td className="p-3">{row.issue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}