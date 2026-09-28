import { useState } from "react";
import { Download, FileText } from "lucide-react";

import { useAnalytics } from "../hooks/useAnalytics";
import { useAnalyticsBreakdowns } from "../hooks/useAnalyticsBreakdowns";
import { downloadCsv } from "../utils/csvUtils";
import type { DateRange } from "../types/dateRange";

import Skeleton from "../components/ui/Skeleton";

function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { analytics, loading, error } = useAnalytics(dateRange);
  const {
    ordersByStatus,
    revenueByProduct,
    revenueByCategory,
  } = useAnalyticsBreakdowns(dateRange);

  // Chaque rapport exporte un CSV construit à partir des données déjà
  // chargées. Rien n'est codé en dur : tout vient de Supabase.
  const reports = [
    {
      id: "revenue",
      title: "Rapport de revenus",
      description: "Revenus mensuels (commandes complétées).",
      rows: () =>
        (analytics?.monthlyRevenue ?? []).map((row) => [
          row.month,
          row.revenue,
        ]),
      headers: ["Mois", "Revenu"],
    },
    {
      id: "revenue-by-product",
      title: "Revenus par produit",
      description: "Chiffre d'affaires par produit et catégorie.",
      rows: () =>
        revenueByProduct.map((row) => [
          row.product,
          row.category,
          row.revenue,
        ]),
      headers: ["Produit", "Categorie", "Revenu"],
    },
    {
      id: "revenue-by-category",
      title: "Revenus par catégorie",
      description: "Répartition du chiffre d'affaires par catégorie.",
      rows: () =>
        revenueByCategory.map((row) => [row.category, row.revenue]),
      headers: ["Categorie", "Revenu"],
    },
    {
      id: "orders-by-status",
      title: "Commandes par statut",
      description: "Nombre et montant des commandes par statut.",
      rows: () =>
        ordersByStatus.map((row) => [
          row.status,
          row.count,
          row.totalAmount,
        ]),
      headers: ["Statut", "Nombre", "Montant total"],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Exportez vos données analytiques au format CSV.
          </p>
        </div>

        <select
          value={dateRange}
          onChange={(event) =>
            setDateRange(event.target.value as DateRange)
          }
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

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              <Skeleton className="mt-4 h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Reports grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {reports.map((report) => {
            const rowCount = report.rows().length;

            return (
              <div
                key={report.id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {report.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {report.description}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {rowCount} ligne{rowCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      `${report.id}-${dateRange}.csv`,
                      report.headers,
                      report.rows()
                    )
                  }
                  disabled={rowCount === 0}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Reports;