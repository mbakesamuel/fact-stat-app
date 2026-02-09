"use server";

import { sql } from "@/lib/db";
import { ProductType } from "@/lib/types";

/* export async function getAllFieldSupply(): Promise<StockProductType[]> {
  try {
    const rows = await sql`SELECT * FROM "FieldSupply"`;
    return rows as StockProductType[];
  } catch (error: any) {
    console.error("Error fetching field supplies:", error);
    throw new Error("Failed to fetch field supplies");
  }
} */

export async function getProduct(
  productId?: number,
): Promise<{ id: number; crop: string; productnature_id: number }[]> {
  try {
    let rows;

    if (productId) {
      // Filter by productId if provided
      rows = await sql`
        SELECT id, crop, "productnature_id"
        FROM "FieldSupply"
        WHERE "productnature_id" = ${productId};
      `;
    } else {
      // Otherwise return all
      rows = await sql`
        SELECT id, crop, "productnature_id"
        FROM "FieldSupply";
      `;
    }

    // Map rows to the desired shape
    return rows.map((row: any) => ({
      id: row.id,
      crop: row.crop,
      productnature_id: row.productnature_id,
    }));
  } catch (error: any) {
    console.error("Error fetching field supplies:", error);
    throw new Error("Failed to fetch field supplies");
  }
}

/* export async function getFieldGrades(): Promise<FieldSupply[]> {
  try {
    const rows =
      await sql`SELECT * FROM "FieldSupply" WHERE productnature_id = 1`;
    return rows as FieldSupply[];
  } catch (error) {
    console.error("Failed to get supply unit", error);
    throw new Error("Failed to fetch field grades");
  }
}

export async function getFactoryGrades(): Promise<FactorySupply[]> {
  try {
    const rows =
      await sql`SELECT * FROM "FieldSupply" WHERE productnature_id = 2`;
    return rows as FactorySupply[];
  } catch (error) {
    console.error("Failed to get supply unit", error);
    throw new Error("Failed to fetch field grades");
  }
}
 */
