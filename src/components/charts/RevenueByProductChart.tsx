import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { RevenueByProduct } from "../../types/analytics";

interface RevenueByProductChartProps {
  data: RevenueByProduct[];
}

// Top produits par revenu. Limité à 8 pour rester lisible.
function RevenueByProductChart({ data }: RevenueByProductChartProps) {
  const top = data.slice(0, 8);

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Revenue by product
        </h2>

        <p className="text-sm text-gray-500">
          Top products by revenue
        </p>
      </div>

      {top.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          No data available for this period.
        </p>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top}
              layout="vertical"
              margin={{ left: 40, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />

              <XAxis
                type="number"
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />

              <YAxis
                type="category"
                dataKey="product"
                width={130}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
              />

              <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default RevenueByProductChart;