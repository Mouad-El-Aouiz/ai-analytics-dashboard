export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface MonthlyUsers {
  month: string;
  users: number;
}

export type OrderStatus =
  | "pending"
  | "completed"
  | "cancelled";

export interface RecentOrder {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
}

export interface StatWithChange {
  value: number;
  changePercent: number | null;
  trend: "up" | "down" | "neutral";
}

export interface OrdersByStatus {
  status: OrderStatus;
  count: number;
  totalAmount: number;
}

export interface RevenueByProduct {
  product: string;
  category: string;
  revenue: number;
}

export interface RevenueByCategory {
  category: string;
  revenue: number;
}

export interface DashboardAnalytics {
  revenue: StatWithChange;

  // Orders = commandes completed uniquement (cohérent avec Revenue).
  orders: StatWithChange;

  // New Customers = clients créés dans la période.
  customers: StatWithChange;

  // New Users = users créés dans la période.
  users: StatWithChange;

  // Totaux "all time" de la company (pas de filtre temporel).
  totalCustomers: number;
  totalUsers: number;

  // AOV = Revenue / Orders (completed). Pas de comparaison précédente
  // pour l'instant : c'est un chiffre absolu.
  averageOrderValue: StatWithChange;

  monthlyRevenue: MonthlyRevenue[];
  monthlyUsers: MonthlyUsers[];
  recentOrders: RecentOrder[];
}