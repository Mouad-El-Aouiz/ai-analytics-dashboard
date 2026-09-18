import StatCard from "./StatCard";

interface StatsGridProps {
  revenue: number;
  orders: number;
  customers: number;
}

function StatsGrid({
  revenue,
  orders,
  customers,
}: StatsGridProps) {
  const stats = [
    {
      title: "Revenue",
      value: `$${revenue.toLocaleString()}`,
      change: "—",
      trend: "up" as const,
    },
    {
      title: "Orders",
      value: orders.toLocaleString(),
      change: "—",
      trend: "up" as const,
    },
    {
      title: "Customers",
      value: customers.toLocaleString(),
      change: "—",
      trend: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}

export default StatsGrid;

  