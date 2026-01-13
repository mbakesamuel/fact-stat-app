import {
  createCropReception,
  updateCropReception,
} from "@/app/actions/receptionActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateForInput } from "@/lib/dateFormater";
import { Reception } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { FormEvent, useState } from "react";

interface ReceptionFormProps {
  reception?: Reception | null;
  onClose: () => void;
  factories: { id: string; factory_name: string }[];
  fieldSupplies: { id: string; crop: string }[];
  supplyUnits: { id: string; SupplyUnit: string }[];
}

export default function ReceptionForm({
  reception,
  onClose,
  factories,
  fieldSupplies,
  supplyUnits,
}: ReceptionFormProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Reception>({
    id: reception?.id || "",
    operation_date: reception?.operation_date
      ? formatDateForInput(reception.operation_date)
      : "",
    factory_id: reception ? String(reception.factory_id) : "",
    field_grade_id: reception ? String(reception.field_grade_id) : "",
    supply_unit_id: reception ? String(reception.supply_unit_id) : "",
    qty_crop: reception?.qty_crop || 0,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Reception) => {
      const payload: Reception = {
        ...data,
        user_id: user?.primaryEmailAddress?.emailAddress,
      };

      if (reception) {
        return updateCropReception(reception.id, payload);
      } else {
        return createCropReception(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cropReceptions"] });
      onClose();
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="glass-effect border-none shadow-2xl mb-6">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {reception ? "Edit Reception" : "New Reception"}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
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
              <Label htmlFor="factory">Factory</Label>
              <Select
                value={formData.factory_id}
                onValueChange={(value) => handleChange("factory_id", value)}
                required
              >
                <SelectTrigger className="border-slate-200 w-full">
                  <SelectValue placeholder="Select factory" />
                </SelectTrigger>
                <SelectContent>
                  {factories.map((factory) => (
                    <SelectItem key={factory.id} value={String(factory.id)}>
                      {factory.factory_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Crop Grade</Label>
              <Select
                value={formData.field_grade_id}
                onValueChange={(value) => handleChange("field_grade_id", value)}
                required
              >
                <SelectTrigger className="border-slate-200 w-full">
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
              <Label htmlFor="supply_unit">Supply Unit</Label>
              <Select
                value={formData.supply_unit_id}
                onValueChange={(value) => handleChange("supply_unit_id", value)}
                required
              >
                <SelectTrigger className="border-slate-200 w-full">
                  <SelectValue placeholder="Select supply unit" />
                </SelectTrigger>
                <SelectContent>
                  {supplyUnits.map((unit) => (
                    <SelectItem key={unit.id} value={String(unit.id)}>
                      {unit.SupplyUnit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty_crop">Quantity (tons)</Label>
              <Input
                id="qty_crop"
                type="number"
                step="0.01"
                value={formData.qty_crop}
                onChange={(e) =>
                  handleChange("qty_crop", parseFloat(e.target.value))
                }
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
              disabled={saveMutation.isPending}
              className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
