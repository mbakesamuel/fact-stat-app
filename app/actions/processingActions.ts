"use server";

import { sql } from "@/lib/db";
import { Processing } from "@/lib/types";

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
export async function createProcessing(
  data: Processing,
  userId: string,
  factoryId: string,
): Promise<Processing | undefined> {
  try {
    const [row] = await sql`
      INSERT INTO "CropProcessing" (operation_date, factory_id, process_grade_id, qty_proc, user_id)
      VALUES (${data.operation_date}, ${factoryId}, ${data.process_grade_id}, ${data.qty_proc}, ${userId})
      RETURNING *
    `;
    return row as Processing;
  } catch (error: any) {
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
