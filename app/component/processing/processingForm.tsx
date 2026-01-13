import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateForInput } from "@/lib/dateFormater";
import { Processing } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { X, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import {
  createCropProcessing,
  updateCropProcessing,
} from "@/app/actions/processingActions";

interface ProcessingformProps {
  processing: Processing | null;
  onClose: () => void;
  factories: { id: string; factory_name: string }[];
  fieldSupplies: { id: string; crop: string }[];
}

export default function Processingform({
  processing,
  onClose,
  factories,
  fieldSupplies,
}: ProcessingformProps) {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    operation_date: processing?.operation_date
      ? formatDateForInput(processing.operation_date)
      : "",
    factory_id: processing ? processing.factory_id : "",
    process_grade_id: processing ? processing.process_grade_id : "",
    qty_proc: processing?.qty_proc || 0,
  });

  //build the mutation object
  const saveMutation = useMutation({
    mutationFn: async (data: Processing) => {
      const payload: Processing = { ...data, user_id: user?.id || "" };
      if (processing?.id) {
        //update existing processing
        return updateCropProcessing(String(processing.id), payload);
      } else {
        //create new processing
        return createCropProcessing(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crop-processings"] });
      onClose();
    },
  });

  //calling the mutation through form submit action
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  //handle input changes
  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="glass-effect border-none shadow-2xl mb-6">
      <CardHeader className="border-b border-slate-100">
        <div className="flex item-center justify-between">
          <CardTitle className="text-xl">
            {processing ? "Edit Processing" : "New Processing"}
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
      <CardContent>
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
                    <SelectItem key={factory.id} value={factory.id}>
                      {factory.factory_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Process Grade</Label>
              <Select
                value={formData.process_grade_id}
                onValueChange={(value) =>
                  handleChange("process_grade_id", value)
                }
                required
              >
                <SelectTrigger className="border-slate-200 w-full">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {fieldSupplies.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
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
              disabled={saveMutation.isPending}
              className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
