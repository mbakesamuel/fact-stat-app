import {
  DailyEstimate,
  Factories,
  MonthlyStats,
  Processing,
  Reception,
  Totals,
  YearlyEstimates,
  YearlyStats,
} from "@/lib/types";
import { getCropReception } from "../actions/receptionActions";
import { getCropProcessing } from "../actions/processingActions";
import { useQuery } from "@tanstack/react-query";
import { getSingleFactory } from "../actions/factoryActions";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { getPhasingEstimates } from "../actions/phasingActions";
import StatsCard from "./statsCard";

// WeeklyEstimate type to match controller response
interface WeeklyEstimate {
  cropTypeId: number;
  crop_type: string;
  weeklyEstimate: number;
  actualReception: number;
  variance: number;
  weekNo: number;
  period: string;
}

interface DashboardProps {
  factoryId: number;
}

export default function Dashboard({ factoryId }: DashboardProps) {
  const { user } = useUser();
  const today = new Date().toISOString().split("T")[0];
  const year = new Date().getFullYear();

  // Actual receptions
  const { data: receptions = [], isLoading: loadingReceptions } = useQuery<
    Reception[]
  >({
    queryKey: ["cropReceptions", factoryId],
    queryFn: () => getCropReception(factoryId),
  });

  // Actual processing
  const { data: processing = [], isLoading: loadingProcessing } = useQuery<
    Processing[]
  >({
    queryKey: ["cropProcessing", factoryId],
    queryFn: () => getCropProcessing(factoryId),
  });

  // Factory info
  const { data: factory } = useQuery<Factories>({
    queryKey: ["factory", factoryId],
    queryFn: () => getSingleFactory(factoryId),
  });

  // Unified phasing estimates
  const { data: phasing, isLoading: loadingPhasing } = useQuery({
    queryKey: ["phasingEstimates", factoryId, today],
    queryFn: () => getPhasingEstimates(factoryId, year, today),
  });

  const isLoading = loadingReceptions || loadingProcessing || loadingPhasing;

  if (isLoading || !phasing) return <Skeleton className="w-full h-64" />;
  // --- Helpers to compute totals ---
  const sumDaily = phasing.estimates.daily.reduce(
    (acc: Totals, d: DailyEstimate) => {
      acc.actual += d.actualReception;
      acc.estimate += d.dailyEstimate;
      acc.variance += d.variance;
      return acc;
    },
    { actual: 0, estimate: 0, variance: 0 }
  );

  const sumWeekly = phasing.estimates.weekly.reduce(
    (acc: Totals, w: WeeklyEstimate) => {
      acc.actual += w.actualReception;
      acc.estimate += w.weeklyEstimate;
      acc.variance += w.variance;
      return acc;
    },
    { actual: 0, estimate: 0, variance: 0 }
  );

  type MonthlyRecord = Record<string, MonthlyStats>;
  type MonthlyEstimates = Record<string, MonthlyRecord>;
  const monthlyEstimates = phasing.estimates.monthly as MonthlyEstimates;

  const sumMonthly = Object.values(monthlyEstimates).reduce<MonthlyStats>(
    (acc, month) => {
      Object.values(month).forEach((stats) => {
        acc.actual += stats.actual;
        acc.estimate += stats.estimate;
        acc.variance += stats.variance;
      });
      return acc;
    },
    { actual: 0, estimate: 0, variance: 0 }
  );

  const yearlyEstimates: YearlyEstimates = phasing.estimates.yearly;
  const sumYearly = Object.values(yearlyEstimates).reduce<YearlyStats>(
    (acc, stats) => {
      acc.actual += stats.actual;
      acc.estimate += stats.estimate;
      acc.variance += stats.variance;
      return acc;
    },
    { actual: 0, estimate: 0, variance: 0 }
  );

  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-bold mb-4">
        Factory Production Overview –{" "}
        <span className="text-4xl text-green-600">{factory?.factory_name}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Daily"
          subtitle={today}
          totals={sumDaily}
          rows={(phasing.estimates.daily as DailyEstimate[]).map((d) => ({
            label: d.crop_type,
            actual: d.actualReception,
            estimate: d.dailyEstimate,
            variance: d.variance,
          }))}
          accentColor="green"
        />

        <StatsCard
          title="Weekly"
          totals={sumWeekly}
          rows={phasing.estimates.weekly.map((w:any) => ({
            label: w.crop_type,
            actual: w.actualReception,
            estimate: w.weeklyEstimate,
            variance: w.variance,
          }))}
          accentColor="blue"
        />

        <StatsCard
          title="Monthly"
          totals={sumMonthly}
          rows={Object.entries(monthlyEstimates).flatMap(([month, grades]) =>
            Object.entries(grades).map(([crop, stats]) => ({
              label: `${month} - ${crop}`,
              actual: stats.actual,
              estimate: stats.estimate,
              variance: stats.variance,
            }))
          )}
          accentColor="orange"
        />

        <StatsCard
          title="Year‑to‑Date"
          subtitle={`as of ${today}`}
          totals={sumYearly}
          rows={Object.entries(yearlyEstimates).map(([crop, stats]) => ({
            label: crop,
            actual: stats.actual,
            estimate: stats.estimate,
            variance: stats.variance,
          }))}
          accentColor="purple"
        />
      </div>
    </div>
  );
}
