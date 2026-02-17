"use client";

import { useState } from "react";
import {
  getReceptionSummary,
  createReception,
  updateReception,
  deleteReception,
} from "@/app/actions/reception";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Factory, Reception, ProductType, SupplyUnit } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "./pagination";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import ReceptionFormModal from "./receptionFormModal";
import { FactoryFilter } from "./factoryFilter";
import {
  getFactoryName,
  getGradeName,
  getSupplyUnitName,
} from "@/lib/HelperFunctions";
import ReceptionCard from "./receptionCard";
import { ProductFilter } from "./productFilter";
import { useAppContext } from "../context/appContext";

export default function ReceptionTable({
  initialReception,
  factories,
  products,
  supplyUnits,
}: {
  initialReception: Reception[];
  factories: Factory[];
  products: ProductType[];
  supplyUnits: SupplyUnit[];
}) {
  const { userId, factoryId, role } = useAppContext();

  const [reception, setReception] = useState(initialReception);
  const [editingReception, setEditingReception] = useState<Reception | null>(
    null,
  );
  const [showModalForm, setShowModalForm] = useState(false);

  //delete modal states
  const [deleteId, setDeleteId] = useState<string | undefined>();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  //manage filtering state by grade
  const [filterProduct, setFilterProduct] = useState("All");
  const [filterFactory, setFilterFactory] = useState("All");

  //managing crud operations
  async function handleReception(
    action: "create" | "update" | "delete",
    payload?: any,
    id?: string,
  ) {
    switch (action) {
      case "create": {
        const newReception = await createReception(payload, factoryId, userId);

        if (newReception) {
          setReception([...reception, newReception]);
        }
        break;
      }

      case "update": {
        if (!id) return;
        const updatedReception = await updateReception(id, payload);
        if (updatedReception) {
          setReception(
            reception.map((rec) =>
              rec.id === id ? { ...rec, ...updatedReception } : rec,
            ),
          );
        }
        break;
      }

      case "delete": {
        if (!id) return;
        const result = await deleteReception(id);
        if (result?.success) {
          setReception(reception.filter((rec) => rec.id !== id));
        }
        break;
      }
    }
  }

  //function to close modal:-set state to false and set the editing state to null so it is empty.
  const handleCloseForm = () => {
    setShowModalForm(false);
    setEditingReception(null);
  };

  //role based filtering:- filter depending on the role
  const filteredReception = (() => {
    if (role === "clerk" || role === "ium") {
      // Clerks & IUM → filter only by product
      return filterProduct === "All"
        ? reception
        : reception.filter((r) => String(r.field_grade_id) === filterProduct);
    } else {
      // Other roles → filter by both factory and product
      let data = reception;

      /* notice the trick: intitially data=reception. We filter data by factory the result by grade */
      if (filterFactory !== "All") {
        data = data.filter((r) => String(r.factory_id) === filterFactory);
      }

      if (filterProduct !== "All") {
        data = data.filter((r) => String(r.field_grade_id) === filterProduct);
      }

      return data; //note that the result is still equal to reception.
    }
  })();

  //implementing pagination parameters
  const totalPages = Math.ceil(filteredReception.length / itemsPerPage);
  const paginatedReceptions = filteredReception.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  //helper function to fetch the factory name from the factory id
  const getFactoryNameById = (id: number) => {
    const factory = factories.find((f) => f.id === id);
    return factory ? factory.factory_name : "Unknown Factory";
  };

  const totalQuantity = paginatedReceptions.reduce(
    (sum, reception: any) => sum + Number(reception.qty_crop || 0),
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className=" flex-col items-center gap-2">
            <div className="flex flex-col gap-4">
              {(role == "clerk" || role === "ium") && (
                <h1>
                  <span className="font-bold text-emerald-600 text-2xl uppercase">
                    {getFactoryNameById(Number(factoryId))}
                  </span>
                </h1>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex">
            {role === "clerk" || role === "ium" ? (
              <span className="text-slate-800 leading-relaxed">
                Managing Crop Deliveries into Factory
              </span>
            ) : (
              <span className="text-slate-800 leading-relaxed">
                Viewing Crop Recieved at the different Factories
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* table */}
      <Card className="glass-effect border-none shadow-lg overflow-hidden pl-4">
        <CardHeader>
          <div className="flex justify-between mb-4 sticky top-17 bg-white z-10">
            {/* Filter */}
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
                onClick={() => setShowModalForm(true)}
                className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Reception
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* handling table display */}
          <div className="overflow-x-auto">
            <div className="space-y-4 md:hidden">
              {paginatedReceptions.map((reception) => (
                <ReceptionCard
                  key={reception.id}
                  reception={reception}
                  onEdit={() => {
                    setEditingReception(reception);
                    setShowModalForm(true);
                  }}
                  onDelete={() => {
                    setDeleteId(reception.id);
                    setConfirmOpen(true);
                  }}
                  factories={factories}
                  products={products}
                  supplyUnits={supplyUnits}
                />
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead key="date">Date</TableHead>
                    <TableHead key="factory">Factory</TableHead>
                    <TableHead key="grade">Grade</TableHead>
                    <TableHead key="supply">Supply Unit</TableHead>
                    <TableHead key="qty">Quantity (tons)</TableHead>
                    <TableHead key="actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!initialReception ? (
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
                  ) : paginatedReceptions.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center py-8 text-slate-500">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReceptions.map((reception: Reception) => (
                      <TableRow
                        key={reception.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {format(
                            new Date(reception.operation_date),
                            "MMM dd, yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          {getFactoryName(
                            Number(reception.factory_id),
                            factories,
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            {getGradeName(
                              Number(reception.field_grade_id),
                              products,
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getSupplyUnitName(
                            Number(reception.supply_unit_id),
                            supplyUnits,
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {reception.qty_crop?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setEditingReception(reception);
                                setShowModalForm(true);
                              }}
                              size="sm"
                              variant="ghost"
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setDeleteId(reception.id);
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
                    <TableCell colSpan={4} className="text-center font-bold">
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
          </div>
          {/* pagination component */}
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this reception record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white"
              onClick={async () => {
                if (deleteId) {
                  const result = await deleteReception(deleteId);
                  if (result?.success) {
                    setReception(
                      reception.filter((rec) => rec.id !== deleteId),
                    );
                  }
                }
                setConfirmOpen(false);
                setDeleteId(undefined);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reception Modal */}
      <Dialog open={showModalForm} onOpenChange={setShowModalForm}>
        <DialogContent className="md:w-auto md:h-auto md:overflow-visible w-[90vw] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReception ? "Edit Reception" : "New Reception"}
            </DialogTitle>
          </DialogHeader>
          <ReceptionFormModal
            reception={editingReception}
            onClose={handleCloseForm}
            onSubmit={async (formData) => {
              if (editingReception) {
                await handleReception("update", formData, editingReception.id);
              } else {
                await handleReception("create", formData);
              }
              setShowModalForm(false);
              setEditingReception(null);
            }}
            fieldSupplies={products}
            supplyUnits={supplyUnits}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
