"use server";

import { sql } from "@/lib/db";
import { FactorySupply, FieldSupply, StockProductType } from "@/lib/types";

export async function getAllFieldSupply(): Promise<StockProductType[]> {
  try {
    const rows = await sql`SELECT * FROM "FieldSupply"`;
    return rows as StockProductType[];
  } catch (error: any) {
    console.error("Error fetching field supplies:", error);
    throw new Error("Failed to fetch field supplies");
  }
}

export async function getFieldGrades(): Promise<FieldSupply[]> {
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
