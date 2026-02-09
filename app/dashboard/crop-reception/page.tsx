export const revalidate = 0;

// app/reception/page.tsx
import { getReceptionSummary, getAllReceptions } from "@/app/actions/reception";
import { getCropSupplyUnitName } from "@/app/actions/cropSupplyUnitActions";
import ReceptionTable from "@/app/components/receptionTable";
import { getProduct } from "@/app/actions/productActions";
import { getFactory } from "@/app/actions/factoryActions";

export default async function Reception() {
  const factoryId = "3";
  const role = "clerk";
  const userId = "purupela@gmail.com";

  const period: "day" | "week" | "month" | "year" = "day";

  let data: any[] = [];
  let isSummary = false;

  /* For the clerk and ium roles, we want to fetch receptions per their factor and fetch all receptions for other roles */
  if (role === "clerk" || role === "ium") {
    data = await getAllReceptions(factoryId);
  } else {
    data = await getAllReceptions();
  }

  data = await getAllReceptions(factoryId);

  //calling server actions to fetch different data categories.
  const supplyUnits = await getCropSupplyUnitName();
  const products = await getProduct(1);
  const factories = await getFactory();
  const receptions = await getAllReceptions();

  return (
    <ReceptionTable
      role={role}
      userId={userId}
      factoryId={factoryId}
      initialData={data}
      isSummary={isSummary}
      initialPeriod={period}
      receptions={receptions}
      factories={factories}
      products={products}
      supplyUnits={supplyUnits}
    />
  );
}
