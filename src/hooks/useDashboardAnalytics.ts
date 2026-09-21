import { useCallback, useEffect, useState } from "react";
import { getDashboardAnalytics } from "../services/analyticsService";
import { type DashboardAnalytics } from "../types/analytics";

export function useDashboardAnalytics() {
  const [analytics, setAnalytics] =
    useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Changer ce nombre relance l'effet : c'est ce que fait refetch.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Devient true quand cet effet est remplacé (démontage, StrictMode,
    // ou nouveau reloadKey) : l'ancienne requête ne doit rien afficher.
    let ignore = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardAnalytics();

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
  }, [reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return { analytics, loading, error, refetch };
}