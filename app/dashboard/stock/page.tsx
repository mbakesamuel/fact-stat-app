import { getFactory } from "@/app/actions/factoryActions";
import { getAllFieldSupply } from "@/app/actions/productActions";
import {
  getTransactions,
  getLastTransactionDate,
} from "@/app/actions/stockTransactionActions";
import StockTransactionTable from "@/app/components/stockTransactionTable";
import { Transaction } from "@/lib/types";

export default async function Stock() {
  //assuming we shall have all these three stuff through a context we will create after we integrate an auth library notably clerk.
  const factoryId = "3";
  const role = "clerk";
  const userId = "purupela@gmail.com";

  //const period: "day" | "week" | "month" | "year" = "day";
  let data: Transaction[] = [];

  if (["pd", "mrp", "homc"].includes(role)) {
    data = await getTransactions();
  } else if (["clerk", "ium"].includes(role)) {
    data = await getTransactions(factoryId);
  }

  const products = await getAllFieldSupply();
  const factories = await getFactory();
  const latestTransDate = await getLastTransactionDate(factoryId);

  return (
    <StockTransactionTable
      factories={factories}
      products={products}
      intitialData={data}
      factoryId={factoryId}
      userId={userId}
      role={role}
      latestTransDate={latestTransDate}
    />
  );
}
