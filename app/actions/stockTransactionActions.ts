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
          "stock_type" AS stock_type,
          "trans_date" AS trans_date,
          "factory_id" AS factory_id,
          "field_supply_id" AS product_id,
          "trans_description" AS transaction_desc,
          "trans_mode" AS trans_mode,
          qty
        FROM "StockTransaction"
        WHERE "factory_id" = ${factoryId}
        ORDER BY "trans_date" DESC;
      `
    : await sql`
        SELECT 
          id,
          "stock_type" AS stock_type,
          "trans_date" AS trans_date,
          "factory_id" AS factory_id,
          "field_supply_id" AS product_id,
          "trans_description" AS transaction_desc,
          "trans_mode" AS trans_mode,
          qty
        FROM "StockTransaction"
        ORDER BY "trans_date" DESC;
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
        ("trans_date", "factory_id", "field_supply_id",
         "trans_description", "trans_mode", "qty", "created_at", "updated_at", "stock_type", "source")
      VALUES
        (${payload.trans_date}, ${factoryId}, ${payload.product_id},
         ${payload.transaction_desc}, ${payload.trans_mode}, ${payload.qty}, NOW(), NOW(), ${payload.stock_type}, 'MANUAL')
      ON CONFLICT (trans_date, factory_id, field_supply_id, stock_type, trans_mode, source)
      DO UPDATE SET
        qty = "StockTransaction".qty + EXCLUDED.qty,
        updated_at = NOW()
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
        "stock_type" = ${payload.stock_type},
        "trans_date" = ${payload.trans_date},
        "factory_id" = ${payload.factory_id},
        "field_supply_id" = ${payload.product_id},
        "trans_description" = ${payload.transaction_desc},
        "trans_mode" = ${payload.trans_mode},
        "qty" = ${payload.qty},
        "updated_at" = NOW(),      
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
          SELECT "trans_date"
          FROM "StockTransaction"
          WHERE "factory_id" = ${factoryId}
          ORDER BY "trans_date" DESC
          LIMIT 1;
        `
      : await sql`
          SELECT "trans_date"
          FROM "StockTransaction"
          ORDER BY "trans_date" DESC
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

//Action to compute daily crop reception/processing totals by product
export async function getDailyTotals({
  date,
  productId,
  factoryId,
}: {
  date: string;
  productId: string;
  factoryId: string;
}) {
  const result = await sql`
  SELECT Round(COALESCE(SUM(qty_crop),0)) AS total
  FROM "CropReception"
  WHERE "operation_date" = ${date}
  AND "field_grade_id" = ${productId}
  AND "factory_id" = ${factoryId}`;
  return result[0]?.total || 0;
}

//stock balances
export async function getStockBalances(factoryId?: number) {
  const result = await sql`
    SELECT 
      factory_id,    
      crop as product,
      stock_type,
      SUM(
        CASE 
          WHEN trans_mode = 'IN' THEN qty
          WHEN trans_mode = 'OUT' THEN -qty
          ELSE 0
        END
      ) AS net_stock
    FROM "StockTransaction" st INNER JOIN "FieldSupply" fs ON st.field_supply_id=fs.id
    ${factoryId ? sql`WHERE factory_id = ${factoryId}` : sql``}
    GROUP BY factory_id, fs.crop, stock_type
  `;

  return result;
}
