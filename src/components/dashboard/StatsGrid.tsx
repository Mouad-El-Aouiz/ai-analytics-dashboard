import StatCard from "./StatCard";
import type { StatWithChange } from "../../types/analytics";

interface StatsGridProps {
  revenue: StatWithChange;
  orders: StatWithChange;
  customers: StatWithChange;
}

function StatsGrid({
  revenue,
  orders,
  customers,
}: StatsGridProps) {
  const stats = [
    {
      title: "Revenue",
      value: `$${revenue.value.toLocaleString()}`,
      changePercent: revenue.changePercent,
      trend: revenue.trend,
    },
    {
      title: "Orders",
      value: orders.value.toLocaleString(),
      changePercent: orders.changePercent,
      trend: orders.trend,
    },
    {
      title: "Customers",
      value: customers.value.toLocaleString(),
      changePercent: customers.changePercent,
      trend: customers.trend,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          changePercent={stat.changePercent}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}

export default StatsGrid;