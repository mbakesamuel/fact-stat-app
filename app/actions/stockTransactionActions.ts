"use server";

import { sql } from "@/lib/db";
import { formatDate } from "@/lib/HelperFunctions";
import { PStockItem, Transaction, UpStockItem } from "@/lib/types";

/* type StockItem = { latex?: number; cuplump?: number; scrap?: number }; */

export async function getStockSummaryUnprocPivot(): Promise<UpStockItem> {
  const rows = await sql`
    SELECT f.crop, SUM(s.qty) AS total_qty
    FROM "StockTransaction" s
    JOIN "FieldSupply" f ON f.id = s."tbl_FieldSupplyId"
    WHERE s."stockType" = ${"UNPROCESSED"}   -- filter condition
    GROUP BY f.crop
    ORDER BY f.crop;
  `;

  const summary: UpStockItem = {};
  rows.forEach((row: any) => {
    const crop = row.crop.toLowerCase(); // latex, cuplump, scrap
    summary[crop as keyof UpStockItem] = Number(row.total_qty);
  });

  return summary;
}

//handling processed rubber transactions
export async function getStockSummaryProcPivot(): Promise<PStockItem> {
  const rows = await sql`
    SELECT f.crop, SUM(s.qty) AS total_qty
    FROM "StockTransaction" s
    JOIN "FieldSupply" f ON f.id = s."tbl_FieldSupplyId"
    WHERE s."stockType" = ${"PROCESSED"}   -- filter condition
    GROUP BY f.crop
    ORDER BY f.crop;
  `;

  const summary: PStockItem = {};
  rows.forEach((row: any) => {
    const crop = row.crop.toLowerCase(); // rss, cnr 3L, cnr 10
    summary[crop as keyof PStockItem] = Number(row.total_qty);
  });

  return summary;
}

//get transactions
export async function getTransactions(
  factoryId?: string, // optional parameter
): Promise<Transaction[]> {
  const rows = factoryId
    ? await sql`
        SELECT 
          id,
          "stockType" AS stock_type,
          "transDate" AS trans_date,
          "tbl_FactoryId" AS factory_id,
          "tbl_FieldSupplyId" AS product_id,
          "transDescription" AS transaction_desc,
          "transMode" AS trans_mode,
          qty
        FROM "StockTransaction"
        WHERE "tbl_FactoryId" = ${factoryId}
        ORDER BY "transDate" DESC;
      `
    : await sql`
        SELECT 
          id,
          "stockType" AS stock_type,
          "transDate" AS trans_date,
          "tbl_FactoryId" AS factory_id,
          "tbl_FieldSupplyId" AS product_id,
          "transDescription" AS transaction_desc,
          "transMode" AS trans_mode,
          qty
        FROM "StockTransaction"
        ORDER BY "transDate" DESC;
      `;

  return rows as Transaction[];
}

// CREATE
export async function createTransaction(
  payload: Transaction,
  factoryId: string,
  userId: string,
) {
  try {
    const [row] = await sql`
    INSERT INTO "StockTransaction"
      ("transDate", "tbl_FactoryId", "tbl_FieldSupplyId",
       "transDescription", "transMode", "qty", "createdAt", "updatedAt", "stockType")
    VALUES
      (${payload.trans_date}, ${factoryId}, ${payload.product_id},
       ${payload.transaction_desc}, ${payload.trans_mode}, ${payload.qty}, NOW(), NOW(), ${payload.stock_type})
    RETURNING *;
  `;
    return row as Transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    return null;
  }
}

// UPDATE
export async function updateTransaction(
  id: string,
  payload: Partial<Transaction>,
) {
  try {
    const [row] = await sql`
      UPDATE "StockTransaction"
      SET 
        "stockType" = ${payload.stock_type},
        "transDate" = ${payload.trans_date},
        "tbl_FactoryId" = ${payload.factory_id},
        "tbl_FieldSupplyId" = ${payload.product_id},
        "transDescription" = ${payload.transaction_desc},
        "transMode" = ${payload.trans_mode},
        "qty" = ${payload.qty},
        "updatedAt" = NOW(),      
      WHERE "id" = ${id}
      RETURNING *;
    `;
    return row as Transaction;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return null;
  }
}

// DELETE
export async function deleteTransaction(id: string) {
  try {
    await sql`
      DELETE FROM "StockTransaction"
      WHERE "id" = ${id};
    `;
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false };
  }
}

// Get last transaction date
export async function getLastTransactionDate(
  factoryId?: string, // now optional
): Promise<string | null> {
  try {
    const [row] = factoryId
      ? await sql`
          SELECT "transDate"
          FROM "StockTransaction"
          WHERE "tbl_FactoryId" = ${factoryId}
          ORDER BY "transDate" DESC
          LIMIT 1;
        `
      : await sql`
          SELECT "transDate"
          FROM "StockTransaction"
          ORDER BY "transDate" DESC
          LIMIT 1;
        `;

    if (!row) return null;

    const lastDate = new Date(row.transDate);
    return formatDate(lastDate);
  } catch (error) {
    console.error("Error fetching last transaction date:", error);
    return null;
  }
}
