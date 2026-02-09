"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface SupplySourceCheckboxProps {
  value: number | null;
  onChange: (value: number) => void;
}

const OPTIONS = [
  { id: 1, label: "CDC" },
  { id: 2, label: "CRT" },
  { id: 3, label: "SHO" },
];

export function SupplySourceCheckbox({
  value,
  onChange,
}: SupplySourceCheckboxProps) {
  const handleSelect = (option: number) => {
    if (value === option) {
      // uncheck if already selected onChange(null);
    } else {
      // select new option
      onChange(option);
    }
  };

  return (
    <div className="flex flex-row gap-3">
      {OPTIONS.map((option) => (
        <label
          key={option.id}
          className="flex items-center gap-2 cursor-pointer text-slate-700"
        >
          <Checkbox
            checked={value===option.id}
            onCheckedChange={() => handleSelect((option.id))}
          />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
