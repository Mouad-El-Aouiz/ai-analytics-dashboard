import type { DashboardAnalytics } from "../types/analytics";
import type { DateRange } from "../types/dateRange";
import type {
  OrdersByStatus,
  RevenueByCategory,
  RevenueByProduct,
} from "../types/analytics";
import type { AiContext } from "../types/ai";

// Construit un contexte analytics compact pour Gemini.
// Ne jamais envoyer l'intégralité des données : uniquement un résumé.
export function buildAiContext(
  analytics: DashboardAnalytics,
  dateRange: DateRange,
  topProducts: RevenueByProduct[],
  revenueByCategory: RevenueByCategory[],
  ordersByStatus: OrdersByStatus[]
): AiContext {
  return {
    period: dateRange,
    revenue: {
      value: analytics.revenue.value,
      changePercent: analytics.revenue.changePercent,
    },
    orders: {
      value: analytics.orders.value,
      changePercent: analytics.orders.changePercent,
    },
    newCustomers: analytics.customers.value,
    totalCustomers: analytics.totalCustomers,
    newUsers: analytics.users.value,
    totalUsers: analytics.totalUsers,
    averageOrderValue: analytics.averageOrderValue.value,
    topProducts: topProducts.slice(0, 5).map((p) => ({
      product: p.product,
      revenue: p.revenue,
    })),
    revenueByCategory: revenueByCategory.map((c) => ({
      category: c.category,
      revenue: c.revenue,
    })),
    ordersByStatus: ordersByStatus.map((o) => ({
      status: o.status,
      count: o.count,
    })),
    monthlyRevenue: analytics.monthlyRevenue.map((m) => ({
      month: m.month,
      revenue: m.revenue,
    })),
  };
}