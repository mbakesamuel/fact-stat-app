import { sql } from "@/lib/db";

export async function getAllPackingMethods(): Promise<{ id: string; method: string }[]> {
  try {
    const rows = await sql`SELECT * FROM "PackingMethod"`;
    return rows as { id: string; method: string }[];
  } catch (error: any) {
    console.error("Error fetching packing methods:", error);
    throw new Error("Failed to fetch packing methods");
  }
}

export async function createPackingMethod(method: string) {
  try {
    const rows = await sql`
      INSERT INTO "PackingMethod" (method)
      VALUES (${method})
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error creating packing method:", error);
    throw new Error("Failed to create packing method");
  }
}

export async function updatePackingMethod(id: number, method: string) {
  try {
    const rows = await sql`
      UPDATE "PackingMethod"
      SET method = ${method}
      WHERE id = ${id}
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error updating packing method:", error);
    throw new Error("Failed to update packing method");
  }
}

export async function deletePackingMethod(id: number) {
  try {
    await sql`DELETE FROM "PackingMethod" WHERE id = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting packing method:", error);
    throw new Error("Failed to delete packing method");
  }
}
