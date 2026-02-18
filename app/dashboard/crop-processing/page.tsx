export const revalidate = 0;

import { getFactory } from "@/app/actions/factoryActions";
import { getAllProcessing } from "@/app/actions/processingActions";
import { getProduct } from "@/app/actions/productActions";
import ProcessingTable from "@/app/components/processingTable";
import { currentUser } from "@clerk/nextjs/server";

export default async function ProcessingPage() {
  const user = await currentUser();
  const factoryId = user?.publicMetadata.factoryId as string;

  const products = await getProduct(2);
  const processing = await getAllProcessing(factoryId);
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
