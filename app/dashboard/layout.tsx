import SidebarClient from "../components/dashboardComponents/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <SidebarClient />
      {/* Main content */}
      <div className="lg:pl-72">
        <main className="min-h-screen p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
