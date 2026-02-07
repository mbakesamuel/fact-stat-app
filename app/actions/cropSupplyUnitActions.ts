"use server";

import { sql } from "@/lib/db";

// app/actions/cropSupplyUnit.ts
export interface CropSupplyUnit {
  id: string;
  SupplyUnit: string;
}

/**
 * Fetches all crop supply units with their Estate and SubUnit names.
 * @returns Array of { id, SupplyUnit }
 */
export async function getCropSupplyUnitName(): Promise<CropSupplyUnit[]> {
  try {
    const result = await sql`
      SELECT 
        "CropSupplyUnit".id AS id,
        ("Estate".name || ' - ' || "SubUnit".sub_unit) AS "SupplyUnit"
      FROM "CropSupplyUnit"
      INNER JOIN "Estate"
        ON "CropSupplyUnit".estate_id = "Estate".id
      INNER JOIN "SubUnit"
        ON "CropSupplyUnit".sub_unit_id = "SubUnit".id;
    `;

    // result is already an array of rows if you configured sql as NeonQueryFunction<false, false>
    return result as CropSupplyUnit[];
  } catch (error: any) {
    throw new Error(`Failed to fetch crop supply units: ${error.message}`);
  }
}



//get all crop supply units like: Kompina, Kompina CRT, Kompina SmallHolders
export async function getCropSuppyUnit() {
  try {
    const res = await fetch(
      "https://fact-data.onrender.com/api/crop-supply-units",
    );
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Failed to get supply unit", error);
  }
}
