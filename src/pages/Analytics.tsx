import { useState } from "react";
import type { DateRange } from "../types/dateRange";

function Analytics() {
  const [dateRange, setDateRange] =
    useState<DateRange>("30d");

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Analyze your business performance and trends.
          </p>
        </div>

        {/* Date range */}
        <select
          value={dateRange}
          onChange={(event) =>
            setDateRange(
              event.target.value as DateRange
            )
          }
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="6m">Last 6 months</option>
          <option value="12m">Last 12 months</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Temporary content */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">
          Analytics coming soon...
        </p>
      </div>

    </div>
  );
}

export default Analytics;