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
import { Factory, ProductType, Transaction, StockType } from "@/lib/types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  getFactoryName,
  getGradeName,
  transformBalances,
} from "@/lib/HelperFunctions";
import StockFormModal from "./stockFormModal";
import {
  createTransaction,
  deleteTransaction,
  getStockBalances,
  updateTransaction,
} from "../actions/stockTransactionActions";
import { FactoryFilter } from "./factoryFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Pagination from "./pagination";
import { useAppContext } from "../context/appContext";
import { useTransition } from "react";

export default function StockTransactionTable({
  factories,
  products,
  intitialData,
}: {
  factories: Factory[];
  products: ProductType[];
  intitialData: Transaction[];
}) {
  //context provider
  const { userId, factoryId, role } = useAppContext();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [data, setData] = useState<Transaction[]>(intitialData);
  const [filterFactory, setFilterFactory] = useState("All");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>();
  const [filterType, setFilterType] = useState<string | number>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [stockDict, setStockDict] = useState<StockType>({
    unprocessed: {
      Latex: 0,
      Cuplumps: 0,
      Coagulum: 0,
      Scrap: 0,
    },
    processed: {
      RSS: 0,
      "CNR 3L": 0,
      "CNR 10": 0,
    },
  });

  const [isPending, startTransition] = useTransition();

  const fetchBalances = async function fetchBalances() {
    const data = await getStockBalances(Number(factoryId));
    const dict = transformBalances(data);
    setStockDict(dict);
  };

  useEffect(() => {
    fetchBalances();
  }, [factoryId]);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Rubber Stock Management
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

              //Refresh Balances as a transition - non urgent
              startTransition(() => {
                fetchBalances();
              });
            }}
            factoryId={factoryId}
          />
          {isPending && (
            <p className="text-sm text-gray-500">Refreshing Balances</p>
          )}
        </DialogContent>
      </Dialog>

      {/* filter : will not be needed by userRole: clerk and iu : who a factory limited.*/}
      {role !== "clerk" && role !== "ium" && (
        <FactoryFilter
          factories={factories}
          value={filterFactory} /* filterFactory state */
          onChange={setFilterFactory}
        />
      )}

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Unprocessed Stocks */}
        <Card className="border border-slate-200 shadow bg-slate-50">
          <CardContent className="p-3">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold text-slate-900 text-left">
                Unprocessed Stocks
              </p>
              <div className="flex flex-col md:flex-row space-y-1 gap-4 justify-between p-4 bg-emerald-50">
                <p className="text-lg flex justify-between gap-5">
                  <span>Latex:</span>
                  <span className="text-emerald-600 font-semibold">
                    {stockDict.unprocessed.Latex.toLocaleString()}
                  </span>
                </p>
                <p className="text-lg flex justify-between gap-5">
                  <span>Cuplumps:</span>
                  <span className="text-emerald-600 font-semibold">
                    {stockDict.unprocessed.Cuplumps.toLocaleString()}
                  </span>
                </p>
                <p className="text-lg flex justify-between gap-5">
                  <span>Coagulum:</span>
                  <span className="text-emerald-600 font-semibold">
                    {stockDict.unprocessed.Coagulum.toLocaleString()}
                  </span>
                </p>
                <p className="text-lg flex justify-between gap-5">
                  <span>Scrap:</span>
                  <span className="text-emerald-600 font-semibold">
                    {stockDict.unprocessed.Scrap.toLocaleString()}
                  </span>
                </p>
              </div>
              <p className="text-lg font-bold text-center border-t border-b pt-1">
                Total:{" "}
                {(
                  stockDict.unprocessed.Latex +
                  stockDict.unprocessed.Cuplumps +
                  stockDict.unprocessed.Coagulum +
                  stockDict.unprocessed.Scrap
                ).toLocaleString()}{" "}
                tons
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Processed Stocks */}
        <Card className="border border-slate-200 shadow bg-blue-50">
          <CardContent className="pl-8">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold text-slate-900 text-left mb-2">
                Processed Stocks
              </p>
              <div className="flex flex-col md:flex-row space-y-1 gap-4 justify-between p-4 bg-emerald-50">
                <p className="text-lg flex justify-between gap-10">
                  <span>RSS:</span>
                  <span className="text-blue-600 font-semibold">
                    {stockDict.processed.RSS.toLocaleString()}
                  </span>
                </p>
                <p className="text-lg flex justify-between gap-10">
                  <span>CNR 3L:</span>
                  <span className="text-blue-600 font-semibold">
                    {stockDict.processed["CNR 3L"].toLocaleString()}
                  </span>
                </p>
                <p className="text-lg flex justify-between gap-10">
                  <span>CNR 10:</span>
                  <span className="text-blue-600 font-semibold">
                    {stockDict.processed["CNR 10"].toLocaleString()}
                  </span>
                </p>
              </div>
              <p className="text-lg font-bold mt-2 text-center border-t border-b pt-1">
                Total:{" "}
                {(
                  stockDict.processed.RSS +
                  stockDict.processed["CNR 3L"] +
                  stockDict.processed["CNR 10"]
                ).toLocaleString()}{" "}
                tons
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* transactions history table */}
      <Card className="border shadow-lg overflow-hidden">
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
                //fetch balances
                await fetchBalances();
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
