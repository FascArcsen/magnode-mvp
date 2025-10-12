export default function DepartmentSidebar() {
  const issues = [
    { label: "KYC", time: "168h", color: "red" },
    { label: "Support", time: "7h", color: "red" },
    { label: "Finance", time: "5h", color: "yellow" },
  ];

  return (
    <aside className="w-64 p-4 bg-white border-l border-gray-200 shadow-sm">
      <h3 className="text-lg font-syne text-gray-800 mb-4">Top 5 Issues</h3>
      <ul className="flex flex-col gap-2">
        {issues.map((i, idx) => (
          <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <span className={`text-${i.color}-500 font-semibold`}>{i.label}</span>
            <span className="text-sm text-gray-600">{i.time}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}