import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

import StatsGrid from "../components/dashboard/StatsGrid";

import RevenueChart from "../components/charts/RevenueChart";
import UsersChart from "../components/charts/UsersChart";

import RecentOrders from "../components/dashboard/RecentOrders";
import AIInsightCard from "../components/dashboard/AIInsightCard";

import { getFirstName } from "../utils/userUtils";

import { getDashboardAnalytics } from "../services/analyticsService";
import { type DashboardAnalytics } from "../types/analytics";

function Dashboard() {
  const { user } = useAuth();

  const [analytics, setAnalytics] =
    useState<DashboardAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const firstName = getFirstName(
    user?.user_metadata?.full_name
  );

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardAnalytics();

        setAnalytics(data);
      } catch (error) {
        console.error(
          "Failed to load analytics:",
          error
        );

        setError(
          "Unable to load analytics data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

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

        <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* Statistics */}
      <StatsGrid
        revenue={analytics?.revenue ?? 0}
        orders={analytics?.orders ?? 0}
        customers={analytics?.customers ?? 0}
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