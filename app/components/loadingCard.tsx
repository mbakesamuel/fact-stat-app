/* import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShipmentLoadingDetails } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

 export default function LoadingCard({
  load,
  onEdit,
  onDelete,
}: {
  load: ShipmentLoadingDetails;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4 shadow-md border rounded-lg space-y-2">
      <p>
        <span className="font-semibold">Contract No:</span> {load.contractNo}
      </p>
      <p>
        <span className="font-semibold">Loading Date:</span>{" "}
        {new Date(load.loadingDate).toLocaleDateString()}
      </p>
      <p>
        <span className="font-semibold">Departure Date:</span>{" "}
        {new Date(load.departDate).toLocaleDateString()}
      </p>
      <p>
        <span className="font-semibold">Vessel:</span> {load.vessel}
      </p>
      <p>
        <span className="font-semibold">Container No:</span> {load.containerNo}
      </p>
      <p>
        <span className="font-semibold">Seal No:</span> {load.sealNo}
      </p>
      <p>
        <span className="font-semibold">Tally No:</span> {load.tallyNo}
      </p>
      <p>
        <span className="font-semibold">Quantity:</span>{" "}
        {load.qty.toLocaleString()}
      </p>
      <div className="flex gap-2 mt-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShipmentLoadingDetails } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

export default function LoadingCard({
  load,
  onEdit,
  onDelete,
}: {
  load: ShipmentLoadingDetails;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-5 rounded-xl shadow-md bg-linear-to-br from-white to-slate-50 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-emerald-600">
          Contract #{load.contractNo}
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

      {/* Content */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm text-slate-700">
        <p>
          <span className="font-medium">Loading Date:</span>{" "}
          {new Date(load.loadingDate).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium">Departure Date:</span>{" "}
          {new Date(load.departDate).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium">Vessel:</span> {load.vessel}
        </p>
        <p>
          <span className="font-medium">Container No:</span> {load.containerNo}
        </p>
        <p>
          <span className="font-medium">Seal No:</span> {load.sealNo}
        </p>
        <p>
          <span className="font-medium">Tally No:</span> {load.tallyNo}
        </p>
        <p className="sm:col-span-2 font-semibold text-emerald-700">
          Quantity: {load.qty.toLocaleString()} Kgs
        </p>
      </div>
    </Card>
  );
}
