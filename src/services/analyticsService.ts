import { supabase } from "../lib/supabaseClient";
import { getCurrentCompanyId } from "./companyService";

import type { DateRange } from "../types/dateRange";
import { getPeriodBoundaries, getStartDate } from "../utils/dateUtils";

import {
  type DashboardAnalytics,
  type MonthlyRevenue,
  type MonthlyUsers,
  type RecentOrder,
  type StatWithChange,
  type OrderStatus,
  type OrdersByStatus,
  type RevenueByProduct,
  type RevenueByCategory,
} from "../types/analytics";

export async function getAnalytics(
  dateRange: DateRange
): Promise<DashboardAnalytics> {
  const companyId = await getCurrentCompanyId();

  const { currentStart, previousStart, previousEnd } =
    getPeriodBoundaries(dateRange);

  const [
    currentRevenue,
    currentOrders,
    currentCustomers,
    currentUsers,
    totalCustomers,
    totalUsers,
    monthlyRevenue,
    monthlyUsers,
    recentOrders,
    previousValues,
  ] = await Promise.all([
    getTotalRevenue(companyId, currentStart),
    countCompletedOrders(companyId, currentStart),
    countRows("customers", companyId, currentStart),
    countRows("users", companyId, currentStart),
    getTotalCustomers(companyId),
    getTotalUsers(companyId),
    getMonthlyRevenue(companyId, currentStart),
    getMonthlyUsers(companyId, currentStart),
    getRecentOrders(companyId, currentStart),
    getPreviousValues(companyId, previousStart, previousEnd),
  ]);

  const revenueStat = withChange(currentRevenue, previousValues?.revenue ?? null);
  const ordersStat = withChange(currentOrders, previousValues?.orders ?? null);

  // AOV = completed revenue / completed orders.
  // Calculé à partir des valeurs absolues, pas des variations.
  const averageOrderValue = computeAov(revenueStat.value, ordersStat.value);

  return {
    revenue: revenueStat,
    orders: ordersStat,
    customers: withChange(currentCustomers, previousValues?.customers ?? null),
    users: withChange(currentUsers, previousValues?.users ?? null),
    totalCustomers,
    totalUsers,
    averageOrderValue,
    monthlyRevenue,
    monthlyUsers,
    recentOrders,
  };
}

async function getPreviousValues(
  companyId: string,
  previousStart: Date | null,
  previousEnd: Date | null
) {
  if (previousStart === null || previousEnd === null) {
    return null;
  }

  const [revenue, orders, customers, users] = await Promise.all([
    getTotalRevenue(companyId, previousStart, previousEnd),
    countCompletedOrders(companyId, previousStart, previousEnd),
    countRows("customers", companyId, previousStart, previousEnd),
    countRows("users", companyId, previousStart, previousEnd),
  ]);

  return { revenue, orders, customers, users };
}

// Transforme un nombre brut en { value, changePercent, trend }.
function withChange(current: number, previous: number | null): StatWithChange {
  if (previous === null) {
    return { value: current, changePercent: null, trend: "neutral" };
  }

  if (previous === 0) {
    return {
      value: current,
      changePercent: null,
      trend: current > 0 ? "up" : "neutral",
    };
  }

  const changePercent = ((current - previous) / previous) * 100;
  const trend = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "neutral";

  return { value: current, changePercent, trend };
}

// AOV = revenu / commandes complétées. Si 0 commande, AOV = 0.
// L'AOV n'a pas de "période précédente" calculée pour l'instant : on le
// présente comme un chiffre absolu, pas comme une variation.
function computeAov(revenue: number, orders: number): StatWithChange {
  if (orders <= 0) {
    return { value: 0, changePercent: null, trend: "neutral" };
  }

  return {
    value: revenue / orders,
    changePercent: null,
    trend: "neutral",
  };
}

