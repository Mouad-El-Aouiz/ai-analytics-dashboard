import type {
  DashboardAnalytics,
  MonthlyRevenue,
} from "../types/analytics";
import type {
  ForecastPoint,
  Insight,
  InsightSeverity,
} from "../types/insights";

// ============================================================================
// MOTEUR D'INSIGHTS
// ============================================================================
//
// Transforme les données analytics en observations en langage clair.
// Aucune requête réseau : tout est dérivé de l'objet `DashboardAnalytics`
// déjà chargé par le dashboard. Le calcul est donc instantané et gratuit.
//
// Trois familles :
//   1. Tendances  : évolution d'un KPI vs la période précédente.
//   2. Anomalies  : mois s'écartant fortement de la moyenne.
//   3. Faits      : panier moyen, meilleur mois, taux d'annulation.

// Constitution d'un insight de tendance à partir d'un KPI.
function buildTrendInsight(
  id: string,
  label: string,
  changePercent: number | null,
  trend: "up" | "down" | "neutral"
): Insight | null {
  if (changePercent === null) {
    if (trend === "up") {
      return {
        id,
        title: `${label} en hausse`,
        message: `${label} a démarré sur cette période (aucune donnée sur la période précédente).`,
        severity: "positive",
        category: "trend",
      };
    }

    return null;
  }

  const rounded = Math.abs(changePercent).toFixed(1);

  if (changePercent > 0) {
    return {
      id,
      title: `${label} en hausse de ${rounded}%`,
      message: `${label} a progressé de ${rounded}% par rapport à la période précédente.`,
      severity: "positive",
      category: "trend",
    };
  }

  if (changePercent < 0) {
    return {
      id,
      title: `${label} en baisse de ${rounded}%`,
      message: `${label} a reculé de ${rounded}% par rapport à la période précédente.`,
      severity: "warning",
      category: "trend",
    };
  }

  return {
    id,
    title: `${label} stable`,
    message: `${label} est stable par rapport à la période précédente.`,
    severity: "neutral",
    category: "trend",
  };
}

// Détecte les mois qui s'écartent fortement de la moyenne (> 40%).
// Retourne au plus l'écart le plus marqué pour ne pas noyer l'utilisateur.
function buildAnomalyInsight(
  data: MonthlyRevenue[]
): Insight | null {
  if (data.length < 4) {
    return null;
  }

  const total = data.reduce((sum, row) => sum + row.revenue, 0);
  const average = total / data.length;

  if (average <= 0) {
    return null;
  }

  let worst: MonthlyRevenue | null = null;
  let worstDeviation = 0;

  for (const row of data) {
    const deviation = (row.revenue - average) / average;

    if (Math.abs(deviation) > Math.abs(worstDeviation)) {
      worstDeviation = deviation;
      worst = row;
    }
  }

  if (worst === null || Math.abs(worstDeviation) < 0.4) {
    return null;
  }

  const percent = Math.abs(worstDeviation * 100).toFixed(0);
  const direction = worstDeviation > 0 ? "au-dessus" : "en dessous";

  return {
    id: "revenue-anomaly",
    title: "Écart inhabituel détecté",
    message: `${worst.month} se situe ${percent}% ${direction} de votre revenu mensuel moyen ($${average.toLocaleString(
      undefined,
      { maximumFractionDigits: 0 }
    )}).`,
    severity: worstDeviation > 0 ? "positive" : "warning",
    category: "anomaly",
  };
}

// Construit l'ensemble des insights à afficher.
export function buildInsights(
  analytics: DashboardAnalytics | null
): Insight[] {
  if (!analytics) {
    return [];
  }

  const insights: (Insight | null)[] = [
    buildTrendInsight(
      "revenue-trend",
      "Le chiffre d'affaires",
      analytics.revenue.changePercent,
      analytics.revenue.trend
    ),
    buildTrendInsight(
      "orders-trend",
      "Le nombre de commandes",
      analytics.orders.changePercent,
      analytics.orders.trend
    ),
  ];

  // Panier moyen : revenu / nombre de commandes.
  if (analytics.orders.value > 0) {
    const average = analytics.revenue.value / analytics.orders.value;

    insights.push({
      id: "average-order-value",
      title: "Panier moyen",
      message: `Le panier moyen est de $${average.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })} par commande.`,
      severity: "neutral",
      category: "highlight",
    });
  }

  // Meilleur mois en revenus.
  if (analytics.monthlyRevenue.length > 0) {
    const best = analytics.monthlyRevenue.reduce((max, row) =>
      row.revenue > max.revenue ? row : max
    );

    insights.push({
      id: "best-month",
      title: "Meilleur mois",
      message: `Votre meilleur mois est ${best.month} avec $${best.revenue.toLocaleString()} de revenus.`,
      severity: "positive",
      category: "highlight",
    });
  }

  // Anomalie éventuelle.
  insights.push(buildAnomalyInsight(analytics.monthlyRevenue));

  return insights.filter(
    (insight): insight is Insight => insight !== null
  );
}

// ============================================================================
// PRÉVISIONS
// ============================================================================
//
// Projection simple par régression linéaire sur l'historique des revenus.
// Volontairement sans dépendance : suffisant pour une tendance lisible.

// Calcule la pente et l'ordonnée à l'origine (moindres carrés) de la série.
function linearRegression(values: number[]): {
  slope: number;
  intercept: number;
} {
  const n = values.length;

  if (n === 0) {
    return { slope: 0, intercept: 0 };
  }

  if (n === 1) {
    return { slope: 0, intercept: values[0] };
  }

  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((sum, value) => sum + value, 0);
  const sumXY = values.reduce((sum, value, index) => sum + index * value, 0);
  const sumXX = values.reduce((sum, _value, index) => sum + index * index, 0);

  const denominator = n * sumXX - sumX * sumX;

  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// Décale un libellé "Jan 2026" de `months` mois.
function shiftMonth(label: string, months: number): string {
  const parsed = new Date(`${label} 1`);

  if (Number.isNaN(parsed.getTime())) {
    return label;
  }

  parsed.setMonth(parsed.getMonth() + months);

  return parsed.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// Produit une série combinant historique réel et projection.
// `forecastMonths` = nombre de mois projetés (par défaut 3).
export function buildForecast(
  data: MonthlyRevenue[],
  forecastMonths = 3
): ForecastPoint[] {
  if (data.length === 0) {
    return [];
  }

  const values = data.map((row) => row.revenue);
  const { slope, intercept } = linearRegression(values);
  const n = values.length;

  const points: ForecastPoint[] = data.map((row, index) => ({
    month: row.month,
    revenue: row.revenue,
    // Le dernier point réel amorce la courbe projetée (les deux se rejoignent).
    forecast: index === n - 1 ? row.revenue : null,
  }));

  const lastMonth = data[n - 1].month;

  for (let step = 1; step <= forecastMonths; step += 1) {
    const projected = intercept + slope * (n - 1 + step);

    points.push({
      month: shiftMonth(lastMonth, step),
      revenue: null,
      // On ne projette jamais un revenu négatif.
      forecast: Math.max(0, Math.round(projected)),
    });
  }

  return points;
}

// Traduit un niveau de sévérité en libellé lisible (pour la page dédiée).
export function severityLabel(severity: InsightSeverity): string {
  switch (severity) {
    case "positive":
      return "Positif";
    case "warning":
      return "Attention";
    case "neutral":
      return "Neutre";
  }
}