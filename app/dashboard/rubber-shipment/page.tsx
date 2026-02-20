export const revalidate = 0;

import { getAllAgents } from "@/app/actions/agentActions";
import { getAllPackingMethods } from "@/app/actions/packingMethodActions";
import { getAllRubberClasses } from "@/app/actions/rubberClassActions";
import { getAllShippingOrderDetails } from "@/app/actions/orderDetailsActions";
import RubberShipment from "@/app/components/rubberShipment";
import { getAllShippingOrders } from "@/app/actions/ordersActions";
import { getProduct } from "@/app/actions/productActions";
import { getLoadingSummaryByContract } from "@/app/actions/loadingActions";


export default async function Shipment() {
  const agents = await getAllAgents();
  const rubberclasses = await getAllRubberClasses();
  const products = await getProduct();
  const packingMethods = await getAllPackingMethods();
  const orderDetails = await getAllShippingOrderDetails();
  const orders = await getAllShippingOrders();
  const loadDetails = await getLoadingSummaryByContract();

  return (
    <div>
      <RubberShipment
        ordersInit={orders}
        agents={agents}
        rubberClasses={rubberclasses}
        products={products}
        packingMethods={packingMethods}
        orderDetailsInit={orderDetails}
        loadDetails={loadDetails}
      />
    </div>
  );
}
