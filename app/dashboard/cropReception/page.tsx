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
import ReceptionForm from "@/app/component/reception/receptionForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteCropReception,
  getCropReception,
} from "@/app/actions/receptionActions";
import { useUser } from "@clerk/nextjs";
import { getFactory } from "@/app/actions/factoryActions";
import Pagination from "@/app/component/ui/pagination";
import { getCropSuppyUnit } from "@/app/actions/cropSupplyUnitActions";
import { getFieldGrades } from "@/app/actions/productActions";
import { Factory, FieldSupply, Reception, SupplyUnit } from "@/lib/types";

export default function CropReception() {
  const [showForm, setShowForm] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(
    null
  );
  const [filterFactory, setFilterFactory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user } = useUser();

  const factoryId = user?.publicMetadata?.factoryId as number | undefined;
  const queryClient = useQueryClient();

  const { data: receptions = [], isLoading } = useQuery<Reception[]>({
    queryKey: ["cropReceptions"],
    queryFn: () => getCropReception(),
  });

  const { data: factories = [] } = useQuery<Factory[]>({
    queryKey: ["factories"],
    queryFn: () => getFactory(),
  });

  const { data: fieldSupplies = [] } = useQuery<FieldSupply[]>({
    queryKey: ["fieldSupplies"],
    queryFn: async () => getFieldGrades(),
  });

  const { data: supplyUnits = [] } = useQuery<SupplyUnit[]>({
    queryKey: ["supplyUnits"],
    queryFn: async () => getCropSuppyUnit(),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => deleteCropReception(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cropReceptions"] });
    },
  });

  const handleDelete = (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this reception record?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (reception: Reception) => {
    setEditingReception(reception);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReception(null);
  };

  const filteredReceptions =
    filterFactory === "all"
      ? receptions
      : receptions.filter((r) => String(r.factory_id) === filterFactory);

  const totalPages = Math.ceil(filteredReceptions.length / itemsPerPage);
  const paginatedReceptions = filteredReceptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getFactoryName = (id: string) =>
    factories.find((f) => f.id === id)?.factory_name || "Unknown";

  const getGradeName = (id: string) =>
    fieldSupplies.find((f) => f.id === id)?.crop || "Unknown";

  const getSupplyUnitName = (id: string): string => {
    const unit = supplyUnits.find((u) => u.id === id);
    return unit ? unit.SupplyUnit : "Unknown";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Crop Reception</h1>
          <p className="text-slate-600 mt-1">
            Track all incoming crop deliveries
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Reception
        </Button>
      </div>

      {showForm && (
        <ReceptionForm
          reception={editingReception}
          onClose={handleCloseForm}
          factories={factories}
          fieldSupplies={fieldSupplies}
          supplyUnits={supplyUnits}
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
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          <CardTitle>Reception Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Factory</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Supply Unit</TableHead>
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
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      No reception records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReceptions.map((reception) => (
                    <TableRow
                      key={reception.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {format(
                          new Date(reception.operation_date),
                          "MMM dd, yyyy"
                        )}
                      </TableCell>
                      <TableCell>
                        {getFactoryName(reception.factory_id)}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          {getGradeName(reception.field_grade_id)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getSupplyUnitName(reception.supply_unit_id)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {reception.qty_crop?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(reception)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(reception.id)}
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
