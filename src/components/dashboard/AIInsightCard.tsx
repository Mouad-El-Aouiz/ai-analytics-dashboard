import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import type { DashboardAnalytics } from "../../types/analytics";
import { buildInsights } from "../../services/insightsService";
import InsightItem from "../insights/InsightItem";

interface AIInsightCardProps {
  analytics: DashboardAnalytics | null;
}

// Version compacte de la couche intelligence affichée sur le dashboard :
// les 3 premiers insights, avec un lien vers la page complète.
function AIInsightCard({ analytics }: AIInsightCardProps) {
  const insights = buildInsights(analytics).slice(0, 3);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Sparkles size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              AI Insights
            </p>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {insights.length}
            </span>
          </div>

          {insights.length === 0 ? (
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Pas encore assez de données pour générer des insights.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {insights.map((insight) => (
                <InsightItem key={insight.id} insight={insight} />
              ))}
            </ul>
          )}

          <Link
            to="/ai-insights"
            className="mt-3 flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
          >
            View AI Insights
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AIInsightCard;