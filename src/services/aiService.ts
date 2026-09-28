import { supabase } from "../lib/supabaseClient";
import type {
  AiAssistantResponse,
  AiContext,
  AiInsights,
} from "../types/ai";

// Appelle la Supabase Edge Function `ai-insights`.
// Retourne null si Gemini est indisponible (fallback côté appelant).
export async function generateAiInsights(
  context: AiContext
): Promise<AiInsights | null> {
  const { data, error } = await supabase.functions.invoke("ai-insights", {
    body: context,
  });

  if (error) {
    console.error("ai-insights failed:", error);
    return null;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  // Validation minimale du schéma.
  const candidate = data as Partial<AiInsights>;

  if (
    typeof candidate.executiveSummary !== "string" ||
    !Array.isArray(candidate.positiveTrends) ||
    !Array.isArray(candidate.negativeTrends) ||
    !Array.isArray(candidate.anomalies) ||
    !Array.isArray(candidate.recommendations)
  ) {
    console.error("Invalid AI insights shape:", data);
    return null;
  }

  return {
    executiveSummary: candidate.executiveSummary,
    positiveTrends: candidate.positiveTrends,
    negativeTrends: candidate.negativeTrends,
    anomalies: candidate.anomalies,
    recommendations: candidate.recommendations,
  };
}

// Appelle la Supabase Edge Function `ai-assistant`.
export async function askAiAssistant(
  question: string,
  context: AiContext
): Promise<AiAssistantResponse | null> {
  const { data, error } = await supabase.functions.invoke("ai-assistant", {
    body: { question, context },
  });

  if (error) {
    console.error("ai-assistant failed:", error);
    return null;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const candidate = data as Partial<AiAssistantResponse>;

  if (
    typeof candidate.answer !== "string" ||
    !Array.isArray(candidate.keyPoints)
  ) {
    console.error("Invalid AI assistant shape:", data);
    return null;
  }

  return {
    answer: candidate.answer,
    keyPoints: candidate.keyPoints,
  };
}