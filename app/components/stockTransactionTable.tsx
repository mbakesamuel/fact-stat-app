"use client";

import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Factory,
  FactoryStock,
  StockLevel,
  StockProductType,
  Transaction,
} from "@/lib/types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getFactoryName, getGradeName } from "@/lib/HelperFunctions";
import StockFormModal from "./stockFormModal";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../actions/stockTransactionActions";
import { FactoryFilter } from "./factoryFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Pagination from "./pagination";

export default function StockTransactionTable({
  factories,
  products,
  intitialData,
  factoryId,
  userId,
  role,
  latestTransDate,
}: {
  factories: Factory[];
  products: StockProductType[];
  intitialData: Transaction[];
  factoryId: string;
  userId: string;
  role: string;
  latestTransDate: string | null;
}) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [scope, setScope] = useState<"factory" | "All">("factory");

  const [data, setData] = useState<Transaction[]>(intitialData);
  const [filterFactory, setFilterFactory] = useState("All");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>();
  const [filterType, setFilterType] = useState<string | number>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const levels: Record<string, StockLevel> = {};
    data.forEach((t) => {
      const key = `${t.factory_id}-${t.product_id}-${t.stock_type}`;
      if (!levels[key]) {
        levels[key] = {
          factory_id: t.factory_id,
          grade_id: t.product_id,
          stock_type: t.stock_type,
          quantity: 0,
        };
      }
      const qty = parseFloat(String(t.qty)) || 0;
      levels[key].quantity += t.trans_mode === "IN" ? qty : -qty;
    });

    setStockLevels(Object.values(levels));
  }, [data]);

  useEffect(() => {
    if (role === "clerk" || role === "ium") {
      setFilterFactory(factoryId);
    }
  }, [role, factoryId]);

  const handleCloseForm = () => {
    setShowFormModal(false);
    setEditingTransaction(null);
  };

  //handle transactions
  async function handleTransaction(
    action: "create" | "update" | "delete",
    payload?: any,
    id?: string,
  ) {
    try {
      switch (action) {
        case "create": {
          const returned = await createTransaction(payload, factoryId, userId);
          console.log("createTransaction returned:", returned);
          if (!returned) break;

          const normalized: Transaction = {
            id: String(returned.id ?? returned.id ?? Date.now()),
            factory_id: String(
              returned.factory_id ??
                returned.factory_id ??
                factoryId ??
                payload.factory_id ??
                "",
            ),
            product_id: String(
              returned.product_id ??
                returned.product_id ??
                payload.product_id ??
                "",
            ),
            trans_date:
              returned.trans_date ??
              returned.trans_date ??
              payload.trans_date ??
              new Date().toISOString(),
            trans_mode:
              returned.trans_mode ??
              returned.trans_mode ??
              payload.trans_mode ??
              "IN",
            stock_type:
              returned.stock_type ??
              returned.stock_type ??
              payload.stock_type ??
              "UNPROCESSED",
            qty: Number(returned.qty ?? returned.qty ?? payload.qty ?? 0),
            transaction_desc:
              returned.transaction_desc ??
              returned.transaction_desc ??
              payload.transaction_desc ??
              "",
            /* createdAt: returned.createdAt ?? new Date().toISOString(),
          updatedAt: returned.updatedAt ?? new Date().toISOString(), */
          };

          setData((prev) => {
            const next = [...prev, normalized];
            // move to last page so user sees the new row
            setCurrentPage(Math.max(1, Math.ceil(next.length / itemsPerPage)));
            return next;
          });

          break;
        }

        case "update": {
          if (!id) return;
          const returned = await updateTransaction(id, payload);
          console.log("updateTransaction returned:", returned);
          if (!returned) break;

          setData((prev) =>
            prev.map((txn) =>
              String(txn.id) === String(id)
                ? {
                    ...txn,
                    ...returned,
                    // normalize common fields
                    id: String(returned.id ?? txn.id),
                    factory_id: String(returned.factory_id ?? txn.factory_id),
                    product_id: String(returned.product_id ?? txn.product_id),
                    qty: Number(returned.qty ?? payload?.qty ?? txn.qty),
                    trans_date:
                      returned.trans_date ??
                      returned.trans_date ??
                      txn.trans_date,
                    trans_mode:
                      returned.trans_mode ??
                      returned.trans_mode ??
                      txn.trans_mode,
                    stock_type:
                      returned.stock_type ??
                      returned.stock_type ??
                      txn.stock_type,
                    transaction_desc:
                      returned.transaction_desc ??
                      returned.transaction_desc ??
                      payload?.transaction_desc ??
                      txn.transaction_desc,
                    /*  updatedAt: returned. ?? new Date().toISOString(), */
                  }
                : txn,
            ),
          );

          break;
        }

        case "delete": {
          if (!id) return;
          const result = await deleteTransaction(id);
          console.log("deleteTransaction returned:", result);
          if (result?.success) {
            setData((prev) => {
              const next = prev.filter((txn) => String(txn.id) !== String(id));
              // adjust current page if we removed the last item on the last page
              const maxPage = Math.max(
                1,
                Math.ceil(next.length / itemsPerPage),
              );
              setCurrentPage((cur) => Math.min(cur, maxPage));
              return next;
            });
          }
          break;
        }
      }
    } catch (err) {
      console.error("handleTransaction error:", err);
    }
  }

  const filteredTransactions = data.filter((t) => {
    const factoryMatch =
      filterFactory === "All" || Number(t.factory_id) === Number(filterFactory);

    const typeMatch =
      filterType === "All" || Number(t.product_id) === Number(filterType);
    return factoryMatch && typeMatch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  //function aggregating the stock balances by grades.
  function aggregateByFactory(
    stockLevels: StockLevel[],
    products: { id: number | string; crop: string }[],
    role: string,
    factoryId?: string,
  ): {
    byFactory: Record<
      string,
      FactoryStock & { totalUnprocessed: number; totalProcessed: number }
    >;
    overall?: FactoryStock & {
      totalUnprocessed: number;
      totalProcessed: number;
    };
  } {
    const idToCrop: Record<string, string> = products.reduce(
      (acc, p) => {
        acc[String(p.id)] = String(p.crop).trim().toLowerCase();
        return acc;
      },
      {} as Record<string, string>,
    );

    const result: Record<
      string,
      FactoryStock & { totalUnprocessed: number; totalProcessed: number }
    > = {};

    const ensureFactory = (factoryKey: string) => {
      if (!result[factoryKey]) {
        result[factoryKey] = {
          up: { latex: 0, cuplump: 0, scrap: 0 },
          p: { rss: 0, "cnr 3l": 0, "cnr 10": 0 },
          totalUnprocessed: 0,
          totalProcessed: 0,
        };
      }
      return result[factoryKey];
    };

    const overall: FactoryStock & {
      totalUnprocessed: number;
      totalProcessed: number;
    } = {
      up: { latex: 0, cuplump: 0, scrap: 0 },
      p: { rss: 0, "cnr 3l": 0, "cnr 10": 0 },
      totalUnprocessed: 0,
      totalProcessed: 0,
    };

    for (const s of stockLevels) {
      const factoryKey = String(s.factory_id);
      const crop = idToCrop[String(s.grade_id)] || "";
      const qty = Number(s.quantity) || 0;
      const stockType = String(s.stock_type || "")
        .trim()
        .toUpperCase();

      const factory = ensureFactory(factoryKey);

      if (stockType === "UNPROCESSED") {
        if (crop === "latex") {
          factory.up.latex += qty;
          overall.up.latex += qty;
        } else if (crop === "cuplump") {
          factory.up.cuplump += qty;
          overall.up.cuplump += qty;
        } else if (crop === "scrap") {
          factory.up.scrap += qty;
          overall.up.scrap += qty;
        }
        factory.totalUnprocessed += qty;
        overall.totalUnprocessed += qty;
      } else if (stockType === "PROCESSED") {
        if (crop === "rss") {
          factory.p.rss += qty;
          overall.p.rss += qty;
        } else if (crop === "cnr 3l") {
          factory.p["cnr 3l"] += qty;
          overall.p["cnr 3l"] += qty;
        } else if (crop === "cnr 10") {
          factory.p["cnr 10"] += qty;
          overall.p["cnr 10"] += qty;
        }
        factory.totalProcessed += qty;
        overall.totalProcessed += qty;
      }
    }

    if (role === "clerk" || role === "ium") {
      if (factoryId) {
        const key = String(factoryId);

        return {
          byFactory: { [key]: result[key] ?? ensureFactory(key) },
        };
      }

      return { byFactory: result };
    } else {
      return { byFactory: result, overall };
    }
  }

  const { byFactory, overall } = aggregateByFactory(
    stockLevels,
    products,
    role,
    factoryId,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Stock Management
          </h1>
          <p className="text-slate-600 mt-1">
            Track rubber inventory transactions
          </p>
        </div>
        {/* only render when role is either clerk or ium */}
        {(role === "clerk" || role === "ium") && (
          <Button
            onClick={() => setShowFormModal(true)}
            /*  className="bg-linear-to-r from-amber-500 to amber-600 hover:from-amber-600 hover:tto-amber-700 shadow-lg shadow-amber-500/30" */
            className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        )}
      </div>

      {/* Dialog form */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Transaction</DialogTitle>
          </DialogHeader>
          <StockFormModal
            transaction={editingTransaction}
            products={products}
            onClose={handleCloseForm}
            onSubmit={async (formData: any) => {
              if (editingTransaction) {
                await handleTransaction(
                  "update",
                  formData,
                  editingTransaction.id,
                );
              } else {
                await handleTransaction("create", formData);
              }
              setShowFormModal(false);
              setEditingTransaction(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* summary cards */}
      <Card className="flex flex-col justify-center p-4 sticky top-4 z-30 self-start">
        <h1>{`Current Stock Balances as at ${latestTransDate}`}</h1>
        {role !== "clerk" && role !== "ium" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unprocessed Stocks */}
            <Card className="glass-effect border-none shadow-lg">
              <CardContent className="p-6">
                <p className="text-xl font-bold text-slate-900">
                  All factories - Unprocessed Stocks
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="flex flex-col md:flex-row justify-between gap-8">
                        <p className="text-xl font-bold">
                          Latex:{" "}
                          <span className="text-2xl font-bold text-emerald-600">
                            {(overall?.up.latex ?? 0).toLocaleString()}
                          </span>{" "}
                        </p>
                        <p className="text-xl font-bold">
                          Cuplump:{" "}
                          <span className="text-2xl fond-bold text-emerald-600">
                            {(overall?.up.cuplump ?? 0).toLocaleString()}
                          </span>
                        </p>
                        <p className="text-xl font-bold">
                          Scrap:
                          <span>
                            {(overall?.up.scrap ?? 0).toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p>
                          Total:{" "}
                          {(overall?.totalUnprocessed ?? 0).toLocaleString()}{" "}
                          tons
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processed Stocks */}
            <Card className="glass-effect border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center justify-center">
                      <p className="text-xl font-bold text-slate-900">
                        All Factories - Processed Stocks
                      </p>
                    </div>
                    <p>RSS: {(overall?.p.rss ?? 0).toLocaleString()}</p>
                    <p>
                      CNR 3L: {(overall?.p["cnr 3l"] ?? 0).toLocaleString()}
                    </p>
                    <p>
                      CNR 10: {(overall?.p["cnr 10"] ?? 0).toLocaleString()}
                    </p>
                    <p>
                      Total: {(overall?.totalProcessed ?? 0).toLocaleString()}
                      tons
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unprocessed Stocks */}
            <Card className="glass-effect border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center justify-center">
                      <p className="text-xl font-bold text-slate-900">
                        Stocks By Grade
                      </p>
                    </div>
                    <p>Latex: {byFactory?.[factoryId].up?.latex}</p>
                    <p>
                      Cuplump:{" "}
                      {(
                        byFactory?.[filterFactory]?.up?.cuplump ?? 0
                      ).toLocaleString()}
                    </p>
                    <p>
                      Scrap:{" "}
                      {(
                        byFactory?.[filterFactory]?.up?.scrap ?? 0
                      ).toLocaleString()}
                    </p>
                    <p>
                      Total:{" "}
                      {(
                        byFactory?.[filterFactory]?.totalUnprocessed ?? 0
                      ).toLocaleString()}{" "}
                      tons
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processed Stocks */}
            <Card className="glass-effect border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center justify-center">
                      <p className="text-xl font-bold text-slate-900">
                        Stocks By Grade
                      </p>
                    </div>
                    <p>
                      RSS:{" "}
                      {(byFactory?.[factoryId]?.p?.rss ?? 0).toLocaleString()}
                    </p>
                    <p>
                      CNR 3L:
                      {(
                        byFactory?.[factoryId]?.p?.["cnr 3l"] ?? 0
                      ).toLocaleString()}
                    </p>
                    <p>
                      CNR 10:
                      {(
                        byFactory?.[factoryId]?.p?.["cnr 10"] ?? 0
                      ).toLocaleString()}
                    </p>
                    <p>
                      Total:
                      {(
                        byFactory?.[factoryId]?.totalProcessed ?? 0
                      ).toLocaleString()}
                      tons
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>

      {/* filter : will not be needed by userRole: clerk and iu : who a factory limited.*/}
      {role !== "clerk" && role !== "ium" && (
        <FactoryFilter
          factories={factories}
          value={filterFactory} /* filterFactory state */
          onChange={setFilterFactory}
        />
      )}

      {/* transactions history table */}
      <Card className="glass-effect border-none shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="py-1">
          {/* product filter */}
          <div className="overflow-x-auto">
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value === "All" ? "All" : Number(e.target.value),
                )
              }
              className="border rounded px-2 py-1 mb-4 ml-2"
            >
              <option value="All">All</option>
              {products?.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.crop}
                </option>
              ))}
            </select>
            {/* transaction History Table */}
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Factory</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Description</TableHead>
                  {(role === "clerk" || role === "ium") && (
                    <TableHead>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {!paginatedTransactions ? (
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-slate-500"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((trans) => (
                    <TableRow
                      key={trans.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {trans.trans_date
                          ? format(new Date(trans.trans_date), "MMM dd, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {getFactoryName(Number(trans.factory_id), factories)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trans.stock_type === "UNPROCESSED"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {trans.stock_type === "UNPROCESSED"
                            ? "Unprocessed"
                            : "Processed"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                          {getGradeName(Number(trans.product_id), products)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            trans.trans_mode === "IN"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {trans.trans_mode === "IN" ? (
                            <>
                              <ArrowDownCircle className="w-3 h-3" /> In
                            </>
                          ) : (
                            <>
                              <ArrowUpCircle className="w-3 h-3" /> Out
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {Number(trans.qty).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                        {trans.transaction_desc || "-"}
                      </TableCell>
                      <TableCell>
                        {(role === "clerk" || role === "ium") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeleteId(trans.id);
                              setConfirmOpen(true);
                            }}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination component */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
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
                  const result = await deleteTransaction(deleteId);
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
    </div>
  );
}
