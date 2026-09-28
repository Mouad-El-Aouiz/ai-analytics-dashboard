// Types pour la couche IA (Gemini via Supabase Edge Functions).

export interface AiInsights {
  executiveSummary: string;
  positiveTrends: string[];
  negativeTrends: string[];
  anomalies: string[];
  recommendations: string[];
}

export interface AiAssistantResponse {
  answer: string;
  keyPoints: string[];
}

// Contexte analytics compact, envoyé à Gemini.
// Volontairement réduit pour éviter d'envoyer toute la base.
export interface AiContext {
  period: string;
  revenue: { value: number; changePercent: number | null };
  orders: { value: number; changePercent: number | null };
  newCustomers: number;
  totalCustomers: number;
  newUsers: number;
  totalUsers: number;
  averageOrderValue: number;
  topProducts: { product: string; revenue: number }[];
  revenueByCategory: { category: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}