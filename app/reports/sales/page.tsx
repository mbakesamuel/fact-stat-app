const salesData = [
  {
    id: 1,
    LOADING: "2026-01-05",
    DEPARTURE: "2026-01-06",
    FACTORY: "Tiko",
    CONTRACT: "CDC/TKO/01/2026",
    VESSEL: "MV ATLANTIC",
    DESTINATION: "Douala",
    CONTAINER: "CNU1234567",
    SEAL: "S-98765",
    TALLY: "TS-001",
    RSS: 500,
    "CNR 3L": 120,
    "CNR 10": 80,
    TOTAL: 700,
  },
  {
    id: 2,
    LOADING: "2026-01-10",
    DEPARTURE: "2026-01-11",
    FACTORY: "Limbe",
    CONTRACT: "CDC/LMB/01/2026",
    VESSEL: "MV PACIFIC",
    DESTINATION: "Kribi",
    CONTAINER: "CNU2345678",
    SEAL: "S-12345",
    TALLY: "TS-002",
    RSS: 300,
    "CNR 3L": 50,
    "CNR 10": 20,
    TOTAL: 370,
  },
  {
    id: 3,
    LOADING: "2026-01-15",
    DEPARTURE: "2026-01-16",
    FACTORY: "Kumba",
    CONTRACT: "CDC/KMB/01/2026",
    VESSEL: "MV HORIZON",
    DESTINATION: "Douala",
    CONTAINER: "CNU3456789",
    SEAL: "S-54321",
    TALLY: "TS-003",
    RSS: 420,
    "CNR 3L": 100,
    "CNR 10": 60,
    TOTAL: 580,
  },
  {
    id: 4,
    LOADING: "2026-01-20",
    DEPARTURE: "2026-01-21",
    FACTORY: "Mundemba",
    CONTRACT: "CDC/MDB/01/2026",
    VESSEL: "MV OCEANUS",
    DESTINATION: "Kribi",
    CONTAINER: "CNU4567890",
    SEAL: "S-67890",
    TALLY: "TS-004",
    RSS: 250,
    "CNR 3L": 40,
    "CNR 10": 10,
    TOTAL: 300,
  },
  {
    id: 5,
    LOADING: "2026-01-25",
    DEPARTURE: "2026-01-26",
    FACTORY: "Buea",
    CONTRACT: "CDC/BUE/01/2026",
    VESSEL: "MV MERIDIAN",
    DESTINATION: "Douala",
    CONTAINER: "CNU5678901",
    SEAL: "S-11223",
    TALLY: "TS-005",
    RSS: 600,
    "CNR 3L": 150,
    "CNR 10": 90,
    TOTAL: 840,
  },
];

export default function Sales() {
  return (
    <div className="min-h-screen p-8 text-gray-900 bg-white">
      <header className="flex flex-col items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
            <span className="text-sm text-gray-400">Logo</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              CAMEROON DEVELOPMENT CORPORATION
            </h2>
            <h3 className="text-sm text-gray-400">Group Rubber Department </h3>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold">
            GR-STAT APPLICATION - RUBBER TRANSFERED TO SALES DEPARTMENT
          </h1>
        </div>
      </header>
      <section className="mt-8">
        <h2>
          MONTH: <span>January, 2026</span>
        </h2>
      </section>
      <main className="mt-6">
        <div className="overflow-hidden rounded border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  LOADING
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  DEPARTURE
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  FACTORY
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  CONTRACT NO
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  VESSEL
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  DESTINATION
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  CONTAINER NO
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  SEAL NO
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  TALLY SLIP
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  RSS
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  CNR 3L
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  CNR 10
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {salesData.map((it, i) => (
                <tr key={it.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.LOADING}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.DEPARTURE}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.FACTORY}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.CONTRACT}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.VESSEL}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.DESTINATION}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.CONTAINER}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{it.SEAL}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.TALLY}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{it.RSS}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it["CNR 3L"]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it["CNR 10"]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {it.TOTAL}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end">
          <div className="w-full md:w-1/3">
            <div className="flex justify-between py-2 text-sm text-gray-700">
              <div>Subtotal</div>
              <div className="font-medium">subtotal</div>
            </div>
            <div className="flex justify-between py-2 text-sm text-gray-700">
              <div>tax</div>
              <div className="font-medium">0.29</div>
            </div>
            <div className="flex justify-between py-3 border-t mt-2 text-base font-semibold">
              <div>Total</div>
              <div>9088</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
