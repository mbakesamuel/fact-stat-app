import { sql } from "@/lib/db";

export async function getAllAgents(): Promise<{ id: string; agent: string }[]> {
  try {
    const rows = await sql`SELECT * FROM "Agent"`;
    return rows as { id: string; agent: string }[];
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    throw new Error("Failed to fetch agents");
  }
}

export async function createAgent(agent: string) {
  try {
    const rows = await sql`
      INSERT INTO "Agent" (agent)
      VALUES (${agent})
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error creating agent:", error);
    throw new Error("Failed to create agent");
  }
}

export async function updateAgent(id: number, agent: string) {
  try {
    const rows = await sql`
      UPDATE "Agent"
      SET agent = ${agent}
      WHERE id = ${id}
      RETURNING *;
    `;
    return rows[0];
  } catch (error: any) {
    console.error("Error updating agent:", error);
    throw new Error("Failed to update agent");
  }
}

export async function deleteAgent(id: number) {
  try {
    await sql`DELETE FROM "Agent" WHERE id = ${id}`;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting agent:", error);
    throw new Error("Failed to delete agent");
  }
}
