import { AlertTriangle, Info, TrendingUp } from "lucide-react";

import type { Insight } from "../../types/insights";

// Rend un insight unique : icône selon la sévérité, titre, message et badge.
// Réutilisé par la carte compacte du dashboard et par la page AI Insights.
interface InsightItemProps {
  insight: Insight;
}

function InsightIcon({ insight }: { insight: Insight }) {
  if (insight.category === "anomaly") {
    return <AlertTriangle size={18} className="text-amber-600" />;
  }

  if (insight.severity === "positive") {
    return <TrendingUp size={18} className="text-green-600" />;
  }

  if (insight.severity === "warning") {
    return <AlertTriangle size={18} className="text-red-600" />;
  }

  return <Info size={18} className="text-gray-400" />;
}

function severityClasses(severity: Insight["severity"]): string {
  if (severity === "positive") {
    return "bg-green-50 text-green-700";
  }

  if (severity === "warning") {
    return "bg-red-50 text-red-700";
  }

  return "bg-gray-100 text-gray-600";
}

function severityText(severity: Insight["severity"]): string {
  if (severity === "positive") {
    return "Positif";
  }

  if (severity === "warning") {
    return "Attention";
  }

  return "Neutre";
}

function InsightItem({ insight }: InsightItemProps) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
      <span className="mt-0.5 shrink-0">
        <InsightIcon insight={insight} />
      </span>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">
            {insight.title}
          </p>

          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityClasses(
              insight.severity
            )}`}
          >
            {severityText(insight.severity)}
          </span>
        </div>

        <p className="mt-1 text-sm leading-6 text-gray-600">
          {insight.message}
        </p>
      </div>
    </li>
  );
}

export default InsightItem;