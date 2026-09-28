import { useMemo, useState } from "react";

import { useAnalytics } from "../hooks/useAnalytics";
import { useAnalyticsBreakdowns } from "../hooks/useAnalyticsBreakdowns";
import { buildForecast } from "../services/insightsService";
import type { DateRange } from "../types/dateRange";

import StatsGridSkeleton from "../components/ui/StatsGridSkeleton";
import ChartSkeleton from "../components/ui/ChartSkeleton";

import AnalyticsStats from "../components/analytics/AnalyticsStats";
import OrdersByStatus from "../components/analytics/OrdersByStatus";

import RevenueChart from "../components/charts/RevenueChart";
import UsersChart from "../components/charts/UsersChart";
import RevenueByProductChart from "../components/charts/RevenueByProductChart";
import RevenueByCategoryChart from "../components/charts/RevenueByCategoryChart";

import AIInsightCard from "../components/dashboard/AIInsightCard";

function Analytics() {
  const [dateRange, setDateRange] =
    useState<DateRange>("30d");

  const {
    analytics,
    loading,
    error,
  } = useAnalytics(dateRange);

  // Répartitions (commandes par statut, revenus par produit / catégorie).
  // Requêtes indépendantes des KPI : elles ont donc leur propre état de
  // chargement pour ne pas bloquer toute la page.
  const {
    ordersByStatus,
    revenueByProduct,
    revenueByCategory,
    loading: breakdownsLoading,
    error: breakdownsError,
  } = useAnalyticsBreakdowns(dateRange);

  const revenueForecast = useMemo(
    () => buildForecast(analytics?.monthlyRevenue ?? []),
    [analytics?.monthlyRevenue]
  );

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

      {/* Loading */}
      {loading && (
        <>
          <StatsGridSkeleton count={7} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* KPI cards */}
      {!loading && !error && (
        <AnalyticsStats analytics={analytics} />
      )}

      {/* Revenue chart */}
      {!loading && !error && (
        <RevenueChart data={revenueForecast} />
      )}

      {/* Users chart */}
      {!loading && !error && (
        <UsersChart
          data={analytics?.monthlyUsers ?? []}
        />
      )}

      {/* AI preview */}
      {!loading && !error && (
        <AIInsightCard analytics={analytics} />
      )}

      {/* Breakdowns: loading */}
      {!loading && !error && breakdownsLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            Loading breakdowns...
          </p>
        </div>
      )}

      {/* Breakdowns: error */}
      {!loading && !error && !breakdownsLoading && breakdownsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {breakdownsError}
          </p>
        </div>
      )}

      {/* Breakdowns: charts */}
      {!loading && !error && !breakdownsLoading && !breakdownsError && (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RevenueByProductChart data={revenueByProduct} />
            <RevenueByCategoryChart data={revenueByCategory} />
          </div>

          <OrdersByStatus data={ordersByStatus} />
        </>
      )}

    </div>
  );
}

export default Analytics;