import { supabase } from "../lib/supabaseClient";
import { getCurrentCompanyId } from "./companyService";

import type { DateRange } from "../types/dateRange";
import { getPeriodBoundaries } from "../utils/dateUtils";

import {
  type DashboardAnalytics,
  type MonthlyRevenue,
  type MonthlyUsers,
  type RecentOrder,
  type StatWithChange,
  type OrderStatus,
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
    monthlyRevenue,
    monthlyUsers,
    recentOrders,
    previousValues,
  ] = await Promise.all([
    getTotalRevenue(companyId, currentStart),
    countRows("orders", companyId, currentStart),
    countRows("customers", companyId, currentStart),
    getMonthlyRevenue(companyId, currentStart),
    getMonthlyUsers(companyId, currentStart),
    getRecentOrders(companyId, currentStart),
    getPreviousValues(companyId, previousStart, previousEnd),
  ]);

  return {
    revenue: withChange(currentRevenue, previousValues?.revenue ?? null),
    orders: withChange(currentOrders, previousValues?.orders ?? null),
    customers: withChange(currentCustomers, previousValues?.customers ?? null),
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

  const [revenue, orders, customers] = await Promise.all([
    getTotalRevenue(companyId, previousStart, previousEnd),
    countRows("orders", companyId, previousStart, previousEnd),
    countRows("customers", companyId, previousStart, previousEnd),
  ]);

  return { revenue, orders, customers };
}

// Transforme un nombre brut en { value, changePercent, trend }.
function withChange(current: number, previous: number | null): StatWithChange {
  if (previous === null) {
    return { value: current, changePercent: null, trend: "neutral" };
  }

  if (previous === 0) {
    // Diviser par zéro n'a pas de sens en pourcentage. On garde quand
    // même la direction : toute croissance depuis zéro est "up".
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

async function countRows(
  table: "orders" | "customers",
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
    data as {
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
    data as {
      month: string;
      users: number | string;
    }[]
  ).map((row) => ({
    month: formatMonth(row.month),
    users: Number(row.users),
  }));
}

// Supabase renvoie le client comme UN objet { name }, mais TypeScript croit
// que c'est un tableau (le client Supabase n'est pas typé). On le lui explique.
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

  return data.map((order) => ({
    id: order.id,
    totalAmount: Number(order.total_amount),
    status: order.status as OrderStatus,
    createdAt: order.created_at,
    customerName:
      (order.customers as unknown as CustomerRelation)
        ?.name ?? "Unknown customer",
  }));
}