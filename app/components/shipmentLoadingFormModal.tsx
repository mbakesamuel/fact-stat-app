"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShipmentLoadingDetails } from "@/lib/types";
import { useState } from "react";

export default function ShipmentLoadingFormModal({
  onClose,
  onSave,
  initialData,
  factoryId,
  contract_no,
  status,
}: {
  onClose: () => void;
  onSave: (data: Omit<ShipmentLoadingDetails, "id">) => void;
  initialData: Omit<ShipmentLoadingDetails, "id"> | null;
  factoryId: number;
  contract_no?: string;
  status: { orderQty: number; loadedQty: number; balance: number } | null;
}) {
  //const [balance, setBalance] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<ShipmentLoadingDetails, "id">>({
    contractNo: initialData?.contractNo || contract_no || "",
    factoryId: initialData?.factoryId || factoryId,
    loadingDate: initialData?.loadingDate || new Date(),
    departDate: initialData?.departDate || new Date(),
    vessel: initialData?.vessel || "",
    containerNo: initialData?.containerNo || "",
    sealNo: initialData?.sealNo || "",
    tallyNo: initialData?.tallyNo || "",
    qty: initialData?.qty || 0,
  });

  //handling input changes for all fields in a generic way
  function handleChange<K extends keyof Omit<ShipmentLoadingDetails, "id">>(
    field: K,
    value: Omit<ShipmentLoadingDetails, "id">[K],
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contract_no">Contract No</Label>
          <Input
            id="contract_no"
            value={formData.contractNo || contract_no || ""}
            onChange={(e) => handleChange("contractNo", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loading_date">Loading Date</Label>
          <Input
            id="loading_date"
            type="date"
            value={formData.loadingDate.toISOString().split("T")[0]}
            onChange={(e) =>
              handleChange("loadingDate", new Date(e.target.value))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depart_date">Departure Date</Label>
          <Input
            id="depart_date"
            type="date"
            value={formData.departDate.toISOString().split("T")[0]}
            onChange={(e) =>
              handleChange("departDate", new Date(e.target.value))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vessel">Vessel</Label>
          <Input
            id="vessel"
            value={formData.vessel}
            onChange={(e) => handleChange("vessel", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="container_no">Container No</Label>
          <Input
            id="container_no"
            value={formData.containerNo}
            onChange={(e) => handleChange("containerNo", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seal_no">Seal No</Label>
          <Input
            id="seal_no"
            value={formData.sealNo}
            onChange={(e) => handleChange("sealNo", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tally_no">Tally No</Label>
          <Input
            id="tally_no"
            value={formData.tallyNo}
            onChange={(e) => handleChange("tallyNo", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">Quantity</Label>
          <Input
            id="qty"
            type="number"
            value={formData.qty}
            onChange={(e) => handleChange("qty", parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      <div className="space-y-2 flex flex-row justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </div>
    </form>
  );
}
