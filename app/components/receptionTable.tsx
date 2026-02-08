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
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Filter, Pencil, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

import {
  Factory,
  FieldSupply,
  Reception,
  StockProductType,
  SupplyUnit,
} from "@/lib/types";
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
  formatPeriod,
  getFactoryName,
  getGradeName,
  getSupplyUnitName,
} from "@/lib/HelperFunctions";
import ReceptionCard from "./receptionCard";

export default function ReceptionTable({
  role,
  userId,
  factoryId,
  initialData,
  isSummary,
  initialPeriod,
  receptions,
  factories,
  products,
  supplyUnits,
}: {
  role: string;
  userId: string;
  factoryId: string;
  initialData: any[]; //any because it can daily, weekly, monthly or yearly data with different format.
  isSummary: boolean;
  initialPeriod: "day" | "week" | "month" | "year";
  receptions: Reception[];
  factories: Factory[];
  products: StockProductType[];
  supplyUnits: SupplyUnit[];
}) {
  const [data, setData] = useState(initialData);
  const [period, setPeriod] = useState(initialPeriod);
  const [editingReception, setEditingReception] = useState<Reception | null>(
    null,
  );
  const [showModalForm, setShowModalForm] = useState(false);

  //delete modal states
  const [deleteId, setDeleteId] = useState<string | undefined>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filterFactory, setFilterFactory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalQuantity = isSummary
    ? data.reduce((sum, row: any) => sum + Number(row.total_quantity || 0), 0)
    : data.reduce(
        (sum, reception: any) => sum + Number(reception.qty_crop || 0),
        0,
      );

  async function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newPeriod = e.target.value as "day" | "week" | "month" | "year";
    setPeriod(newPeriod);
    const updated = await getReceptionSummary(newPeriod, factoryId);
    setData(updated);
  }

  async function handleReception(
    action: "create" | "update" | "delete",
    payload?: any,
    id?: string,
  ) {
    switch (action) {
      case "create": {
        const newReception = await createReception(payload, factoryId, userId);

        if (newReception) {
          setData([...data, newReception]);
        }
        break;
      }

      case "update": {
        if (!id) return;
        const updatedReception = await updateReception(id, payload);
        if (updatedReception) {
          setData(
            data.map((rec) =>
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
          setData(data.filter((rec) => rec.id !== id));
        }
        break;
      }
    }
  }

  //handling closing of the modal form: - we could still pass incline but better here to make it simple and clean
  const handleCloseForm = () => {
    setShowModalForm(false);
    setEditingReception(null);
  };

  const filterteredReception =
    filterFactory === "All" //filterFactory is the state which initially is equall to : All --No factory is selected show return all receptions
      ? data
      : data.filter((r) => String(r.factory_id) === filterFactory);

  //implementing pagination parameters
  const totalPages = Math.ceil(filterteredReception.length / itemsPerPage);
  const paginatedReceptions = filterteredReception.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  //helper function to fetch the factory name from the factory id
  const getFactoryNameById = (id: number) => {
    const factory = factories.find((f) => f.id === id);
    return factory ? factory.factory_name : "Unknown Factory";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filter */}
      {role !== "clerk" && role !== "ium" && (
        <Card className="glass-effect border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between">
              <FactoryFilter
                factories={factories}
                value={filterFactory}
                onChange={setFilterFactory}
              />
              <div>
                {isSummary && (
                  <select
                    value={period}
                    onChange={handlePeriodChange}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* table */}
      <Card className="glass-effect border-none shadow-lg overflow-hidden p-2">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className=" flex-col items-center gap-2">
            <div className="flex flex-col gap-4">
              <h1>
                <span className="font-bold text-emerald-600 text-2xl uppercase">{`${getFactoryNameById(Number(factoryId))}`}</span>
              </h1>
              <div className="flex">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                <span className="text-slate-800">
                  Managing Crop Deliveries into Factory
                </span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex md:justify-end mb-4">
            {(role === "clerk" || role === "ium") && (
              <Button
                onClick={() => setShowModalForm(true)}
                className="w-full md:w-auto bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Reception
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="space-y-4 md:hidden">
              {paginatedReceptions.map((reception) => (
                <ReceptionCard
                  key={reception.id}
                  reception={reception}
                  onEdit={() => {
                    setEditingReception(reception);
                    setShowModalForm(true);
                  } }
                  onDelete={() => {
                    setDeleteId(reception.id);
                    setConfirmOpen(true);
                  } } factories={factories} products={products} supplyUnits={supplyUnits}                />
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
               <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  {isSummary
                    ? [
                        <TableHead key="period">Period</TableHead>,
                        <TableHead key="factory">Factory</TableHead>,
                        <TableHead key="grade">Grade</TableHead>,
                        <TableHead key="qty" className="text-right">
                          Total Quantity (tons)
                        </TableHead>,
                      ]
                    : [
                        <TableHead key="date">Date</TableHead>,
                        <TableHead key="factory">Factory</TableHead>,
                        <TableHead key="grade">Grade</TableHead>,
                        <TableHead key="supply">Supply Unit</TableHead>,
                        <TableHead key="qty" className="text-right">
                          Quantity (tons)
                        </TableHead>,
                        <TableHead key="actions">Actions</TableHead>,
                      ]}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* here were displaying a loading state to keep ui busy */}
                {!receptions ? (
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
                    <TableCell
                      colSpan={isSummary ? 4 : 6}
                      className="text-center py-8 text-slate-500"
                    >
                      No records found
                    </TableCell>
                  </TableRow>
                ) : isSummary ? (
                  paginatedReceptions.map((row: any) => (
                    <TableRow
                      key={`${row.factory_id}-${row.field_grade_id}-${row.period}`}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell>{formatPeriod(row.period, period)}</TableCell>
                      <TableCell className="font-medium">
                        {row.factory_name}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          {row.field_grade_name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {Number(row.total_quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
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
                          reception.supply_unit_id,
                          supplyUnits,
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {reception.qty_crop?.toFixed(2)}
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

              {/* table footer */}
              <tfoot>
                <TableRow className="bg-slate-100 font-semibold">
                  {isSummary
                    ? [
                        <TableCell
                          key="label"
                          colSpan={3}
                          className="text-right font-bold text-lg"
                        >
                          Total
                        </TableCell>,
                        <TableCell key="value" className="text-right">
                          {totalQuantity.toFixed(2)}
                        </TableCell>,
                      ]
                    : [
                        <TableCell
                          key="label"
                          colSpan={4}
                          className="text-right font-bold text-lg"
                        >
                          Total
                        </TableCell>,
                        <TableCell key="value" className="text-right text-lg">
                          {totalQuantity.toFixed(2)}
                        </TableCell>,
                        <TableCell key="spacer" />,
                      ]}
                </TableRow>
              </tfoot>
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
                    setData(data.filter((rec) => rec.id !== deleteId));
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

      {/* Reception Modal Form */}
      <Dialog open={showModalForm} onOpenChange={setShowModalForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
