// actions/phasingActions.ts
// unified endpoint to get phasing estimates (daily, weekly, monthly, yearly + variance)
export async function getPhasingEstimates(
  factoryId: number,
  year: number,
  date: string
): Promise<any> {
  const res = await fetch(
    `https://fact-data.onrender.com/api/crop-phasing?year=${year}&factoryId=${factoryId}&date=${date}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch phasing estimates");
  }
  return res.json();
}
