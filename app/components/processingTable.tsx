"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Factory,
  FactorySupply,
  Processing,
  Reception,
  StockProductType,
} from "@/lib/types";
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
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  formatPeriod,
  getFactoryName,
  getGradeName,
} from "@/lib/HelperFunctions";
import {
  createProcessing,
  deleteProcessing,
  updateProcessing,
} from "../actions/processingActions";
import ProcessingFormModal from "./processingFormModal";
import Pagination from "./pagination";
import { getReceptionSummary } from "../actions/reception";

export default function ProcessingTable({
  processing,
  factoryId,
  factories,
  products,
  initialPeriod,
  initialData,
  userId,
  isSummary,
}: {
  processing: Processing[];
  factoryId: string;
  factories: Factory[];
  products: StockProductType[];
  initialPeriod: "day" | "week" | "month" | "year";
  initialData: any[]; //any because the table can carry any type of data since its dynamic.
  userId: string;
  isSummary: boolean;
}) {
  const [editingProcessing, setEditingProcessing] = useState<Processing | null>(
    null,
  );
  const [showProcessingModal, setShowProcessingModal] = useState<boolean>();
  const [filterFactory, setFilterFactory] = useState("All");
  const [deleteId, setDeleteId] = useState<string | null>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [period, setPeriod] = useState(initialPeriod);
  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  //close modal
  const handleCloseForm = () => {
    setShowProcessingModal(false);
    setEditingProcessing(null);
  };

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
        const newProcessing = await createProcessing(
          payload,
          userId,
          factoryId,
        );

        if (newProcessing) {
          setData([...data, newProcessing]);
        }
        break;
      }

      case "update": {
        if (!id) return;
        const updatedProcessing = await updateProcessing(id, payload);
        if (updatedProcessing) {
          setData(
            data.map((rec) =>
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
          setData(data.filter((rec) => rec.id !== id));
        }
        break;
      }
    }
  }

  //compute summary total at the end of the table.
  const totalQuantity = isSummary
    ? data.reduce((sum, row: any) => sum + Number(row.total_quantity || 0), 0)
    : data.reduce(
        (sum, processing: Processing) => sum + Number(processing.qty_proc || 0),
        0,
      );

  //handling table data
  const filterteredProcessing =
    filterFactory === "All"
      ? data
      : data.filter((r) => String(r.factory_id) === filterFactory);

  //implementing pagination parameters
  const totalPages = Math.ceil(filterteredProcessing.length / itemsPerPage);
  const paginatedProcessing = filterteredProcessing.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Rubber Processing
          </h1>
          <p className="text-slate-600 mt-1">
            Track processing of Rubber in all industrial units.
          </p>
        </div>
      </div>

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
                await handleReception("update", formData, editingProcessing.id);
              } else {
                await handleReception("create", formData);
              }
              setShowProcessingModal(false);
              setEditingProcessing(null);
            }}
            factoryGrades={products}
            factoryId={factoryId}
            userId={userId}
          />
        </DialogContent>
      </Dialog>

      {/* Filter */}
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

      <Card className="glass-effect border-none shadow-lg overflow-hidden pl-4">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col md:flex-row justify-between">
            <CardTitle className="text-2xl font-bold">
              Processing Records
            </CardTitle>
            <div>
              {!isSummary && (
                <Button
                  onClick={() => setShowProcessingModal(true)}
                  className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Processing
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
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
                      <TableHead key="qty" className="text-right">
                        Quantity (tons)
                      </TableHead>,
                      <TableHead key="actions">Actions</TableHead>,
                    ]}
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
              ) : paginatedProcessing.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isSummary ? 4 : 6}
                    className="text-center py-8 text-slate-500"
                  >
                    No records found
                  </TableCell>
                </TableRow>
              ) : isSummary ? (
                paginatedProcessing.map((row: any) => (
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
                      {getFactoryName(String(processing.factory_id), factories)}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        {getGradeName(Number(processing.process_grade_id), products)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-semibold">
                      {processing.qty_proc?.toFixed(2)}
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

            {/* table footer */}
            <tfoot>
              <TableRow className="bg-slate-100 font-semibold">
                {isSummary
                  ? [
                      <TableCell
                        key="label"
                        colSpan={3}
                        className="text-center font-bold text-lg"
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
                        colSpan={3}
                        className="text-center font-bold text-lg"
                      >
                        Total
                      </TableCell>,
                      <TableCell key="value" className="text-right">
                        {totalQuantity.toFixed(2)}
                      </TableCell>,
                      <TableCell key="spacer" />,
                    ]}
              </TableRow>
            </tfoot>
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
    </div>
  );
}
