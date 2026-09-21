import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { type MonthlyUsers } from "../../types/analytics";

interface UsersChartProps {
  data: MonthlyUsers[];
}

function UsersChart({ data }: UsersChartProps) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Users
        </h2>

        <p className="text-sm text-gray-500">
          New users per month
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString(),
                "Users",
              ]}
            />

            <Line
              type="monotone"
              dataKey="users"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UsersChart;