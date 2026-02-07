"use server";

import { sql } from "@/lib/db";
import { Factory } from "@/lib/types";

/* export interface Factory {
  id: string;
  factory_name: string;
} */

export async function getFactory(id?: string): Promise<Factory[]> {
  try {
    if (id) {
      const rows = await sql`
        SELECT id, factory_name
        FROM "Factory"
        WHERE id = ${id}
      `;
      // Normalize to your interface
      return rows.map((r) => ({
        id: String(r.id),
        factory_name: String(r.factory_name),
      }));
    }

    const rows = await sql`
      SELECT id, factory_name
      FROM "Factory"
    `;
    return rows.map((r) => ({
      id: String(r.id),
      factory_name: String(r.factory_name),
    }));
  } catch (error) {
    console.error("Error fetching factory:", error);
    throw new Error("Failed to fetch factory data");
  }
}

//get all factories
/* export async function getFactory() {
  try {
    const res = await fetch("https://fact-data.onrender.com/api/factories");
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Failed to get factories", error);
  }
} */

//get single factory
export async function getSingleFactory(factoryId: string | undefined) {
  try {
    const res = await fetch(
      `https://fact-data.onrender.com/api/factories/${factoryId}`,
    );
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Failed to get factories", error);
  }
}
