import { getAllLoading, getLoadingBalanceByContract, getLoadingSummaryByContract } from "@/app/actions/loadingActions";
import LoadingTable from "@/app/components/loadingTable";

export default async function LoadingPage({
  searchParams,
}: {
  searchParams: Promise<{ contract_no: string }>;
}) {
  const factoryId = 3;
  const { contract_no } = await searchParams;

  const loadings = await getAllLoading(contract_no);
  const status = await getLoadingBalanceByContract(contract_no);
 


  return <LoadingTable loadings={loadings} factoryId={factoryId} contract_no={contract_no} status={status} />;
}
