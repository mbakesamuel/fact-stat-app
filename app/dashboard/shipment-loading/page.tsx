export const revalidate = 0;

import {
  getAllLoading,
  getLoadingBalanceByContract,
} from "@/app/actions/loadingActions";
import LoadingTable from "@/app/components/loadingTable";
import { currentUser } from "@clerk/nextjs/server";

export default async function LoadingPage({
  searchParams,
}: {
  searchParams: Promise<{ contract_no: string }>;
}) {
  const user = await currentUser();
  const factoryId = user?.publicMetadata.factoryId as string;

  const { contract_no } = await searchParams;

  const loadings = await getAllLoading(factoryId);
  const status = await getLoadingBalanceByContract(contract_no);

  return (
    <LoadingTable
      loadings={loadings}
      factoryId={factoryId}
      contract_no={contract_no}
      status={status}
    />
  );
}
