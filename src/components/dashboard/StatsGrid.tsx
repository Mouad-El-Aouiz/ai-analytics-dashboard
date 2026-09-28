import StatCard from "./StatCard";
import type { DashboardAnalytics } from "../../types/analytics";

interface StatsGridProps {
  analytics: DashboardAnalytics | null;
  // "dashboard" : 4 KPI (Revenue, Orders, New Customers, New Users)
  // "analytics" : 7 KPI (les 4 + Total Customers, Total Users, AOV)
  variant?: "dashboard" | "analytics";
}

const EMPTY_STAT = {
  value: 0,
  changePercent: null,
  trend: "neutral" as const,
};

function StatsGrid({ analytics, variant = "dashboard" }: StatsGridProps) {
  const revenue = analytics?.revenue ?? EMPTY_STAT;
  const orders = analytics?.orders ?? EMPTY_STAT;
  const customers = analytics?.customers ?? EMPTY_STAT;
  const users = analytics?.users ?? EMPTY_STAT;
  const aov = analytics?.averageOrderValue ?? EMPTY_STAT;

  const totalCustomers = analytics?.totalCustomers ?? 0;
  const totalUsers = analytics?.totalUsers ?? 0;

  const baseStats = [
    {
      title: "Revenue",
      value: `$${revenue.value.toLocaleString()}`,
      changePercent: revenue.changePercent,
      trend: revenue.trend,
      subtitle: "vs. previous period",
    },
    {
      title: "Orders",
      value: orders.value.toLocaleString(),
      changePercent: orders.changePercent,
      trend: orders.trend,
      subtitle: "vs. previous period",
    },
    {
      title: "New Customers",
      value: customers.value.toLocaleString(),
      changePercent: customers.changePercent,
      trend: customers.trend,
      subtitle: "vs. previous period",
    },
    {
      title: "New Users",
      value: users.value.toLocaleString(),
      changePercent: users.changePercent,
      trend: users.trend,
      subtitle: "vs. previous period",
    },
  ];

  const analyticsOnlyStats = [
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      changePercent: null,
      trend: "neutral" as const,
      subtitle: "all time",
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      changePercent: null,
      trend: "neutral" as const,
      subtitle: "all time",
    },
    {
      title: "Avg. Order Value",
      value: `$${aov.value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
      changePercent: null,
      trend: "neutral" as const,
      subtitle: "revenue / completed orders",
    },
  ];

  const stats =
    variant === "analytics"
      ? [...baseStats, ...analyticsOnlyStats]
      : baseStats;

  // 4 colonnes en analytics (7 KPI), 4 colonnes en dashboard.
  const gridCols =
    variant === "analytics"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-6 ${gridCols}`}>
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          changePercent={stat.changePercent}
          trend={stat.trend}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  );
}

export default StatsGrid;