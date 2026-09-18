import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

import StatsGrid from "../components/dashboard/StatsGrid";

import RevenueChart from "../components/charts/RevenueChart";
import UsersChart from "../components/charts/UsersChart";

import RecentOrders from "../components/dashboard/RecentOrders";
import AIInsightCard from "../components/dashboard/AIInsightCard";

import { type RecentOrder } from "../types/analytics";

import { getFirstName } from "../utils/userUtils";
import { getTotalRevenue, getTotalOrders, getTotalCustomers, getMonthlyRevenue, getMonthlyUsers, getRecentOrders } from "../services/analyticsService";

function Dashboard() {
  const { user } = useAuth();

  const [revenue, setRevenue] = useState(0);
  const [orders, setOrders] = useState(0);
  const [customers, setCustomers] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [monthlyRevenue, setMonthlyRevenue] = useState<
    { month: string; revenue: number }[]
  >([]);
  const [monthlyUsers, setMonthlyUsers] = useState<
    { month: string; users: number }[]
  >([]);

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const firstName = getFirstName(
    user?.user_metadata?.full_name
  );

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const revenue = await getTotalRevenue();
        const orders = await getTotalOrders();
        const customers = await getTotalCustomers();

        const monthlyRevenue = await getMonthlyRevenue();
        const monthlyUsers = await getMonthlyUsers();

        const ordersData = await getRecentOrders();

        setRevenue(revenue);
        setOrders(orders);
        setCustomers(customers);

        setMonthlyRevenue(monthlyRevenue);
        setMonthlyUsers(monthlyUsers);

        setRecentOrders(ordersData);

      } catch (error) {
        console.error("Failed to load analytics:", error);

        setError("Unable to load analytics data.");
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
        revenue={revenue}
        orders={orders}
        customers={customers}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart data={monthlyRevenue} />
        <UsersChart data={monthlyUsers} />
      </div>

      {/* Orders */}
      <RecentOrders orders={recentOrders} />

      {/* AI */}
      <AIInsightCard />
    </div>
  );
}

export default Dashboard;