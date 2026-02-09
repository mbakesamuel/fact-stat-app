"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Processing, ProductType } from "@/lib/types";
import { useState } from "react";
import { formatDateForInput } from "@/lib/HelperFunctions";

export default function ProcessingFormModal({
  processing,
  onClose,
  onSubmit,
  products,
  factoryId,
  userId,
}: {
  processing: Processing | null;
  onClose: () => void;
  onSubmit: (formData: Processing) => void;
  products: ProductType[];
  factoryId: string;
  userId: string;
}) {
  const [formData, setFormData] = useState<Processing>({
    operation_date: processing?.operation_date
      ? formatDateForInput(processing.operation_date)
      : formatDateForInput(new Date().toISOString()),
    factory_id: factoryId,
    process_grade_id: processing ? String(processing.process_grade_id) : "",
    qty_proc: processing ? processing.qty_proc : 0,
    user_id: userId,
  });

  const [isSaving, setIsSaving] = useState(false);

  //handle user inputs
  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setIsSaving(true);
      onSubmit(formData);
    } finally {
      setIsSaving(false);
    }
  };

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
            className="border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Process Grade</Label>
          <Select
            value={formData.process_grade_id}
            onValueChange={(value) => handleChange("process_grade_id", value)}
            required
          >
            <SelectTrigger className="border-slate-200 w-full">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {products.map((grade) => (
                <SelectItem key={String(grade.id)} value={String(grade.id)}>
                  {grade.crop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qty_proc">Quantity (tons)</Label>
          <Input
            id="qty_proc"
            type="number"
            step="0.01"
            value={formData.qty_proc}
            onChange={(e) => handleChange("qty_proc", e.target.value)}
            required
            className="border-slate-200"
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-slate-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
