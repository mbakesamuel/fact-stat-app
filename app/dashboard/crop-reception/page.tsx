export const revalidate = 0;

// app/reception/page.tsx
import { getAllReceptions } from "@/app/actions/reception";
import { getCropSupplyUnitName } from "@/app/actions/cropSupplyUnitActions";
import ReceptionTable from "@/app/components/receptionTable";
import { getProduct } from "@/app/actions/productActions";
import { getFactory } from "@/app/actions/factoryActions";

export default async function Reception() {
  const supplyUnits = await getCropSupplyUnitName();
  const products = await getProduct(1);
  const factories = await getFactory();
  const receptions = await getAllReceptions();

  return (
    <ReceptionTable
      initialReception={receptions}
      factories={factories}
      products={products}
      supplyUnits={supplyUnits}
    />
  );
}
