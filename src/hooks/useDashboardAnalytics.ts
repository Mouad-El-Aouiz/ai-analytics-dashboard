import { useCallback, useEffect, useState } from "react";
import { getAnalytics } from "../services/analyticsService";
import type { DashboardAnalytics } from "../types/analytics";
import type { DateRange } from "../types/dateRange";

export function useDashboardAnalytics(dateRange: DateRange) {
  const [analytics, setAnalytics] =
    useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAnalytics(dateRange);

        if (!ignore) setAnalytics(data);
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load dashboard analytics", err);
          setError("Unable to load analytics data.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      ignore = true;
    };
    // dateRange fait partie des dépendances exprès : le changer doit recharger.
  }, [dateRange, reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return { analytics, loading, error, refetch };
}