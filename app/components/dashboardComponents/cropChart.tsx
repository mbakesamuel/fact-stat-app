import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

// Define the shape of each data item
interface CropDataItem {
  crop_type: string;
  dailyEstimate?: number;
  weeklyEstimate?: number;
  monthlyEstimate?: number;
  yearlyEstimate?: number;
  actualReception?: number;
  variance?: number;
  [key: string]: any; // allow dynamic keys like `${period}Estimate`
}

// Props for the chart
interface CropChartProps {
  data: CropDataItem[];
  period: "daily" | "weekly" | "monthly" | "yearly";
}

// Props for the custom tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    color: string;
    name: string;
    value: number;
  }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
        <p className="font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-semibold text-slate-900">
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CropChart: React.FC<CropChartProps> = ({ data, period }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-400">
        No data available
      </div>
    );
  }

  const estimateKey = `${period}Estimate`;

  const chartData = data.map((item) => ({
    name: item.crop_type,
    Estimate:
      item[estimateKey] ??
      item.dailyEstimate ??
      item.weeklyEstimate ??
      item.monthlyEstimate ??
      item.yearlyEstimate ??
      0,
    Actual: item.actualReception ?? 0,
    Variance: item.variance ?? 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Estimates vs Actual Reception
        </h3>
        <p className="text-sm text-slate-500 mt-1">Comparison by crop type</p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 20 }} iconType="circle" />
          <Bar
            dataKey="Estimate"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
          />
          <Bar
            dataKey="Actual"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default CropChart;
