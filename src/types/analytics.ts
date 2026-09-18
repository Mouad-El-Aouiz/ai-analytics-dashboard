export interface RecentOrder {
  id: string;
  total_amount: number | string;
  status: string;
  created_at: string;
  customers: {
    name: string;
  }[] | null;
}