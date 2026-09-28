import { useCallback, useState } from "react";

import { askAiAssistant } from "../services/aiService";
import type { AiAssistantResponse, AiContext } from "../types/ai";

interface UseAiAssistantResult {
  answer: AiAssistantResponse | null;
  loading: boolean;
  error: string | null;
  ask: (question: string) => Promise<void>;
  reset: () => void;
}

export function useAiAssistant(context: AiContext | null): UseAiAssistantResult {
  const [answer, setAnswer] = useState<AiAssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (question: string) => {
      if (!context || !question.trim()) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setAnswer(null);

        const result = await askAiAssistant(question, context);

        if (result === null) {
          setError("Unable to get an answer. Please try again.");
        } else {
          setAnswer(result);
        }
      } catch (err) {
        console.error("useAiAssistant failed:", err);
        setError("Unable to get an answer. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [context]
  );

  const reset = useCallback(() => {
    setAnswer(null);
    setError(null);
  }, []);

  return { answer, loading, error, ask, reset };
}