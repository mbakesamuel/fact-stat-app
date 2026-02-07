"use server";

import { sql } from "@/lib/db";
import { ShipmentLoadingDetails } from "@/lib/types";
import { fDate } from "@/lib/HelperFunctions";

// 1. create
export default async function createLoading(
  formData: Omit<ShipmentLoadingDetails, "id">,
  factoryId: number,
): Promise<ShipmentLoadingDetails> {
  const rows = await sql`
    INSERT INTO "ShipmentLoadingDetails"
      (loading_date, depart_date, vessel, container_no, seal_no, tally_no, qty, factory_id, contract_no)
    VALUES (
      ${formData.loadingDate},
      ${formData.departDate},
      ${formData.vessel},
      ${formData.containerNo},
      ${formData.sealNo},
      ${formData.tallyNo},
      ${formData.qty},
      ${factoryId},
      ${formData.contractNo}
    )
    RETURNING *;
  `;

  return rows[0] as ShipmentLoadingDetails;
}

// 2. read all
export async function getAllLoading(
  contractNo?: string,
): Promise<ShipmentLoadingDetails[]> {
  let rows;
  //contract is not unique, is a foreign key
  if (contractNo) {
    // Fetch only records for this contract
    const result = await sql`
      SELECT * FROM "ShipmentLoadingDetails"
      WHERE "contract_no" = ${contractNo};
    `;
    rows = result;
  } else {
    // Fetch all records
    const result = await sql`
      SELECT * FROM "ShipmentLoadingDetails";
    `;
    rows = result;
  }

  return rows.map((row) => ({
    id: row.id,
    contractNo: row.contract_no,
    factoryId: row.factory_id,
    loadingDate: new Date(row.loading_date),
    departDate: new Date(row.depart_date),
    vessel: row.vessel,
    containerNo: row.container_no,
    sealNo: row.seal_no,
    tallyNo: row.tally_no,
    qty: row.qty,
  })) as ShipmentLoadingDetails[];
}

// 2a. read by id
export async function getShipmentLoadingDetailById(
  id: number,
): Promise<ShipmentLoadingDetails | null> {
  const row = await sql`
    SELECT * FROM "ShipmentLoadingDetails" WHERE id = ${id};
  `;
  return row[0] as ShipmentLoadingDetails | null;
}

// 2b. read by contract
export async function getShipmentLoadingDetailsByContract(
  contractNo: string,
): Promise<ShipmentLoadingDetails[]> {
  const rows = await sql`
    SELECT * FROM "ShipmentLoadingDetails" WHERE contract_no = ${contractNo};
  `;
  return rows as ShipmentLoadingDetails[];
}

// 3. update
export async function updateLoading(
  id: number,
  fields: Partial<Omit<ShipmentLoadingDetails, "id">>,
): Promise<ShipmentLoadingDetails | null> {
  const rows = await sql`
    UPDATE "ShipmentLoadingDetails"
    SET
      loading_date = COALESCE(${fields.loadingDate}, loading_date),
      depart_date  = COALESCE(${fields.departDate}, depart_date),
      vessel       = COALESCE(${fields.vessel}, vessel),
      container_no = COALESCE(${fields.containerNo}, container_no),
      seal_no      = COALESCE(${fields.sealNo}, seal_no),
      tally_no     = COALESCE(${fields.tallyNo}, tally_no),
      qty          = COALESCE(${fields.qty}, qty),
      factory_id   = COALESCE(${fields.factoryId}, factory_id),
      contract_no  = COALESCE(${fields.contractNo}, contract_no)
    WHERE id = ${id}
    RETURNING *;
  `;
  return rows[0] as ShipmentLoadingDetails | null;
}

// 4. delete
export async function deleteLoading(
  id: number,
): Promise<{ success: boolean; deleted?: ShipmentLoadingDetails }> {
  const [row] = await sql`
    DELETE FROM "ShipmentLoadingDetails" WHERE id = ${id} RETURNING *;
  `;

  if (!row) throw new Error("Not found");

  return { success: true, deleted: row as ShipmentLoadingDetails };
}

// 5. get loading summary by contract
export async function getLoadingSummaryByContract(): Promise<any[]> {
  const rows = await sql`
    SELECT 
      contract_no,
      COUNT(*) AS total_loadings,
      SUM(qty) AS loaded_qty
    FROM "ShipmentLoadingDetails" 
    GROUP BY contract_no;
  `;
  return rows;
}

6; //get loading balance for a contract
export async function getLoadingBalanceByContract(
  contractNo: string,
): Promise<{
  contractNo: string;
  orderQty: number;
  loadedQty: number;
  balance: number;
} | null> {
  // Sum up all quantities already loaded for this contract
  const loadedResult = await sql`
    SELECT 
      contract_no,
      SUM(qty) AS loaded_qty
    FROM "ShipmentLoadingDetails" 
    WHERE contract_no = ${contractNo}
    GROUP BY contract_no;
  `;

  if (loadedResult.length === 0) return null;
  const loadedQty = Number(loadedResult[0].loaded_qty) || 0;

  // Get the total contract quantity from shippingOrderDetails
  const contractResult = await sql`
    SELECT qty 
    FROM "ShippingOrderDetails" 
    WHERE contract_no = ${contractNo};
  `;

  if (contractResult.length === 0) return null;
  const orderQty = Number(contractResult[0].qty) || 0;

  return {
    contractNo,
    orderQty,
    loadedQty,
    balance: orderQty - loadedQty,
  };
}