async function getTotalRevenue(
  companyId: string,
  startDate: Date | null,
  endDate: Date | null = null
): Promise<number> {
  const { data, error } = await supabase.rpc("get_total_revenue", {
    p_company_id: companyId,
    p_start_date: startDate?.toISOString() ?? null,
    p_end_date: endDate?.toISOString() ?? null,
  });

  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

async function getTotalCustomers(companyId: string): Promise<number> {
  const { data, error } = await supabase.rpc("get_total_customers", {
    p_company_id: companyId,
  });

  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

async function getTotalUsers(companyId: string): Promise<number> {
  const { data, error } = await supabase.rpc("get_total_users", {
    p_company_id: companyId,
  });

  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

async function countCompletedOrders(
  companyId: string,
  startDate: Date | null,
  endDate: Date | null = null
): Promise<number> {
  let query = supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "completed");

  if (startDate) query = query.gte("created_at", startDate.toISOString());
  if (endDate) query = query.lt("created_at", endDate.toISOString());

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function countRows(
  table: "customers" | "users",
  companyId: string,
  startDate: Date | null,
  endDate: Date | null = null
): Promise<number> {
  let query = supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (startDate) query = query.gte("created_at", startDate.toISOString());
  if (endDate) query = query.lt("created_at", endDate.toISOString());

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// "2026-01" -> "Jan 2026"
function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

async function getMonthlyRevenue(
  companyId: string,
  startDate: Date | null
): Promise<MonthlyRevenue[]> {
  const { data, error } = await supabase.rpc(
    "get_monthly_revenue",
    {
      p_company_id: companyId,
      p_start_date: startDate?.toISOString() ?? null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (
    (data ?? []) as {
      month: string;
      revenue: number | string;
    }[]
  ).map((row) => ({
    month: formatMonth(row.month),
    revenue: Number(row.revenue),
  }));
}

async function getMonthlyUsers(
  companyId: string,
  startDate: Date | null
): Promise<MonthlyUsers[]> {
  const { data, error } = await supabase.rpc(
    "get_monthly_users",
    {
      p_company_id: companyId,
      p_start_date: startDate?.toISOString() ?? null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (
    (data ?? []) as {
      month: string;
      users: number | string;
    }[]
  ).map((row) => ({
    month: formatMonth(row.month),
    users: Number(row.users),
  }));
}

type CustomerRelation = { name: string } | null;

async function getRecentOrders(
  companyId: string,
  startDate: Date | null
): Promise<RecentOrder[]> {
  let query = supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      customers (
        name
      )
    `)
    .eq("company_id", companyId);

  if (startDate) {
    query = query.gte(
      "created_at",
      startDate.toISOString()
    );
  }

  const { data, error } = await query
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((order) => ({
    id: order.id,
    totalAmount: Number(order.total_amount),
    status: order.status as OrderStatus,
    createdAt: order.created_at,
    customerName:
      (order.customers as unknown as CustomerRelation)
        ?.name ?? "Unknown customer",
  }));
}

export async function getOrdersByStatus(
  dateRange: DateRange
): Promise<OrdersByStatus[]> {
  const companyId = await getCurrentCompanyId();
  const startDate = getStartDate(dateRange);

  const { data, error } = await supabase.rpc(
    "get_orders_by_status",
    {
      p_company_id: companyId,
      p_start_date: startDate?.toISOString() ?? null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (
    (data ?? []) as {
      status: OrderStatus;
      order_count: number | string;
      total_amount: number | string;
    }[]
  ).map((row) => ({
    status: row.status,
    count: Number(row.order_count),
    totalAmount: Number(row.total_amount),
  }));
}

export async function getRevenueByProduct(
  dateRange: DateRange
): Promise<RevenueByProduct[]> {
  const companyId = await getCurrentCompanyId();
  const startDate = getStartDate(dateRange);

  const { data, error } = await supabase.rpc(
    "get_revenue_by_product",
    {
      p_company_id: companyId,
      p_start_date: startDate?.toISOString() ?? null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (
    (data ?? []) as {
      product: string;
      category: string | null;
      revenue: number | string;
    }[]
  ).map((row) => ({
    product: row.product,
    category: row.category ?? "Uncategorized",
    revenue: Number(row.revenue),
  }));
}

export async function getRevenueByCategory(
  dateRange: DateRange
): Promise<RevenueByCategory[]> {
  const companyId = await getCurrentCompanyId();
  const startDate = getStartDate(dateRange);

  const { data, error } = await supabase.rpc(
    "get_revenue_by_category",
    {
      p_company_id: companyId,
      p_start_date: startDate?.toISOString() ?? null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (
    (data ?? []) as {
      category: string | null;
      revenue: number | string;
    }[]
  ).map((row) => ({
    category: row.category ?? "Uncategorized",
    revenue: Number(row.revenue),
  }));
}