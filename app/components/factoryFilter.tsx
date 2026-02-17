"use client";

import { Factory } from "@/lib/types";
import { Filter } from "lucide-react";

interface FactoryFilterProps {
  factories: Factory[];
  value: string;
  onChange: (value: string) => void;
}

export function FactoryFilter({
  factories,
  value,
  onChange,
}: FactoryFilterProps) {
  return (
    <div className="flex items-center gap-4">
     {/*  <Filter className="w-5 h-5 text-slate-500" /> */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto"
      >
        <option value="All">All Factories</option>
        {factories.map((factory) => (
          <option key={factory.id} value={factory.id}>
            {factory.factory_name}
          </option>
        ))}
      </select>
    </div>
  );
}
