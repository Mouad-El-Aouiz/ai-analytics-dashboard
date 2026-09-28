import { useEffect, useState } from "react";

import {
  getOrdersByStatus,
  getRevenueByProduct,
  getRevenueByCategory,
} from "../services/analyticsService";

import type {
  OrdersByStatus,
  RevenueByProduct,
  RevenueByCategory,
} from "../types/analytics";
import type { DateRange } from "../types/dateRange";

interface AnalyticsBreakdowns {
  ordersByStatus: OrdersByStatus[];
  revenueByProduct: RevenueByProduct[];
  revenueByCategory: RevenueByCategory[];
}

// Charge les "breakdowns" (répartitions) de la page Analytics : commandes par
// statut, revenus par produit et par catégorie. Les trois requêtes sont
// indépendantes, donc lancées en parallèle, avec un seul état de chargement.
export function useAnalyticsBreakdowns(dateRange: DateRange) {
  const [data, setData] = useState<AnalyticsBreakdowns>({
    ordersByStatus: [],
    revenueByProduct: [],
    revenueByCategory: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [ordersByStatus, revenueByProduct, revenueByCategory] =
          await Promise.all([
            getOrdersByStatus(dateRange),
            getRevenueByProduct(dateRange),
            getRevenueByCategory(dateRange),
          ]);

        if (!ignore) {
          setData({ ordersByStatus, revenueByProduct, revenueByCategory });
        }
      } catch (err) {
        console.error("Failed to load analytics breakdowns", err);

        if (!ignore) {
          setError("Unable to load analytics breakdowns.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [dateRange]);

  return {
    ordersByStatus: data.ordersByStatus,
    revenueByProduct: data.revenueByProduct,
    revenueByCategory: data.revenueByCategory,
    loading,
    error,
  };
}