import { supabase } from "../lib/supabaseClient";
import { getCurrentCompanyId } from "./companyService";

import {
  type DashboardAnalytics,
  type MonthlyRevenue,
  type MonthlyUsers,
  type RecentOrder,
  type OrderStatus,
} from "../types/analytics";

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const companyId = await getCurrentCompanyId();

  const [
    revenue,
    orders,
    customers,
    monthlyRevenue,
    monthlyUsers,
    recentOrders,
  ] = await Promise.all([
    getTotalRevenue(companyId),
    countRows("orders", companyId),
    countRows("customers",companyId),
    getMonthlyRevenue(companyId),
    getMonthlyUsers(companyId),
    getRecentOrders(companyId),
  ]);

  return {
    revenue,
    orders,
    customers,
    monthlyRevenue,
    monthlyUsers,
    recentOrders,
  };
}

async function getTotalRevenue(
  companyId: string
): Promise<number> {
  const { data, error } = await supabase.rpc(
    "get_total_revenue",
    { p_company_id: companyId }
  );

  if (error) {
    throw new Error(error.message);
  }

  // La fonction renvoie un seul nombre (pas un tableau)
  return Number(data ?? 0);
}

async function countRows(
  table: "orders" | "customers",
  companyId: string
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    // head: true -> Supabase ne renvoie AUCUNE ligne, seulement le total
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

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
  companyId: string
): Promise<MonthlyRevenue[]> {
  // rpc = "remote procedure call" : on appelle la fonction SQL
  const { data, error } = await supabase.rpc(
    "get_monthly_revenue",
    { p_company_id: companyId }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (data as { month: string; revenue: number }[]).map(
    (row) => ({
      month: formatMonth(row.month),
      revenue: Number(row.revenue),
    })
  );
}

async function getMonthlyUsers(
  companyId: string
): Promise<MonthlyUsers[]> {
  const { data, error } = await supabase
    .rpc("get_monthly_users",
    { p_company_id: companyId }
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data as { month: string; users: number }[]).map(
    (row) => ({
      month: formatMonth(row.month),
      users: Number(row.users),
    })
  );
}

// Supabase renvoie le client comme UN objet { name }, mais TypeScript croit
// que c'est un tableau (le client Supabase n'est pas typé). On le lui explique.
type CustomerRelation = { name: string } | null;

async function getRecentOrders(
  companyId: string
): Promise<RecentOrder[]> {
  const { data, error } = await supabase
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
    .eq("company_id", companyId)
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
      (order.customers as unknown as CustomerRelation)?.name ??
      "Unknown customer",
  }));
}