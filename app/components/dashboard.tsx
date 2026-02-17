export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen gap-4">
      {/* Top section */}
      <div className="flex items-center justify-center flex-1 bg-gray-300">
        Daily
      </div>

      {/* Bottom section with 3 equal columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 flex-3 gap-4">
        <div className="flex items-center justify-center bg-gray-200">
          Weekly
        </div>
        <div className="flex items-center justify-center bg-gray-200">
          Monthly
        </div>
        <div className="flex items-center justify-center bg-gray-200">
          Yearly
        </div>
      </div>
    </div>
  );
}
