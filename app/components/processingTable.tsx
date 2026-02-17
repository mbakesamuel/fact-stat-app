"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Factory, Processing, ProductType } from "@/lib/types";
import { useState } from "react";
import { FactoryFilter } from "./factoryFilter";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { getFactoryName, getGradeName } from "@/lib/HelperFunctions";
import {
  createProcessing,
  deleteProcessing,
  updateProcessing,
} from "../actions/processingActions";
import ProcessingFormModal from "./processingFormModal";
import Pagination from "./pagination";
import { useAppContext } from "../context/appContext";
import { ProductFilter } from "./productFilter";

export default function ProcessingTable({
  factories,
  products,
  initialProcessing,
}: {
  factories: Factory[];
  products: ProductType[];
  initialProcessing: Processing[];
}) {
  //application context
  const { userId, factoryId, role } = useAppContext();

  //processing states
  const [processing, setProcessing] = useState(initialProcessing);
  const [editingProcessing, setEditingProcessing] = useState<Processing | null>(
    null,
  );

  //form modal state variables
  const [showProcessingModal, setShowProcessingModal] = useState<boolean>();
  const [deleteId, setDeleteId] = useState<string | null>();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [filterFactory, setFilterFactory] = useState("All");
  const [filterProduct, setFilterProduct] = useState("All");

  //pagination state variables
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  //close modal
  const handleCloseForm = () => {
    setShowProcessingModal(false);
    setEditingProcessing(null);
  };

  //handle CRUD operations
  async function handleProcessing(
    action: "create" | "update" | "delete",
    payload?: any,
    id?: string,
  ) {
    switch (action) {
      case "create": {
        const newProcessing = await createProcessing(
          payload,
          userId,
          factoryId,
        );

        if (newProcessing) {
          setProcessing([...processing, newProcessing]);
        }
        break;
      }

      case "update": {
        if (!id) return;
        const updatedProcessing = await updateProcessing(id, payload);
        if (updatedProcessing) {
          setProcessing(
            processing.map((rec) =>
              rec.id === id ? { ...rec, ...updatedProcessing } : rec,
            ),
          );
        }
        break;
      }

      case "delete": {
        if (!id) return;
        const result = await deleteProcessing(id);
        if (result?.success) {
          setProcessing(processing.filter((rec) => rec.id !== id));
        }
        break;
      }
    }
  }

  const filteredProcessing = (() => {
    if (role === "clerk" || role === "ium") {
      return filterProduct === "All"
        ? processing
        : processing.filter(
            (p) => String(p.process_grade_id) === filterProduct,
          );
    } else {
      let data = processing;
      if (filterFactory !== "All") {
        data = processing.filter((p) => p.factory_id === filterFactory);
      } else {
        if (filterProduct !== "All") {
          data = data.filter((p) => p.process_grade_id === filterProduct);
        }
      }
      return data;
    }
  })();

  //implementing pagination parameters
  const totalPages = Math.ceil(filteredProcessing.length / itemsPerPage);
  const paginatedProcessing = filteredProcessing.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  //compute summary total at the end of the table.
  const totalQuantity = paginatedProcessing.reduce(
    (sum, p) => sum + Number(p.qty_proc || 0),
    0,
  );

  //helper function to fetch the factory name from the factory id
  const getFactoryNameById = (id: number) => {
    const factory = factories.find((f) => f.id === id);
    return factory ? factory.factory_name : "Unknown Factory";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filter */}
      <Card className="glass-effect border-none shadow-lg">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-col gap-4">
              {(role == "clerk" || role === "ium") && (
                <h1 className="text-lg text-emerald-800">
                  Rubber Processing{" "}
                  <span className="font-bold text-emerald-6 text-md uppercase">
                    {getFactoryNameById(Number(factoryId))}
                  </span>
                </h1>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex">
            {role === "clerk" || role === "ium" ? (
              <span className="text-slate-800 leading-relaxed">
                Managing Crop Processing into Factory
              </span>
            ) : (
              <span className="text-slate-800 leading-relaxed">
                Monitoring Daily Processing at the different Factories
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-none shadow-lg overflow-hidden pl-4">
        <CardHeader>
          <div className="flex justify-between mb-4 sticky top-17 bg-white z-10">
            {role !== "clerk" && role !== "ium" ? (
              <div className="flex flex-row justify-between gap-2">
                <FactoryFilter
                  factories={factories}
                  value={filterFactory}
                  onChange={setFilterFactory}
                />

                <ProductFilter
                  products={products}
                  value={filterProduct}
                  onChange={setFilterProduct}
                />
              </div>
            ) : (
              <>
                <ProductFilter
                  products={products}
                  value={filterProduct}
                  onChange={setFilterProduct}
                />
              </>
            )}

            {(role === "clerk" || role === "ium") && (
              <Button
                onClick={() => setShowProcessingModal(true)}
                className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Processing
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead key="date">Date</TableHead>
                  <TableHead key="factory">Factory</TableHead>
                  <TableHead key="grade">Grade</TableHead>
                  <TableHead key="qty">Quantity (tons)</TableHead>
                  <TableHead key="actions">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!processing ? (
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
                ) : paginatedProcessing.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-8 text-slate-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProcessing.map((processing: Processing) => (
                    <TableRow
                      key={processing.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {format(
                          new Date(processing.operation_date),
                          "MMM dd, yyyy",
                        )}
                      </TableCell>
                      <TableCell>
                        {getFactoryName(
                          Number(processing.factory_id),
                          factories,
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          {getGradeName(
                            Number(processing.process_grade_id),
                            products,
                          )}
                        </span>
                      </TableCell>

                      <TableCell className="font-semibold">
                        {processing.qty_proc?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setEditingProcessing(processing);
                              setShowProcessingModal(true);
                            }}
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setDeleteId(processing.id);
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
                  <TableCell colSpan={3} className="text-center font-bold">
                    Total
                  </TableCell>
                  <TableCell className="text-left font-bold">
                    {totalQuantity.toLocaleString()}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          {/* pagination component */}
          {
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          }
        </CardContent>
      </Card>

      {/* Processing form dialog form */}
      <Dialog open={showProcessingModal} onOpenChange={setShowProcessingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProcessing ? "Edit Processing" : "New Processing"}
            </DialogTitle>
          </DialogHeader>
          <ProcessingFormModal
            processing={editingProcessing}
            onClose={handleCloseForm}
            onSubmit={async (formData) => {
              if (editingProcessing) {
                await handleProcessing(
                  "update",
                  formData,
                  editingProcessing.id,
                );
              } else {
                await handleProcessing("create", formData);
              }
              setShowProcessingModal(false);
              setEditingProcessing(null);
            }}
            products={products}
            factoryId={factoryId}
            userId={userId}
          />
        </DialogContent>
      </Dialog>

      {/* delete dialog */}
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
                  const result = await deleteProcessing(deleteId);
                  if (result?.success) {
                    setProcessing(
                      processing.filter((rec) => rec.id !== deleteId),
                    );
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
    </div>
  );
}
