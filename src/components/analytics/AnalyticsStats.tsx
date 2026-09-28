import StatsGrid from "../dashboard/StatsGrid";
import type { DashboardAnalytics } from "../../types/analytics";

interface AnalyticsStatsProps {
  analytics: DashboardAnalytics | null;
}

// Analytics affiche les 7 KPI (via StatsGrid variant="analytics").
// Ce composant reste pour ne pas casser les imports existants dans
// Analytics.tsx : il délègue simplement le rendu à StatsGrid.
function AnalyticsStats({ analytics }: AnalyticsStatsProps) {
  return <StatsGrid analytics={analytics} variant="analytics" />;
}

export default AnalyticsStats;