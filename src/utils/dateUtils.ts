import { subDays, subMonths, subYears } from "date-fns";
import type { DateRange } from "../types/dateRange";

// "now" est un paramètre (avec une valeur par défaut) pour pouvoir
// tester la fonction avec une date fixe plutôt que l'heure réelle.
export function getStartDate(
  dateRange: DateRange,
  now: Date = new Date()
): Date | null {
  switch (dateRange) {
    case "7d":
      return subDays(now, 7);

    case "30d":
      return subDays(now, 30);

    case "90d":
      return subDays(now, 90);

    case "6m":
      return subMonths(now, 6);

    case "12m":
      return subYears(now, 1);

    case "all":
      return null;
  }
}