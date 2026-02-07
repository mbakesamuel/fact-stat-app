import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getFactory } from "@/app/actions/factoryActions";
import { Factory } from "@/lib/types";

const years: string[] = ["2024", "2025", "2026", "2027"];

interface DashboardFiltersProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  year: string;
  setYear: (year: string) => void;
  factoryId: string;
  setFactoryId: (factoryId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function DashboardFilters({
  date,
  setDate,
  year,
  setYear,
  factoryId,
  setFactoryId,
  onRefresh,
  isLoading,
}: DashboardFiltersProps) {
  //lets get factories
  const { data: factories = [] } = useQuery<Factory[]>({
    queryKey: ["factories"],
    queryFn: () => getFactory(),
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all",
              !date && "text-slate-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
            {date ? format(date, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white border-slate-200 shadow-xl"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="rounded-lg"
          />
        </PopoverContent>
      </Popover>

      {/* Year Selector */}
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="w-[120px] bg-white border-slate-200 hover:border-slate-300 transition-all">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200 shadow-xl">
          {years.map((y) => (
            <SelectItem key={y} value={y} className="hover:bg-slate-50">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Factory Selector */}
      <Select value={factoryId} onValueChange={setFactoryId}>
        <SelectTrigger className="w-[220px] bg-white border-slate-200 hover:border-slate-300 transition-all">
          {/*  <Factory className="mr-2 h-4 w-4 text-slate-400" /> */}
          <SelectValue placeholder="Select factory" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200 shadow-xl">
          {factories.map((factory) => (
            <SelectItem
              key={factory.id}
              value={factory.id}
              className="hover:bg-slate-50"
            >
              {factory.factory_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Refresh Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
        className="bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        <RefreshCw
          className={cn("h-4 w-4 text-slate-600", isLoading && "animate-spin")}
        />
      </Button>
    </div>
  );
}
