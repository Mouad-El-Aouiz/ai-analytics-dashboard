import { useMemo, useState } from "react";
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

import { useAnalytics } from "../hooks/useAnalytics";
import { useAnalyticsBreakdowns } from "../hooks/useAnalyticsBreakdowns";
import { useAiInsights } from "../hooks/useAiInsights";
import { buildInsights } from "../services/insightsService";
import { buildAiContext } from "../utils/aiContextUtils";
import type { DateRange } from "../types/dateRange";

import InsightItem from "../components/insights/InsightItem";
import Skeleton from "../components/ui/Skeleton";
import { useAiAssistant } from "../hooks/useAiAssistant";
import AssistantChat from "../components/ai/AssistantChat";

function AIInsights() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { analytics, loading, error } = useAnalytics(dateRange);
  const {
    revenueByProduct,
    revenueByCategory,
    ordersByStatus,
  } = useAnalyticsBreakdowns(dateRange);

  // Contexte compact pour Gemini (mémoïsé pour éviter les appels inutiles).
  const aiContext = useMemo(() => {
    if (!analytics) return null;
    return buildAiContext(
      analytics,
      dateRange,
      revenueByProduct,
      revenueByCategory,
      ordersByStatus
    );
  }, [analytics, dateRange, revenueByProduct, revenueByCategory, ordersByStatus]);

  const { insights: aiInsights, loading: aiLoading } = useAiInsights(aiContext);

  const {
    answer: assistantAnswer,
    loading: assistantLoading,
    error: assistantError,
    ask: askAssistant,
    reset: resetAssistant,
  } = useAiAssistant(aiContext);

  // Fallback déterministe si Gemini est indisponible.
  const fallbackInsights = useMemo(
    () => buildInsights(analytics),
    [analytics]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <Sparkles size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              AI Insights
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Generated from your business data.
            </p>
          </div>
        </div>

        <select
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value as DateRange)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="6m">Last 6 months</option>
          <option value="12m">Last 12 months</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* AI Content */}
      {!loading && !error && aiLoading && (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {!loading && !error && !aiLoading && aiInsights && (
        <>
          {/* Executive Summary */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Executive Summary
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {aiInsights.executiveSummary}
            </p>
          </section>

          {/* Positive Trends */}
          {aiInsights.positiveTrends.length > 0 && (
            <section className="rounded-xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-green-700" />
                <h2 className="text-sm font-semibold text-green-900">
                  Positive Trends
                </h2>
              </div>
              <ul className="mt-3 space-y-2">
                {aiInsights.positiveTrends.map((item, index) => (
                  <li key={index} className="text-sm leading-6 text-green-900">
                    • {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Negative Trends */}
          {aiInsights.negativeTrends.length > 0 && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-2">
                <TrendingDown size={18} className="text-red-700" />
                <h2 className="text-sm font-semibold text-red-900">
                  Negative Trends
                </h2>
              </div>
              <ul className="mt-3 space-y-2">
                {aiInsights.negativeTrends.map((item, index) => (
                  <li key={index} className="text-sm leading-6 text-red-900">
                    • {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Anomalies */}
          {aiInsights.anomalies.length > 0 && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-700" />
                <h2 className="text-sm font-semibold text-amber-900">
                  Anomalies
                </h2>
              </div>
              <ul className="mt-3 space-y-2">
                {aiInsights.anomalies.map((item, index) => (
                  <li key={index} className="text-sm leading-6 text-amber-900">
                    • {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Recommendations */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-gray-700" />
              <h2 className="text-sm font-semibold text-gray-900">
                Business Recommendations
              </h2>
            </div>
            <ul className="mt-3 space-y-2">
              {aiInsights.recommendations.map((item, index) => (
                <li key={index} className="text-sm leading-6 text-gray-700">
                  • {item}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Fallback (rule-based) si Gemini est indisponible */}
      {!loading && !error && !aiLoading && !aiInsights && (
        <>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              AI insights are currently unavailable. Showing rule-based insights instead.
            </p>
          </div>

          {fallbackInsights.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-sm text-gray-500">
                Not enough data to generate insights.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {fallbackInsights.map((insight) => (
                <InsightItem key={insight.id} insight={insight} />
              ))}
            </ul>
          )}
        </>
      )}
      {/* AI Assistant (chat conversationnel) */}
      {!loading && !error && (
        <AssistantChat
          context={aiContext}
          answer={assistantAnswer}
          loading={assistantLoading}
          error={assistantError}
          onAsk={askAssistant}
          onReset={resetAssistant}
        />
      )}
    </div>
  );
}

export default AIInsights;