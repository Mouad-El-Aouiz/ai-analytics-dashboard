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

export interface DashboardAnalytics {
  revenue: StatWithChange;
  orders: StatWithChange;
  customers: StatWithChange;
  monthlyRevenue: MonthlyRevenue[];
  monthlyUsers: MonthlyUsers[];
  recentOrders: RecentOrder[];
}