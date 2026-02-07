import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

// Shape of each data item
interface VarianceDataItem {
  crop_type: string;
  variance?: number;
}

// Props for the chart
interface VarianceChartProps {
  data: VarianceDataItem[];
}

// Props for the custom tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
    color: string;
    name: string;
  }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isPositive = value >= 0;

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
        <p className="font-semibold text-slate-900 mb-2">{label}</p>
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`w-3 h-3 rounded-full ${
              isPositive ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <span className="text-slate-600">Variance:</span>
          <span
            className={`font-semibold ${
              isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {value?.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const VarianceChart: React.FC<VarianceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-400">
        No data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.crop_type,
    variance: item.variance ?? 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Variance Analysis</h3>
        <p className="text-sm text-slate-500 mt-1">Difference from estimates</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
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
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar dataKey="variance" radius={[6, 6, 6, 6]} maxBarSize={50}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.variance >= 0 ? "#10b981" : "#f43f5e"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default VarianceChart;
