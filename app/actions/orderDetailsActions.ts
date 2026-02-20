"use server";

import { sql } from "@/lib/db";
import { OrderDetails } from "@/lib/types";

export async function getAllShippingOrderDetails(): Promise<OrderDetails[]> {
  try {
    const result = await sql`SELECT * FROM "ShippingOrderDetails"`;

    // Map each row into the correct shape
    const rows: OrderDetails[] = result.map((row) => ({
      id: Number(row.id),
      contract_no: String(row.contract_no),
      class_id: String(row.class_id),
      grade_id: String(row.grade_id),
      packing: String(row.packing),
      qty: Number(row.qty),
    }));

    return rows;
  } catch (error: any) {
    console.error("Error fetching shipping order details:", error);
    throw new Error("Failed to fetch shipping order details");
  }
}

// Create a new ShippingOrderDetails row
export async function createShippingOrderDetail(
  contractNo: string,
  classId: number,
  gradeId: number,
  packing: string,
  qty: number,
) {
  try {
    const rows = await sql`
      INSERT INTO "ShippingOrderDetails" ("contract_no", "class_id", "grade_id", "packing", "qty", "created_at", "updated_at")
      VALUES (${contractNo}, ${classId}, ${gradeId}, ${packing}, ${qty}, NOW(), NOW())
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error creating shipping order detail:", error);
    throw new Error("Failed to create shipping order detail");
  }
}

// Update an existing ShippingOrderDetails row
export async function updateShippingOrderDetail(
  id: number,
  data: {
    contractNo?: string;
    classId?: number;
    gradeId?: number;
    packing?: string;
    qty?: number;
  },
) {
  try {
    const rows = await sql`
      UPDATE "ShippingOrderDetails"
      SET
        "contract_no" = COALESCE(${data.contractNo}, contract_no),
        "class_id"   = COALESCE(${data.classId}, class_id),
        "grade_id"   = COALESCE(${data.gradeId}, grade_id),
        "packing"     = COALESCE(${data.packing}, packing),
        "qty"         = COALESCE(${data.qty}, qty)
      WHERE id = ${id}
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error updating shipping order detail:", error);
    throw new Error("Failed to update shipping order detail");
  }
}

// Delete a ShippingOrderDetails row
export async function deleteShippingOrderDetail(id: number) {
  try {
    await sql`DELETE FROM "ShippingOrderDetails" WHERE id = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting shipping order detail:", error);
    throw new Error("Failed to delete shipping order detail");
  }
}
