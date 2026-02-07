import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Define the shape of each data item
interface CropDataItem {
  cropTypeId?: number;
  crop_type: string;
  dailyEstimate?: number;
  weeklyEstimate?: number;
  monthlyEstimate?: number;
  yearlyEstimate?: number;
  actualReception?: number;
  variance?: number;
  [key: string]: any; // allow dynamic keys like `${period}Estimate`
}

// Props for the table
interface CropDataTableProps {
  data: CropDataItem[];
  period: "daily" | "weekly" | "monthly" | "yearly";
}

// Variance indicator type
interface VarianceIndicator {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
  label: string;
}

export default function CropDataTable({ data, period }: CropDataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-400">
        No data available
      </div>
    );
  }

  const estimateKey = `${period}Estimate`;

  const getVarianceIndicator = (variance: number): VarianceIndicator => {
    if (variance > 0) {
      return {
        icon: TrendingUp,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        label: "Above",
      };
    } else if (variance < 0) {
      return {
        icon: TrendingDown,
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        label: "Below",
      };
    }
    return {
      icon: Minus,
      color: "text-slate-500",
      bgColor: "bg-slate-50",
      label: "On Target",
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Detailed Breakdown</h3>
        <p className="text-sm text-slate-500 mt-1">Complete crop phasing data</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-semibold text-slate-700">Crop Type</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Estimate</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actual</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Variance</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const estimate =
                item[estimateKey] ??
                item.dailyEstimate ??
                item.weeklyEstimate ??
                item.monthlyEstimate ??
                item.yearlyEstimate ??
                0;
              const variance = item.variance ?? 0;
              const indicator = getVarianceIndicator(variance);
              const Icon = indicator.icon;

              return (
                <TableRow
                  key={item.cropTypeId ?? index}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-8 rounded-full",
                          index === 0
                            ? "bg-indigo-500"
                            : index === 1
                            ? "bg-emerald-500"
                            : index === 2
                            ? "bg-amber-500"
                            : "bg-violet-500"
                        )}
                      />
                      <span className="font-medium text-slate-900">
                        {item.crop_type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-700">
                    {estimate.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-900 font-semibold">
                    {item.actualReception?.toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono font-semibold",
                      variance >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {variance >= 0 ? "+" : ""}
                    {variance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "gap-1 font-medium",
                        indicator.bgColor,
                        indicator.color
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {indicator.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
