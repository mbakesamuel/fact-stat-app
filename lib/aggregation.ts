import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { FactWeeklyPhasing } from "./types";

export function aggregateByPeriodAndGrade<
  T extends {
    operation_date: string;
    qty_crop?: number;
    qty_proc?: number;
    field_grade_name?: string;
    process_grade_name?: string;
  },
>(data: T[], key: "qty_crop" | "qty_proc") {
  const today = new Date();

  // Helper to sum by grade name (auto-detect field vs process)
  const sumByGrade = (items: T[]) =>
    items.reduce<Record<string, number>>((acc, d) => {
      const gradeName = d.field_grade_name ?? d.process_grade_name ?? "Unknown";
      acc[gradeName] = (acc[gradeName] ?? 0) + (d[key] ?? 0);
      return acc;
    }, {});

  // Daily
  const daily = sumByGrade(
    data.filter(
      (d) =>
        format(parseISO(d.operation_date), "yyyy-MM-dd") ===
        format(today, "yyyy-MM-dd")
    )
  );

  // Weekly
  const weekly = sumByGrade(
    data.filter(
      (d) =>
        parseISO(d.operation_date) >= startOfWeek(today, { weekStartsOn: 1 })
    )
  );

  // Monthly
  const monthly = sumByGrade(
    data.filter((d) => parseISO(d.operation_date) >= startOfMonth(today))
  );

  // Yearly
  const yearly = sumByGrade(
    data.filter((d) => parseISO(d.operation_date) >= startOfYear(today))
  );

  return { daily, weekly, monthly, yearly };
}

export function aggregateWeeklyPhasing(data: FactWeeklyPhasing[]) {
  const weekly: Record<string, number> = {};
  const monthly: Record<string, number> = {};
  const yearly: Record<string, number> = {};

  for (const row of data) {
    // Weekly
    weekly[`Week ${row.weekNo}`] =
      (weekly[`Week ${row.weekNo}`] ?? 0) + row.WkEst;

    // Monthly
    monthly[row.Period] = (monthly[row.Period] ?? 0) + row.WkEst;

    // Yearly
    yearly[row.BudYear] = (yearly[row.BudYear] ?? 0) + row.WkEst;
  }

  return { weekly, monthly, yearly };
}
