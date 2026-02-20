"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShippingOrderModal from "./shippingOrderModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Package, Plus, Trash2 } from "lucide-react";
import {
  Agents,
  Order,
  OrderDetails,
  PackingMethod,
  RubberClass,
  ProductType,
} from "@/lib/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Pagination from "./pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createShippingOrder,
  deleteShippingOrder,
  getAllShippingOrders,
} from "../actions/ordersActions";
import { useRouter } from "next/navigation";
import {
  createShippingOrderDetail,
  deleteShippingOrderDetail,
  getAllShippingOrderDetails,
} from "../actions/orderDetailsActions";
import { useAppContext } from "../context/appContext";

export default function RubberShipment({
  ordersInit,
  orderDetailsInit,
  loadDetails,
  agents,
  rubberClasses,
  products,
  packingMethods,
}: {
  ordersInit: Order[];
  orderDetailsInit: OrderDetails[];
  loadDetails: any[];
  agents: Agents[];
  rubberClasses: RubberClass[];
  products: ProductType[];
  packingMethods: PackingMethod[];
}) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingOrders, setEditingOrders] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);
  const itemsPerPage = 10;

  const [orders, setOrder] = useState<Order[]>(ordersInit);
  const [orderDetails, setOrderDetails] =
    useState<OrderDetails[]>(orderDetailsInit);

  const router = useRouter();
  const { role, factoryId, userId } = useAppContext();

  //get Agent name
  const getAgentName = (agent_id: number) => {
    return agents.find((a) => Number(a.id) === agent_id)?.agent || "unknown";
  };

  const getOrderDetails = (contract_no: string) => {
    return orderDetails.filter((d) => d.contract_no === contract_no);
  };

  const getLoadingDetails = (contract_no: string) => {
    return loadDetails.filter((d) => d.contract_no === contract_no);
  };

  const getRubberClassName = (classId: number) => {
    return (
      rubberClasses.find((c) => Number(c.id) === classId)?.class || "Unknown"
    );
  };

  const getGradeName = (gradeId: number) => {
    return (
      products.find((f) => Number(f.id) === Number(gradeId))?.crop || "Unknown"
    );
  };

  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handleEdit = (order: Order) => {
    setEditingOrders(order);
    setShowFormModal(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  //handle navigation
  const handleNavigate = (contract_no: string) => {
    router.push(
      `/dashboard/shipment-loading?contract_no=${encodeURIComponent(contract_no)}`,
    );
  };

  //refresh functions
  async function refreshOrders() {
    try {
      const latestOrders = await getAllShippingOrders();
      setOrder(latestOrders);
    } catch (err) {
      console.error("Failed to refresh orders");
    }
  }

  async function refreshOrderDetails() {
    try {
      const latestOrderDetails = await getAllShippingOrderDetails();
      setOrderDetails(latestOrderDetails);
    } catch (err) {
      console.error("Failed to refresh order details");
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Shipping Instructions
          </h1>
          <p className="text-slate-600 mt-1">
            Manage Shipping Orders and Loading
          </p>
        </div>
        <Button
          onClick={() => setShowFormModal(true)}
          className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {!orders ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="glass-effect border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              No shipping orders found
            </p>
            <p className="text-slate-400 text-sm text-center mt-1">
              Create your first shipping order to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {paginatedOrders
              .filter((order) => {
                /* Order details */
                const details = getOrderDetails(order.contract_no);
                const totalQty = details.reduce(
                  (sum, d) => sum + (d.qty || 0),
                  0,
                );
                /* Loading Details */
                const loadDetails = getLoadingDetails(order.contract_no);
                const totalLoadedQty = loadDetails.reduce(
                  (sum, d) => sum + (d.loaded_qty || 0),
                  0,
                );
                const balance = totalQty - totalLoadedQty;
                const status = balance === 0;

                if (role === "admin") {
                  return true;
                } else if (role === "clerk" || role === "ium") {
                  return true;
                } else {
                  return !status; //only keep orders where status is 0
                }
              })
              .map((order) => {
                const details = getOrderDetails(order.contract_no);
                const totalQty = details.reduce(
                  (sum, d) => sum + (d.qty || 0),
                  0,
                );
                const loadDetails = getLoadingDetails(order.contract_no);
                const totalLoadedQty = loadDetails.reduce(
                  (sum, d) => sum + (d.loaded_qty || 0),
                  0,
                );
                const balance = totalQty - totalLoadedQty;
                const status = balance === 0;
                return (
                  <Card
                    key={order.contract_no}
                    className="glass-effect border-none shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-2 md:flex-row items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-full flex justify-between gap-4">
                              <div className="flex items-center">
                                <Package className="w-5 h-5 text-emerald-600" />
                                {order.contract_no}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">
                                  {status ? "Completed" : "Pending"}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={status}
                                  readOnly
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>
                          </CardTitle>
                          <p className="text-sm text-slate-600 mt-1">
                            {order.buyer}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleNavigate(order.contract_no);
                            }}
                          >
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(order)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeleteId(order.contract_no);
                              setConfirmOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">
                            Shipping Agent:
                          </span>
                          <p className="font-semibold">
                            {getAgentName(Number(order.agent_id))}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Date:</span>
                          <p className="font-semibold">
                            {format(new Date(order.order_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Destination:</span>
                          <p className="font-semibold">{order.destination}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">
                            Total Quantity:
                          </span>
                          <p className="font-semibold">
                            {totalQty.toLocaleString()} Kgs
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Total Loaded:</span>
                          <p className="font-semibold">
                            {totalLoadedQty.toLocaleString()} Kgs
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-600">Balance:</span>
                          <p className="font-semibold">
                            {balance.toLocaleString()} Kgs
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

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
                  const result = await deleteShippingOrder(deleteId);
                  if (result?.success) {
                    setOrder(
                      orders.filter((rec) => rec.contract_no !== deleteId),
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

      {/* Modal Form */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOrders ? "Edit Shipping Order" : "New Shipping Order"}
            </DialogTitle>
          </DialogHeader>
          <ShippingOrderModal
            order={editingOrders}
            agents={agents}
            rubberClasses={rubberClasses}
            products={products}
            packingMethods={packingMethods}
            onClose={() => {
              setShowFormModal(false);
              setEditingOrders(null);
            }}
            orderDetails={orderDetails}
            refreshOrders={refreshOrders}
            refreshOrderDetails={refreshOrderDetails}
          />
        </DialogContent>
      </Dialog>
      {/* view Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Order Details - {selectedOrder?.contract_no}
            </DialogTitle>
            <DialogDescription>
              Review the details of this shipping order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Buyer:</span>
                  <p className="font-semibold">{selectedOrder.buyer}</p>
                </div>
                <div>
                  <span className="text-slate-600">Agent:</span>
                  <p className="font-semibold">
                    {getAgentName(selectedOrder.agent_id)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Order Date:</span>
                  <p className="font-semibold">
                    {format(new Date(selectedOrder.order_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Destination:</span>
                  <p className="font-semibold">{selectedOrder.destination}</p>
                </div>
              </div>
              {/* order items section */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-2">Class</th>
                        <th className="text-left p-2">Grade</th>
                        <th className="text-left p-2">Packing</th>
                        <th className="text-right p-2">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getOrderDetails(selectedOrder.contract_no).map(
                        (detail) => (
                          <tr key={detail.id} className="border-t">
                            <td className="p-2">
                              {getRubberClassName(Number(detail.class_id))}
                            </td>
                            <td className="p-2">
                              {getGradeName(Number(detail.grade_id))}
                            </td>
                            <td className="p-2">{detail.packing}</td>
                            <td className="p-2 text-right">{detail.qty}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
