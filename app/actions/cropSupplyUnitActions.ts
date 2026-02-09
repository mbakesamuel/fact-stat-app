"use server";

import { sql } from "@/lib/db";
import { SupplyUnit } from "@/lib/types";

export async function getCropSupplyUnitName(): Promise<SupplyUnit[]> {
  try {
    const rows = await sql`
      SELECT 
        "CropSupplyUnit".id AS id,
        "sub_unit_id" as sub_unit_id,
        ("Estate".name || ' - ' || "SubUnit".sub_unit) AS "SupplyUnit"
      FROM "CropSupplyUnit"
      INNER JOIN "Estate"
        ON "CropSupplyUnit".estate_id = "Estate".id
      INNER JOIN "SubUnit"
        ON "CropSupplyUnit".sub_unit_id = "SubUnit".id;
    `;
    return rows.map((row) => ({
      id: row.id,
      sub_unit_id: row.sub_unit_id,
      SupplyUnit: row.SupplyUnit,
    })) as SupplyUnit[];
  } catch (error: any) {
    throw new Error(`Failed to fetch crop supply units: ${error.message}`);
  }
}
