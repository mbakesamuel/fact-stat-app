import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define allowed period values
type PeriodValue = "daily" | "weekly" | "monthly" | "yearly";

// Period option type
interface PeriodOption {
  value: PeriodValue;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const periods: PeriodOption[] = [
  { value: "daily", label: "Daily", icon: Calendar },
  { value: "weekly", label: "Weekly", icon: CalendarDays },
  { value: "monthly", label: "Monthly", icon: CalendarRange },
  { value: "yearly", label: "Yearly", icon: CalendarClock },
];

// Props for PeriodTabs
interface PeriodTabsProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
}

const PeriodTabs: React.FC<PeriodTabsProps> = ({ value, onChange }) => {
  return (
    <Tabs
      value={value}
      onValueChange={(newValue) => onChange(newValue as PeriodValue)}
      className="w-full"
    >
      <TabsList className="bg-slate-100/80 p-1 rounded-xl h-auto flex-wrap">
        {periods.map((period) => {
          const Icon = period.icon;
          return (
            <TabsTrigger
              key={period.value}
              value={period.value}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all",
                "data-[state=active]:bg-white data-[state=active]:shadow-sm",
                "data-[state=active]:text-slate-900",
                "text-slate-600 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{period.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default PeriodTabs;
