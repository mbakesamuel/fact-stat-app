"use server";

import { sql } from "@/lib/db";
import { Order } from "@/lib/types";

// Get all ShippingOrders
export async function getAllShippingOrders(): Promise<Order[]> {
  try {
    const rows = await sql`SELECT * FROM "ShippingOrder"`;

    return rows.map((row: any) => ({
      ...row,
      orderDate: new Date(row.orderDate),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })) as Order[];
  } catch (error: any) {
    console.error("Error fetching shipping orders:", error);
    throw new Error("Failed to fetch shipping orders");
  }
}

// Create a new ShippingOrder
export async function createShippingOrder(
  contractNo: string,
  orderDate: Date,
  buyer: string,
  period: string,
  destination: string,
  agentId: number,
) {
  try {
    const rows = await sql`
      INSERT INTO "ShippingOrder" ("contract_no", "order_date", "buyer", "period", "destination", "agent_id", "created_at", "updated_at")
      VALUES (${contractNo}, ${orderDate}, ${buyer}, ${period}, ${destination}, ${agentId}, NOW(), NOW())
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error creating shipping order:", error);
    throw new Error("Failed to create shipping order");
  }
}

// Update an existing ShippingOrder
export async function updateShippingOrder(
  contractNo: string,
  data: {
    orderDate?: Date;
    buyer?: string;
    period?: string;
    destination?: string;
    agentId?: number;
  },
) {
  try {
    const rows = await sql`
      UPDATE "ShippingOrder"
      SET
        "orderDate"  = COALESCE(${data.orderDate}, "orderDate"),
        "buyer"      = COALESCE(${data.buyer}, "buyer"),
        "period"     = COALESCE(${data.period}, "period"),
        "destination"= COALESCE(${data.destination}, "destination"),
        "agentId"    = COALESCE(${data.agentId}, "agentId")
      WHERE "contractNo" = ${contractNo}
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error updating shipping order:", error);
    throw new Error("Failed to update shipping order");
  }
}

// Delete a ShippingOrder
export async function deleteShippingOrder(contractNo: string) {
  try {
    await sql`DELETE FROM "ShippingOrder" WHERE "contractNo" = ${contractNo}`;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting shipping order:", error);
    throw new Error("Failed to delete shipping order");
  }
}
