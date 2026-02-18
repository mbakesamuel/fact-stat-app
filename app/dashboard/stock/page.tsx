import { getFactory } from "@/app/actions/factoryActions";
import { getProduct } from "@/app/actions/productActions";
import {
  getTransactions,
} from "@/app/actions/stockTransactionActions";
import StockTransactionTable from "@/app/components/stockTransactionTable";
import { currentUser } from "@clerk/nextjs/server";

export default async function Stock() {
  const user = await currentUser();
  const factoryId = user?.publicMetadata.factoryId as string;

  const products = await getProduct();
  const factories = await getFactory();
  const transactions = await getTransactions(factoryId);

  return (
    <StockTransactionTable
      factories={factories}
      products={products}
      intitialData={transactions}
    />
  );
}
