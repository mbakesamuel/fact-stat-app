"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Reception, ProductType, SupplyUnit } from "@/lib/types";
import { formatDateForInput } from "@/lib/HelperFunctions";
import { SupplySourceCheckbox } from "./supplySource";

export default function ReceptionFormModal({
  reception,
  onClose,
  onSubmit,
  fieldSupplies,
  supplyUnits,
}: {
  reception: Reception | null;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  fieldSupplies: ProductType[];
  supplyUnits: SupplyUnit[];
}) {
  const [selectedSources, setSelectedSources] = useState<number | null>(null);
  const [formData, setFormData] = useState<Reception>({
    id: reception?.id,
    operation_date: reception?.operation_date
      ? formatDateForInput(reception.operation_date)
      : formatDateForInput(new Date().toISOString()), // default to today
    factory_id: reception?.factory_id || "",
    field_grade_id: reception ? String(reception.field_grade_id) : "",
    supply_unit_id: reception ? String(reception.supply_unit_id) : "",
    qty_crop: reception ? reception.qty_crop : 0,
  });

  function handleChange(field: string, value: string | number) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="operation_date">Operation Date</Label>
          <Input
            id="operation_date"
            type="date"
            value={formData.operation_date}
            onChange={(e) => handleChange("operation_date", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="supply_source">Supply Source</Label>
          <div className="mt-2">
            <SupplySourceCheckbox
              value={selectedSources}
              onChange={setSelectedSources}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Select Product</Label>
          <Select
            value={formData.field_grade_id}
            onValueChange={(value) => handleChange("field_grade_id", value)} //notice here we pass value directly unlike in Input
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {fieldSupplies.map((grade) => (
                <SelectItem key={grade.id} value={String(grade.id)}>
                  {grade.crop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supply_unit">Select Supply Unit</Label>
          <Select
            value={formData.supply_unit_id}
            onValueChange={(value) => handleChange("supply_unit_id", value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select supply unit" />
            </SelectTrigger>
            <SelectContent>
              {supplyUnits
                .filter((unit) =>
                  !selectedSources
                    ? true
                    : Number(unit.sub_unit_id === selectedSources),
                )
                .map((unit) => (
                  <SelectItem key={unit.id} value={String(unit.id)}>
                    {unit.SupplyUnit}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="qty_crop">Quantity (tons)</Label>
        <Input
          id="qty_crop"
          type="number"
          value={formData.qty_crop}
          onChange={(e) => handleChange("qty_crop", Number(e.target.value))}
          required
          placeholder="0.00"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-600 text-white">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  );
}
