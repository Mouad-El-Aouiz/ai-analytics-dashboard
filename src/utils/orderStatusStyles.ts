import type { OrderStatus } from "../types/analytics";

// Une couleur par statut, partagée par tout ce qui affiche un statut :
// le badge des commandes récentes et cette répartition.
export const ORDER_STATUS_STYLES: Record<
  OrderStatus,
  { label: string; badge: string; bar: string }
> = {
  completed: {
    label: "Completed",
    badge: "bg-green-100 text-green-700",
    bar: "bg-green-500",
  },
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-500",
  },
};