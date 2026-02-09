"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Agents,
  Order,
  OrderDetails,
  PackingMethod,
  RubberClass,
  ProductType,
} from "@/lib/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createShippingOrder,
  updateShippingOrder,
} from "../actions/ordersActions";
import {
  createShippingOrderDetail,
  deleteShippingOrderDetail,
} from "../actions/orderDetailsActions";

type OrderFormData = {
  contractNo: string;
  orderDate: string;
  buyer: string;
  agentId: string;
  period: string;
  destination: string;
};

export default function ShippingOrderModal({
  order,
  agents,
  rubberClasses,
  products,
  packingMethods,
  onClose,
  orderDetails,
}: {
  order: Order | null;
  agents: Agents[];
  rubberClasses: RubberClass[];
  products: ProductType[];
  packingMethods: PackingMethod[];
  onClose: () => void;
  orderDetails: OrderDetails[];
}) {
  const [orderItems, setOrderItems] = useState<OrderDetails[]>([]);
  const [formData, setFormData] = useState({
    contractNo: order?.contract_no || "",
    orderDate: order?.order_date
      ? order?.order_date.toISOString().split("T")[0]
      : "",
    buyer: order?.buyer || "",
    agentId: order?.agent_id?.toString() || "",
    period: order?.period || "",
    destination: order?.destination || "",
  });

  const existingDetails = orderDetails.filter(
    (detail) => detail.contract_no === order?.contract_no,
  );

  useEffect(() => {
    if (order) {
      const details = orderDetails.filter(
        (detail) => detail.contract_no === order.contract_no,
      );
      setOrderItems(details);
    }
  }, [order, orderDetails]);

  //to add order items - handling adding data to the order details table.
  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      { id: 0, class_id: "", grade_id: "", packing: "", qty: 0 },
    ]);
  };

  //equally to remove orderItem by index -  its an array of order items
  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  //update
  const updateOrderItem = <K extends keyof OrderDetails>(
    index: number,
    field: K,
    value: OrderDetails[K],
  ) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // handle save order
  async function saveOrder(data: OrderFormData) {
    try {
      const payload: Order = {
        contract_no: data.contractNo,
        order_date: new Date(data.orderDate),
        buyer: data.buyer,
        agent_id: Number(data.agentId),
        period: data.period,
        destination: data.destination,
        created_at: new Date(),
        updated_at: new Date(),
      };

      if (order) {
        // Update existing order
        await updateShippingOrder(order.contract_no, payload);

        // Delete existing details
        await Promise.all(
          existingDetails.map((d) => deleteShippingOrderDetail(Number(d.id))),
        );
      } else {
        // Create new order (pass args individually)
        await createShippingOrder(
          payload.contract_no,
          payload.order_date,
          payload.buyer,
          payload.period,
          payload.destination,
          payload.agent_id,
        );
      }

      // Create new details
      if (orderItems.length > 0) {
        await Promise.all(
          orderItems.map((item) =>
            createShippingOrderDetail(
              formData.contractNo,
              Number(item.class_id),
              Number(item.grade_id),
              item.packing,
              item.qty,
            ),
          ),
        );
      }

      // Refresh UI after success
      // await refreshOrders(); // your own function to reload orders
      //await refreshOrderDetails(); // your own function to reload details
      onClose();
    } catch (error) {
      console.error("Error saving order:", error);
      // Show error feedback to user (toast, alert, etc.)
    }
  }

  const handleSubmit = () => {
    saveOrder(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="Contract_no">Contract Number</Label>
          <Input
            id="contract_no"
            value={formData.contractNo}
            onChange={(e) => handleInputChange("contractNo", e.target.value)}
            required
            disabled={!!order}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order_date">Order Date *</Label>
          <Input
            id="order_date"
            type="date"
            value={formData.orderDate}
            onChange={(e) => handleInputChange("orderDate", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer">Buyer *</Label>
          <Input
            id="buyer"
            value={formData.buyer}
            onChange={(e) => handleInputChange("buyer", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agent">Agent *</Label>
          <Select
            value={formData.agentId}
            onValueChange={(value) => handleInputChange("agentId", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {agents?.map((agent) => (
                <SelectItem key={agent.id} value={String(agent.id)}>
                  {agent.agent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Input
            id="period"
            value={formData.period}
            onChange={(e) =>
              setFormData({ ...formData, period: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            value={formData.destination}
            onChange={(e) => handleInputChange("destination", e.target.value)}
          />
        </div>
      </div>

      {/**************** shipment Order items **********************/}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Shipment Order Items</h3>
          <Button
            type="button"
            size="sm"
            onClick={addOrderItem}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {orderItems.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-row gap-2 mb-4 items-center"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg bg-slate-50">
                <Select
                  value={item.class_id}
                  onValueChange={(value) =>
                    updateOrderItem(index, "class_id", value)
                  }
                >
                  <SelectTrigger className="w-full md:col-span-2">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {rubberClasses.map((rc) => (
                      <SelectItem key={rc.id} value={String(rc.id)}>
                        {rc.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={item.grade_id}
                  onValueChange={(value) =>
                    updateOrderItem(index, "grade_id", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((fs) => (
                      <SelectItem key={fs.id} value={String(fs.id)}>
                        {fs.crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={item.packing}
                  onValueChange={(value) =>
                    updateOrderItem(index, "packing", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Packing" />
                  </SelectTrigger>
                  <SelectContent>
                    {packingMethods.map((pm) => (
                      <SelectItem key={pm.id} value={String(pm.method)}>
                        {pm.method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Quantity"
                  value={item.qty}
                  onChange={(e) =>
                    updateOrderItem(index, "qty", Number(e.target.value))
                  }
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => removeOrderItem(index)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* cancel and save buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-linear-to-r from-emerald-500 to-emerald-600"
        >
          save
        </Button>
      </div>
    </form>
  );
}
