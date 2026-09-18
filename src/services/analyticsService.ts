import { supabase } from "../lib/supabaseClient";
import { getCurrentCompanyId } from "./companyService";

export async function getTotalRevenue() {
    const companyId = await getCurrentCompanyId();

    const { data, error } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("company_id", companyId)
        .eq("status", "completed");
    
    if (error) {
        throw new Error(error.message);
    }

    return data.reduce(
      (total, order) => total + Number(order.total_amount),
      0
    );
}

export async function getTotalOrders() {
  const companyId = await getCurrentCompanyId();

  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return data.length;
}

export async function getTotalCustomers() {
  const companyId = await getCurrentCompanyId();

  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  return data.length;
}

export async function getMonthlyRevenue() {
  const companyId = await getCurrentCompanyId();

  const { data, error } = await supabase
    .from("orders")
    .select("total_amount, created_at")
    .eq("company_id", companyId)
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const monthlyRevenue = data.reduce(
    (acc: Record<string, number>, order) => {
      const month = new Date(order.created_at).toLocaleString(
        "en-US",
        {
          month: "short",
        }
      );

      acc[month] =
        (acc[month] || 0) + Number(order.total_amount);

      return acc;
    },
    {}
  );

  return Object.entries(monthlyRevenue).map(
    ([month, revenue]) => ({
      month,
      revenue,
    })
  );
}

export async function getMonthlyUsers() {
  const companyId = await getCurrentCompanyId();

  const { data, error } = await supabase
    .from("users")
    .select("created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const monthlyUsers = data.reduce(
    (acc: Record<string, number>, user) => {
      const month = new Date(user.created_at).toLocaleString(
        "en-US",
        {
          month: "short",
        }
      );

      acc[month] = (acc[month] || 0) + 1;

      return acc;
    },
    {}
  );

  return Object.entries(monthlyUsers).map(
    ([month, users]) => ({
      month,
      users,
    })
  );
}

export async function getRecentOrders() {
  const companyId = await getCurrentCompanyId();

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
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}