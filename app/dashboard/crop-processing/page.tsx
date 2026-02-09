export const revalidate = 0;

import { getFactory } from "@/app/actions/factoryActions";
import { getAllProcessing } from "@/app/actions/processingActions";
import { getAllFieldSupply } from "@/app/actions/productActions";
import { getReceptionSummary } from "@/app/actions/reception";
import ProcessingTable from "@/app/components/processingTable";

export default async function ProcessingPage() {
  const userId = "purupela@gmail.com";
  const factoryId = "3";
  const role = "clerk";
  const period: "day" | "week" | "month" | "year" = "day";
  let isSummary = false;
  let data: any[] = [];

  if (["pd", "mrp", "homc"].includes(role)) {
    data = await getReceptionSummary(period, factoryId);
    isSummary = true;
  } else if (["clerk", "ium"].includes(role)) {
    data = await getAllProcessing(factoryId);
  }

  const factories = await getFactory();
  const products = await getAllFieldSupply();
  const processing = await getAllProcessing();

  return (
    <div>
      <ProcessingTable
        processing={processing}
        factoryId={factoryId}
        factories={factories}
        products={products}
        initialPeriod={period}
        initialData={data}
        userId={userId}
        isSummary={isSummary}
      />
    </div>
  );
}
