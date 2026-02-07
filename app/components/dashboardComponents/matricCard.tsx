import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type TrendDirection = "up" | "down" | "flat";
type ColorVariant = "slate" | "emerald" | "amber" | "rose" | "blue" | "violet";

interface MetricCardProps {
  title: string;
  value: string | number;
    subtitle?: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;  
    trend?:TrendDirection;
    trendValue?: string | number;
    color?: ColorVariant;
    delay?: number;
}

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = "slate",
  delay = 0 
}:MetricCardProps) {
  const colorClasses = {
    slate: "from-slate-500 to-slate-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    blue: "from-blue-500 to-blue-600",
    violet: "from-violet-500 to-violet-600",
  };

  const bgColorClasses = {
    slate: "bg-slate-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    rose: "bg-rose-50",
    blue: "bg-blue-50",
    violet: "bg-violet-50",
  };

  const iconColorClasses = {
    slate: "text-slate-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    blue: "text-blue-600",
    violet: "text-violet-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Gradient accent */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", colorClasses[color])} />
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          
          {Icon && (
            <div className={cn("p-3 rounded-xl", bgColorClasses[color])}>
              <Icon className={cn("h-6 w-6", iconColorClasses[color])} />
            </div>
          )}
        </div>

        {trend !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <span className={cn(
              "text-sm font-semibold",
              trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500"
            )}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </span>
            <span className="text-xs text-slate-400">vs estimate</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}