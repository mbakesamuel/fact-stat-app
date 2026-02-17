// app/receptions/actions.ts
"use server";
import { sql } from "@/lib/db";
import { Reception } from "@/lib/types";
import { createTransaction } from "./stockTransactionActions";

export async function getAllReceptions(
  factoryId?: string,
): Promise<Reception[]> {
  try {
    let result;

    if (factoryId) {
      result = await sql`
        SELECT 
          cr.*,
          f.id AS factory_id,
          f.factory_name AS factory_name,
          fs.id AS field_grade_id,
          fs.crop AS field_grade_name
        FROM "CropReception" cr
        JOIN "Factory" f ON cr.factory_id = f.id
        JOIN "FieldSupply" fs ON cr.field_grade_id = fs.id
        WHERE cr.factory_id = ${factoryId};
      `;
    } else {
      result = await sql`
        SELECT 
          cr.*,
          f.id AS factory_id,
          f.factory_name AS factory_name,
          fs.id AS field_grade_id,
          fs.crop AS field_grade_name
        FROM "CropReception" cr
        JOIN "Factory" f ON cr.factory_id = f.id
        JOIN "FieldSupply" fs ON cr.field_grade_id = fs.id;
      `;
    }

    return result as Reception[];
  } catch (error: any) {
    throw new Error(`Failed to fetch receptions: ${error.message}`);
  }
}

// summary reception by factory and grade.
export async function getReceptionSummary(
  period: "day" | "week" | "month" | "year",
  factoryId?: string,
) {
  try {
    let result;

    if (factoryId) {
      result = await sql`
        SELECT 
          f.id AS factory_id,
          f.factory_name,
          fs.id AS field_grade_id,
          fs.crop AS field_grade_name,
          DATE_TRUNC(${period}, cr.operation_date) as period,
          SUM(cr.qty_crop) AS total_quantity
        FROM "CropReception" cr
        JOIN "Factory" f ON cr.factory_id = f.id
        JOIN "FieldSupply" fs ON cr.field_grade_id = fs.id
        WHERE cr.factory_id = ${factoryId}
        GROUP BY f.id, f.factory_name, fs.id, fs.crop, period
        ORDER BY period, f.factory_name, fs.crop;
      `;
    } else {
      result = await sql`
        SELECT 
          f.id AS factory_id,
          f.factory_name,
          fs.id AS field_grade_id,
          fs.crop AS field_grade_name,
          DATE_TRUNC(${period}, cr.operation_date) as period
          SUM(cr.qty_crop) AS total_quantity
        FROM "CropReception" cr
        JOIN "Factory" f ON cr.factory_id = f.id
        JOIN "FieldSupply" fs ON cr.field_grade_id = fs.id
        GROUP BY f.id, f.factory_name, fs.id, fs.crop, period
        ORDER BY period, f.factory_name, fs.crop;
      `;
    }

    // Return the summarized rows directly
    return result;
  } catch (error: any) {
    throw new Error(`Failed to summarize receptions: ${error.message}`);
  }
}

//create
export async function createReception(
  data: Reception,
  factoryId: string,
  userId: string,
): Promise<Reception | undefined> {
  try {
    // 1. Insert into CropReception
    const [row] = await sql`
      INSERT INTO "CropReception" (
        operation_date, factory_id, field_grade_id, supply_unit_id, qty_crop, user_id
      )
      VALUES (
        ${data.operation_date}, ${Number(factoryId)}, 
        ${data.field_grade_id ? Number(data.field_grade_id) : null},
        ${data.supply_unit_id ? Number(data.supply_unit_id) : null}, 
        ${data.qty_crop}, ${userId}
      )
      RETURNING *;
    `;

    // 2. Update StockTransaction ledger (Reception flow enforces uniqueness)
    await sql`
      INSERT INTO "StockTransaction"
        ("trans_date", "factory_id", "field_supply_id",
         "trans_description", "trans_mode", "qty", "created_at", "updated_at", "stock_type", "source")
      VALUES
        (${data.operation_date}, ${factoryId}, ${data.field_grade_id},
         ${`Total crop received on ${data.operation_date}`}, 'IN', ${data.qty_crop}, NOW(), NOW(), 'UNPROCESSED', 'RECEPTION')
      ON CONFLICT (trans_date, factory_id, field_supply_id, stock_type, trans_mode, source)
      DO UPDATE SET
        qty = "StockTransaction".qty + EXCLUDED.qty,
        updated_at = NOW();
    `;

    return row as Reception;
  } catch (error: any) {
    console.error("Error creating reception:", error);
    throw new Error(error.message);
  }
}

// UPDATE
export async function updateReception(
  id: string,
  data: Reception,
): Promise<Reception | undefined> {
  try {
    const [row] = await sql`
      UPDATE "CropReception"
      SET operation_date = ${data.operation_date},
          factory_id = ${data.factory_id ? Number(data.factory_id) : null},
          field_grade_id = ${data.field_grade_id ? Number(data.field_grade_id) : null},
          supply_unit_id = ${data.supply_unit_id ? Number(data.supply_unit_id) : null},
          qty_crop = ${data.qty_crop}
      WHERE id = ${id}
      RETURNING *
    `;
    return row as Reception;
  } catch (error) {
    console.error("Error updating reception:", error);
  }
}

// DELETE
export async function deleteReception(
  id: string,
): Promise<{ success: boolean; deleted?: Reception }> {
  try {
    const [row] = await sql`
      DELETE FROM "CropReception" WHERE id = ${id} RETURNING *
    `;
    if (!row) return { success: false };
    return { success: true, deleted: row as Reception };
  } catch (error) {
    console.error("Error deleting reception:", error);
    return { success: false };
  }
}
