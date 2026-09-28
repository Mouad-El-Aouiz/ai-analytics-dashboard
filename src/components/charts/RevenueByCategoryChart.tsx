import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { RevenueByCategory } from "../../types/analytics";

interface RevenueByCategoryChartProps {
  data: RevenueByCategory[];
}

// Palette réutilisable pour distinguer les catégories.
const COLORS = [
  "#0ea5e9",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
];

function RevenueByCategoryChart({ data }: RevenueByCategoryChartProps) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Revenue by category
        </h2>

        <p className="text-sm text-gray-500">
          Share of each product category
        </p>
      </div>

      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          No data available for this period.
        </p>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.category}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
              />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default RevenueByCategoryChart;