// components/dashboard/DashboardClient.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  BarChart3,
  TrendingUp,
  Package,
  Activity,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardFilters from "./dashboardComponents/dashboardFilters";
import PeriodTabs from "./dashboardComponents/periodTabs";
import MetricCard from "./dashboardComponents/matricCard";
import CropChart from "./dashboardComponents/cropChart";
import VarianceChart from "./dashboardComponents/varianceChart";
import CropDataTable from "./dashboardComponents/cropDataTable";
import { CropDataItem, CropDataResponse, PeriodValue } from "@/lib/types";

// Fetch function
const fetchCropData = async ({
  year,
  factoryId,
  date,
}: {
  year: string;
  factoryId: string;
  date: Date | undefined;
}): Promise<CropDataResponse> => {
  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
  const response = await fetch(
    `https://fact-data.onrender.com/api/crop-phasing?year=${year}&factoryId=${factoryId}&date=${formattedDate}`,
  );
  if (!response.ok) throw new Error("Failed to fetch crop data");
  return response.json();
};

export default function DashboardClient() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 18));
  const [year, setYear] = useState<string>("2026");
  const [factoryId, setFactoryId] = useState<string>("3");
  const [period, setPeriod] = useState<PeriodValue>("daily");

  const { data, isLoading, error, refetch } = useQuery<CropDataResponse>({
    queryKey: ["cropData", year, factoryId, date],
    queryFn: () => fetchCropData({ year, factoryId, date }),
    staleTime: 5 * 60 * 1000,
  });

  const currentPeriodData: CropDataItem[] = data?.estimates?.[period] || [];

  const totalEstimate = currentPeriodData.reduce((sum, item) => {
    const key = `${period}Estimate`;
    return (
      sum +
      (item[key] ||
        item.dailyEstimate ||
        item.weeklyEstimate ||
        item.monthlyEstimate ||
        item.yearlyEstimate ||
        0)
    );
  }, 0);

  const totalActual = currentPeriodData.reduce(
    (sum, item) => sum + (item.actualReception || 0),
    0,
  );
  const totalVariance = currentPeriodData.reduce(
    (sum, item) => sum + (item.variance || 0),
    0,
  );
  const variancePercent =
    totalEstimate > 0
      ? ((totalVariance / totalEstimate) * 100).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reception/Processing Dashboard
              </h1>
              {data?.factory_name && (
                <p className="text-sm text-slate-500 mt-1">
                  {data.factory_name} •{" "}
                  {date ? format(date, "MMMM d, yyyy") : ""}
                </p>
              )}
            </div>
            <DashboardFilters
              date={date}
              setDate={setDate}
              year={year}
              setYear={setYear}
              factoryId={factoryId}
              setFactoryId={setFactoryId}
              onRefresh={refetch}
              isLoading={isLoading}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load data. Please try again or check your connection.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">Loading crop data...</p>
            </div>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="mb-8">
              <PeriodTabs value={period} onChange={setPeriod} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Total Estimate"
                value={totalEstimate.toLocaleString()}
                subtitle={`${period} projection`}
                icon={BarChart3}
                color="blue"
                delay={0}
              />
              <MetricCard
                title="Actual Reception"
                value={totalActual.toLocaleString()}
                subtitle="Current period"
                icon={Package}
                color="emerald"
                delay={0.1}
              />
              <MetricCard
                title="Variance"
                value={`${
                  totalVariance >= 0 ? "+" : ""
                }${totalVariance.toLocaleString()}`}
                subtitle="Difference from estimate"
                icon={TrendingUp}
                color={totalVariance >= 0 ? "emerald" : "rose"}
                trend={totalVariance >= 0 ? "up" : "down"}
                trendValue={`${Math.abs(Number(variancePercent))}%`}
                delay={0.2}
              />
              <MetricCard
                title="Crop Types"
                value={currentPeriodData.length}
                subtitle="Active categories"
                icon={Activity}
                color="violet"
                delay={0.3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CropChart data={currentPeriodData} period={period} />
              <VarianceChart data={currentPeriodData} />
            </div>

            <CropDataTable data={currentPeriodData} period={period} />
          </>
        )}
      </main>

      <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-slate-500">
              Last updated: {format(new Date(), "PPpp")}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-slate-500">Live data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
