"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShipmentLoadingDetails } from "@/lib/types";
import { useEffect, useState } from "react";
import ShipmentLoadingFormModal from "./shipmentLoadingFormModal";
import createLoading, {
  deleteLoading,
  updateLoading,
} from "../actions/loadingActions";
import { Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoadingTable({
  loadings,
  factoryId,
  contract_no,
  status,
}: {
  loadings: ShipmentLoadingDetails[];
  factoryId: number;
  contract_no?: string;
  status: { orderQty: number; loadedQty: number; balance: number } | null;
}) {
  const [editingItem, setEditingItem] = useState<Omit<
    ShipmentLoadingDetails,
    "id"
  > | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState<ShipmentLoadingDetails[]>(loadings);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);

  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setData(loadings);
  }, [loadings]);

  //computation for total quantity in the table footer
  const totalQty = loadings.reduce((sum, load) => sum + load.qty, 0);

  type SaveInput = Omit<ShipmentLoadingDetails, "id"> & { id?: number };

  const handleSave = async (formData: SaveInput) => {
    if (status && status?.balance !== null && formData.qty > status?.balance) {
      setErrorMessage(
        `Cannot save. Quantity exceeds contract balance of ${status?.balance}.`,
      );
      setIsErrorDialogOpen(true);
      return;
    }
    if (formData.id) {
      // Update existing record
      const updated = await updateLoading(formData.id, formData);
      if (updated) {
        setData((prev) =>
          prev.map((item) => (item.id === formData.id ? updated : item)),
        );
      } else {
        console.error(`Update failed: no record with id ${formData.id}`);
      }
    } else {
      // Create new record
      const created = await createLoading(formData, formData.factoryId);
      setData((prev) => [...prev, created]);
    }

    setIsDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2>Shipment Loading Details</h2>
      </div>

      <Card className="glass-effect border-none shadow-lg overflow-hidden pl-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Loading Records
          </CardTitle>
          <div className=" flex justify-end">
            <Button
              className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
              onClick={() => setIsDialogOpen(true)}
            >
              Add Loading
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract No</TableHead>
                <TableHead>Loading Date</TableHead>
                <TableHead>Departure Date</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Container No</TableHead>
                <TableHead>Seal No</TableHead>
                <TableHead>Tally No</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!data ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="text-center py-8 text-slate-500"
                    colSpan={9}
                  >
                    No Loading Details yet
                  </TableCell>
                </TableRow>
              ) : (
                data.map((load) => (
                  <TableRow key={load.id}>
                    <TableCell>{load.contractNo}</TableCell>
                    <TableCell>
                      {new Date(load.loadingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(load.departDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{load.vessel}</TableCell>
                    <TableCell>{load.containerNo}</TableCell>
                    <TableCell>{load.sealNo}</TableCell>
                    <TableCell>{load.tallyNo}</TableCell>
                    <TableCell>{load.qty.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditingItem(load);
                            setIsDialogOpen(true);
                          }}
                          size="sm"
                          variant="ghost"
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setDeleteId(load.id);
                            setConfirmOpen(true);
                          }}
                          size="sm"
                          variant="ghost"
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7} className="text-center font-bold">
                  Total
                </TableCell>
                <TableCell className="text-left font-bold">
                  {totalQty.toLocaleString()}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog form here */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Loading Details" : "Add New Loading Details"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the details of the selected loading."
                : "Fill in the details for the new loading."}
            </DialogDescription>
          </DialogHeader>
          <ShipmentLoadingFormModal
            onClose={() => {
              setIsDialogOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSave}
            initialData={editingItem}
            factoryId={factoryId}
            contract_no={contract_no}
            status={status}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this processing record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>

            <Button
              className="bg-red-600 text-white"
              disabled={!deleteId}
              onClick={async () => {
                if (deleteId) {
                  const result = await deleteLoading(deleteId);
                  if (result?.success) {
                    setData(data.filter((rec) => rec.id !== deleteId));
                  }
                }
                setConfirmOpen(false);
                setDeleteId(undefined);
              }}
            >
              {deleteId ? "Deleting" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error dialog box */}

      {/* Error Dialog */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation Error</DialogTitle>
          </DialogHeader>
          <p>{errorMessage}</p>
          <DialogFooter>
            <Button onClick={() => setIsErrorDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
