import { subDays, subMonths, subYears } from "date-fns";
import type { DateRange } from "../types/dateRange";


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

export interface PeriodBoundaries {
  currentStart: Date | null;
  previousStart: Date | null;
  previousEnd: Date | null;
}

export function getPeriodBoundaries(
  dateRange: DateRange,
  now: Date = new Date()
): PeriodBoundaries {
  const currentStart = getStartDate(dateRange, now);

  if (currentStart === null) {
    return { currentStart: null, previousStart: null, previousEnd: null };
  }

  const previousStart = getStartDate(dateRange, currentStart);

  return {
    currentStart,
    previousStart,
    previousEnd: currentStart,
  };
}