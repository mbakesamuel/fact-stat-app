import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatRow {
  label: string;
  actual: number;
  estimate: number;
  variance: number;
}

interface StatsCardProps {
  title: string;
  subtitle?: string;
  totals: { actual: number; estimate: number; variance: number };
  rows: StatRow[];
  accentColor?: "green" | "blue" | "orange" | "purple";
}

export default function StatsCard({
  title,
  subtitle,
  totals,
  rows,
  accentColor = "green",
}: StatsCardProps) {
  const accentClasses: Record<string, string> = {
    green: "from-green-400 to-green-600",
    blue: "from-blue-400 to-blue-600",
    orange: "from-orange-400 to-orange-600",
    purple: "from-purple-400 to-purple-600",
  };

  return (
    <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      <CardHeader
        className={`bg-gradient-to-r ${accentClasses[accentColor]} text-white rounded-t-xl p-4`}
      >
        <CardTitle className="text-xl font-semibold tracking-wide">
          {title}{" "}
          {subtitle && (
            <span className="text-sm font-normal opacity-80">({subtitle})</span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Totals */}
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Actual
            </p>
            <p className="text-2xl font-bold text-green-600">
              {totals.actual.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Estimate
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {totals.estimate.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Variance
            </p>
            <p
              className={`text-2xl font-bold ${
                totals.variance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {totals.variance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100 border rounded-lg">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-3 px-4 text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">{row.label}</span>
              <div className="flex gap-4 text-right">
                <span className="text-green-600 font-semibold">
                  {row.actual.toLocaleString()}
                </span>
                <span className="text-orange-600 font-semibold">
                  {row.estimate.toLocaleString()}
                </span>
                <span
                  className={`font-semibold ${
                    row.variance >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {row.variance.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
