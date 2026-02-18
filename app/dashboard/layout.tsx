import SidebarClient from "../components/dashboardComponents/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-linear-to-br from-slate-400 via-white to-slate-700">
      <SidebarClient />
      <div className="lg:pl-72">
        <main className="h-full p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
