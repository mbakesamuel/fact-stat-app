"use server";

import { sql } from "@/lib/db";
import { Processing } from "@/lib/types";
import { createTransaction } from "./stockTransactionActions";
import { gradeMapping } from "@/lib/HelperFunctions";

// Get all processing
export async function getAllProcessing(
  factoryId?: string,
): Promise<Processing[]> {
  try {
    let rows;
    if (factoryId) {
      rows = await sql`
        SELECT 
          cp.*,
          f.id   AS factory_id,
          f.factory_name AS factory_name,
          fs.id  AS process_grade_id,
          fs.crop AS process_grade_name
        FROM "CropProcessing" cp
        JOIN "Factory" f ON cp.factory_id = f.id
        JOIN "FieldSupply" fs ON cp.process_grade_id = fs.id
        WHERE cp.factory_id = ${factoryId};
      `;
    } else {
      rows = await sql`
        SELECT 
          cp.*,
          f.id   AS factory_id,
          f.factory_name AS factory_name,
          fs.id  AS process_grade_id,
          fs.crop AS process_grade_name
        FROM "CropProcessing" cp
        JOIN "Factory" f ON cp.factory_id = f.id
        JOIN "FieldSupply" fs ON cp.process_grade_id = fs.id;
      `;
    }
    return rows as Processing[];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

//create Processing
/* export async function createProcessing(
  data: Processing,
  userId: string,
  factoryId: string,
): Promise<Processing | undefined> {
  try {
    await sql`BEGIN`;

    const [row] = await sql`
      INSERT INTO "CropProcessing" (operation_date, factory_id, process_grade_id, qty_proc, user_id)
      VALUES (${data.operation_date}, ${factoryId}, ${data.process_grade_id}, ${data.qty_proc}, ${userId})
      RETURNING *
    `;

    const mappedGrade = gradeMapping[Number(data.process_grade_id)];
    // Deduct from UNPROCESSED stock (no uniqueness enforcement here)
    await sql`
      INSERT INTO "StockTransaction"
        ("trans_date", "factory_id", "field_supply_id",
         "trans_description", "trans_mode", "qty", "created_at", "updated_at", "stock_type", "source")
      VALUES
        (${data.operation_date}, ${factoryId}, ${mappedGrade},
         ${`${data.qty_proc} kgs processed on ${data.operation_date}`}, 'OUT', ${data.qty_proc}, NOW(), NOW(), 'UNPROCESSED', 'PROCESSING')
    `;

    // Add to PROCESSED stock (no uniqueness enforcement here)
    await sql`
  INSERT INTO "StockTransaction"
    ("trans_date", "factory_id", "field_supply_id",
     "trans_description", "trans_mode", "qty", "created_at", "updated_at", "stock_type", "source")
  VALUES
    (${data.operation_date}, ${factoryId}, ${data.process_grade_id},
     ${`${data.qty_proc} kgs processed on ${data.operation_date}`}, 'IN', ${data.qty_proc}, NOW(), NOW(), 'PROCESSED', 'PROCESSING')
  ON CONFLICT ("trans_date", "factory_id", "field_supply_id", "stock_type", "trans_mode", "source")
  DO UPDATE SET
    qty = "StockTransaction".qty + EXCLUDED.qty,
    trans_description = EXCLUDED.trans_description,
    updated_at = NOW();
`;

    await sql`COMMIT`;
    return row as Processing;
  } catch (error: any) {
    await sql`ROLLBACK`;
    console.error("Error creating processing:", error);
    throw new Error(error.message);
  }
}
 */
export async function createProcessing(
  data: Processing,
  userId: string,
  factoryId: string,
): Promise<Processing | undefined> {
  try {
    await sql`BEGIN`;

    const [row] = await sql`
      INSERT INTO "CropProcessing" (
        operation_date, factory_id, process_grade_id, qty_proc, user_id
      )
      VALUES (
        ${data.operation_date}, ${factoryId}, ${data.process_grade_id}, ${data.qty_proc}, ${userId}
      )
      RETURNING *;
    `;

    const mappedGrade = gradeMapping[Number(data.process_grade_id)];

    // Deduct from UNPROCESSED stock
    await sql`
      INSERT INTO "StockTransaction"
        ("trans_date", "factory_id", "field_supply_id",
         "trans_description", "trans_mode", "qty", "created_at", "updated_at", "stock_type", "source")
      VALUES
        (${data.operation_date}, ${factoryId}, ${mappedGrade},
         ${`${data.qty_proc} kgs processed on ${data.operation_date}`}, 'OUT', ${data.qty_proc}, NOW(), NOW(), 'UNPROCESSED', 'PROCESSING')
      ON CONFLICT ("trans_date", "factory_id", "field_supply_id", "stock_type", "trans_mode", "source")
      DO UPDATE SET
        qty = "StockTransaction".qty + EXCLUDED.qty,
         trans_description = (("StockTransaction".qty + EXCLUDED.qty)::text || ' kgs processed on ' || EXCLUDED.trans_date::text),
         updated_at = NOW();
    `;

    // Add to PROCESSED stock
    await sql`
      INSERT INTO "StockTransaction"
        ("trans_date", "factory_id", "field_supply_id",
         "trans_description", "trans_mode", "qty", "created_at", "updated_at", "stock_type", "source")
      VALUES
        (${data.operation_date}, ${factoryId}, ${data.process_grade_id},
         ${`${data.qty_proc} kgs processed on ${data.operation_date}`}, 'IN', ${data.qty_proc}, NOW(), NOW(), 'PROCESSED', 'PROCESSING')
      ON CONFLICT ("trans_date", "factory_id", "field_supply_id", "stock_type", "trans_mode", "source")
      DO UPDATE SET
        qty = "StockTransaction".qty + EXCLUDED.qty,
        trans_description = (("StockTransaction".qty + EXCLUDED.qty)::text || ' kgs processed on ' || EXCLUDED.trans_date::text),
        updated_at = NOW();
    `;

    await sql`COMMIT`;
    return row as Processing;
  } catch (error: any) {
    await sql`ROLLBACK`;
    console.error("Error creating processing:", error);
    throw new Error(error.message);
  }
}

// Update a crop processing
export async function updateProcessing(
  id: string,
  data: Processing,
): Promise<Processing> {
  try {
    const [row] = await sql`
      UPDATE "CropProcessing"
      SET operation_date = ${data.operation_date},
          factory_id = ${data.factory_id},
          process_grade_id = ${data.process_grade_id},
          qty_proc = ${data.qty_proc},
          user_id = ${data.user_id}
      WHERE id = ${id}
      RETURNING *
    `;
    if (!row) throw new Error("Not found");
    return row as Processing;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Delete a crop processing
export async function deleteProcessing(
  id: string,
): Promise<{ success: boolean; deleted?: Processing }> {
  try {
    const [row] =
      await sql`DELETE FROM "CropProcessing" WHERE id = ${id} RETURNING *`;
    if (!row) throw new Error("Not found");
    return { success: true, deleted: row as Processing };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
