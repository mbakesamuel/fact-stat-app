import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getFactoryName,
  getGradeName,
  getSupplyUnitName,
} from "@/lib/HelperFunctions";
import {
  Factory,
  Reception,
  ProductType,
  SupplyUnit,
} from "@/lib/types";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

export default function ReceptionCard({
  reception,
  factories,
  products,
  supplyUnits,
  onEdit,
  onDelete,
}: {
  reception: Reception;
  factories: Factory[];
  products: ProductType[];
  supplyUnits: SupplyUnit[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4 rounded-xl shadow-md bg-linear-to-br from-white to-slate-50 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-emerald-600">
          {format(new Date(reception.operation_date), "MMM dd, yyyy")}
        </span>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            className="rounded-full hover:bg-blue-100 hover:text-blue-600"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="rounded-full hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-700">
        <p>
          <span className="font-medium">Factory:</span>{" "}
          {getFactoryName(Number(reception.factory_id), factories)}
        </p>
        <p>
          <span className="font-medium">Grade:</span>{" "}
          {getGradeName(Number(reception.field_grade_id), products)}
        </p>
        <p>
          <span className="font-medium">Supply Unit:</span>{" "}
          {getSupplyUnitName(reception.supply_unit_id, supplyUnits)}
        </p>
        <p className="font-semibold text-emerald-700">
          Quantity: {reception.qty_crop?.toFixed(2)} tons
        </p>
      </div>
    </Card>
  );
}
