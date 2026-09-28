import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import type { DashboardOutletContext } from "../layouts/DashboardLayout";

import StatsGridSkeleton from "../components/ui/StatsGridSkeleton";
import ChartSkeleton from "../components/ui/ChartSkeleton";
import TableSkeleton from "../components/ui/TableSkeleton";

import StatsGrid from "../components/dashboard/StatsGrid";

import RevenueChart from "../components/charts/RevenueChart";
import UsersChart from "../components/charts/UsersChart";

import RecentOrders from "../components/dashboard/RecentOrders";
import AIInsightCard from "../components/dashboard/AIInsightCard";

import { getFirstName } from "../utils/userUtils";


import { useAnalytics } from "../hooks/useAnalytics";
import { buildForecast } from "../services/insightsService";
import type { DateRange } from "../types/dateRange";

function Dashboard() {
  const { user } = useAuth();

  const firstName = getFirstName(
    user?.user_metadata?.full_name
  );

  const [dateRange, setDateRange] = useState<DateRange>("30d");

  // La recherche vient du Header (via le layout) : elle filtre les
  // commandes récentes affichées sur cette page.
  const { searchQuery } = useOutletContext<DashboardOutletContext>();

  const {
    analytics,
    loading,
    error,
  } = useAnalytics(dateRange);


  const revenueForecast = useMemo(
    () => buildForecast(analytics?.monthlyRevenue ?? []),
    [analytics?.monthlyRevenue]
  );

  // Filtre insensible à la casse sur le client, l'ID et le statut.
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredOrders = normalizedQuery
    ? (analytics?.recentOrders ?? []).filter((order) => {
      const haystack = [
        order.customerName,
        order.id,
        order.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    : analytics?.recentOrders ?? [];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded-md bg-gray-200" />
        </div>

        <StatsGridSkeleton count={4} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        <TableSkeleton rows={5} />
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
          onChange={(event) =>
            setDateRange(event.target.value as DateRange)
          }
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
      <StatsGrid analytics={analytics} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart data={revenueForecast} />
        <UsersChart
          data={analytics?.monthlyUsers ?? []}
        />
      </div>

      {/* Orders */}
      <RecentOrders
        orders={filteredOrders}
        emptyMessage={
          normalizedQuery
            ? `No orders match "${searchQuery.trim()}".`
            : "No orders in this period."
        }
      />
      {/* AI */}
      <AIInsightCard analytics={analytics} />
    </div>
  );
}

export default Dashboard;