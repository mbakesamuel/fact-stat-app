import { sql } from "@/lib/db";

export async function getAllRubberClasses(): Promise<
  { id: string; class: string }[]
> {
  try {
    const rows = await sql`SELECT * FROM "RubberClass"`;
    return rows as { id: string; class: string }[];
  } catch (error: any) {
    console.error("Error fetching rubber classes:", error);
    throw new Error("Failed to fetch rubber classes");
  }
}

export async function createRubberClass(className: string) {
  try {
    const rows = await sql`
      INSERT INTO "RubberClass" (class)
      VALUES (${className})
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error creating rubber class:", error);
    throw new Error("Failed to create rubber class");
  }
}

export async function updateRubberClass(id: number, className: string) {
  try {
    const rows = await sql`
      UPDATE "RubberClass"
      SET class = ${className}
      WHERE id = ${id}
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error updating rubber class:", error);
    throw new Error("Failed to update rubber class");
  }
}

export async function deleteRubberClass(id: number) {
  try {
    await sql`DELETE FROM "RubberClass" WHERE id = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting rubber class:", error);
    throw new Error("Failed to delete rubber class");
  }
}
