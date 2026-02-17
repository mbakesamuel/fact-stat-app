import { getFactory } from "@/app/actions/factoryActions";
import { getProduct } from "@/app/actions/productActions";
import {
  getTransactions,
  getStockBalances,
} from "@/app/actions/stockTransactionActions";
import StockTransactionTable from "@/app/components/stockTransactionTable";

export default async function Stock() {
  const products = await getProduct();
  const factories = await getFactory();
  const transactions = await getTransactions();

  return (
    <StockTransactionTable
      factories={factories}
      products={products}
      intitialData={transactions}
    />
  );
}
