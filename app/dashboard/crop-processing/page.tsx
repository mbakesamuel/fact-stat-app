export const revalidate = 0;

import { getFactory } from "@/app/actions/factoryActions";
import { getAllProcessing } from "@/app/actions/processingActions";
import { getProduct } from "@/app/actions/productActions";
import ProcessingTable from "@/app/components/processingTable";

export default async function ProcessingPage() {
  const products = await getProduct(2);
  const processing = await getAllProcessing();
  const factories = await getFactory();

  return (
    <div>
      <ProcessingTable
        products={products}
        initialProcessing={processing}
        factories={factories}
      />
    </div>
  );
}
