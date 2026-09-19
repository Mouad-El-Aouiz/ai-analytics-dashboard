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

export interface DashboardAnalytics {
  revenue: number;
  orders: number;
  customers: number;
  monthlyRevenue: MonthlyRevenue[];
  monthlyUsers: MonthlyUsers[];
  recentOrders: RecentOrder[];
}