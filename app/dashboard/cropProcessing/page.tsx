"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import ProcessingForm from "@/app/component/processing/processingForm";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/app/component/ui/pagination";
import {
  deleteCropProcessing,
  getCropProcessing,
} from "@/app/actions/processingActions";
import { Processing, Factory, FactorySupply } from "@/lib/types";
import { getFactory } from "@/app/actions/factoryActions";
import { getFactoryGrades } from "@/app/actions/productActions";

export default function CropProcessing() {
  const [showForm, setShowForm] = useState(false);
  const [editingProcessing, setEditingProcessing] = useState<Processing | null>(
    null
  );
  const [filterFactory, setFilterFactory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();

  const { data: processing = [], isLoading } = useQuery<Processing[]>({
    queryKey: ["cropProcessing"],
    queryFn: () => getCropProcessing(),
  });

  const { data: factories = [] } = useQuery<Factory[]>({
    queryKey: ["factories"],
    queryFn: () => getFactory(),
  });

  const { data: fieldSupplies = [] } = useQuery<FactorySupply[]>({
    queryKey: ["fieldSupplies"],
    queryFn: () => getFactoryGrades(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCropProcessing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cropProcessing"] });
    },
  });

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this processing record?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (processing: Processing) => {
    setEditingProcessing(processing);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProcessing(null);
  };

  const filteredProcessing =
    filterFactory === "all"
      ? processing
      : processing.filter((p) => p.factory_id === filterFactory);

  const totalPages = Math.ceil(filteredProcessing.length / itemsPerPage);
  const paginatedProcessing = filteredProcessing.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getFactoryName = (id: string) =>
    factories.find((f) => f.id === id)?.factory_name || "Unknown";

  const getGradeName = (id: string) =>
    fieldSupplies.find((f) => f.id === id)?.crop || "Unknown";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Crop Processing</h1>
          <p className="text-slate-600 mt-1">
            Track crop processing operations
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Processing
        </Button>
      </div>

      {showForm && (
        <ProcessingForm
          processing={editingProcessing}
          onClose={handleCloseForm}
          factories={factories}
          fieldSupplies={fieldSupplies}
        />
      )}

      {/* Filter */}
      <Card className="glass-effect border-none shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={filterFactory}
              onChange={(e) => {
                setFilterFactory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Factories</option>
              {factories.map((factory) => (
                <option key={factory.id} value={factory.id}>
                  {factory.factory_name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-effect border-none shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Processing Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Factory</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Quantity (tons)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
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
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      No processing records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProcessing.map((proc) => (
                    <TableRow
                      key={proc.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {format(new Date(proc.operation_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{getFactoryName(proc.factory_id)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {getGradeName(proc.process_grade_id)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {proc.qty_proc?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(proc)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(proc.id as string)}
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
            </Table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
