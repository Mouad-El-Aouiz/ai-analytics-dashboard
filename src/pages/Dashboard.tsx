import { useState } from "react";
import { useAuth } from "../context/useAuth";

import StatsGrid from "../components/dashboard/StatsGrid";

import RevenueChart from "../components/charts/RevenueChart";
import UsersChart from "../components/charts/UsersChart";

import RecentOrders from "../components/dashboard/RecentOrders";
import AIInsightCard from "../components/dashboard/AIInsightCard";

import { getFirstName } from "../utils/userUtils";


import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";
import type { DateRange } from "../types/dateRange";

function Dashboard() {
  const { user } = useAuth();

  const firstName = getFirstName(
    user?.user_metadata?.full_name
  );

  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { analytics, loading, error } = useDashboardAnalytics(dateRange);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Good morning, {firstName} 👋
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your business.
          </p>
        </div>

        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value as DateRange)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="6m">Last 6 months</option>
          <option value="12m">Last 12 months</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Statistics */}
      <StatsGrid
        revenue={analytics?.revenue ?? { value: 0, changePercent: null, trend: "neutral" }}
        orders={analytics?.orders ?? { value: 0, changePercent: null, trend: "neutral" }}
        customers={analytics?.customers ?? { value: 0, changePercent: null, trend: "neutral" }}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart
          data={analytics?.monthlyRevenue ?? []}
        />
        <UsersChart
          data={analytics?.monthlyUsers ?? []}
        />
      </div>

      {/* Orders */}
      <RecentOrders
        orders={analytics?.recentOrders ?? []}
      />
      {/* AI */}
      <AIInsightCard />
    </div>
  );
}

export default Dashboard;