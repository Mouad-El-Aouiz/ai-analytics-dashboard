import { useEffect, useState } from "react";

import { generateAiInsights } from "../services/aiService";
import type { AiContext, AiInsights } from "../types/ai";

// Charge les insights IA. Retourne `null` en cas d'échec, ce qui permet
// au composant appelant de basculer sur le fallback déterministe.
export function useAiInsights(context: AiContext | null) {
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!context) {
      // Rien à charger : on ne touche pas au state ici.
      // La valeur `null` est dérivée plus bas, dans le retour.
      return;
    }

    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result = await generateAiInsights(context!);

        if (!ignore) {
          setInsights(result);
          if (result === null) {
            setError("AI insights unavailable.");
          }
        }
      } catch (err) {
        console.error("useAiInsights failed:", err);
        if (!ignore) {
          setError("AI insights unavailable.");
          setInsights(null);
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
  }, [context]);

  // Dérivation : sans contexte, on considère qu'il n'y a pas d'insights.
  return {
    insights: context ? insights : null,
    loading: context ? loading : false,
    error: context ? error : null,
  };
}