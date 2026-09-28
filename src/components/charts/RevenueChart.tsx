import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { ForecastPoint } from "../../types/insights";

interface RevenueChartProps {
  data: ForecastPoint[];
}

function RevenueChart({ data }: RevenueChartProps) {
  // La courbe projetée n'apparaît que s'il y a au moins un point de prévision.
  // La courbe projetée n'apparaît que s'il y a au moins un point de prévision.
  const hasForecast = data.some((point) => point.forecast !== null);

  // Nombre de mois projetés (points avec `forecast` mais sans `revenue`).
  const forecastMonths = data.filter(
    (point) => point.forecast !== null && point.revenue === null
  ).length;
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Revenue
          </h2>

          <p className="text-sm text-gray-500">
            Monthly revenue
          </p>
        </div>

        {hasForecast && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            +{forecastMonths} months forecast
          </span>
        )}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip
              formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`,
                name === "forecast" ? "Prévision" : "Revenu",
              ]}
            />

            {/* Historique réel */}
            <Line
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />

            {/* Projection : ligne en pointillés */}
            {hasForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                name="forecast"
                strokeWidth={2}
                strokeDasharray="5 5"
                stroke="#6366f1"
                dot={false}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;