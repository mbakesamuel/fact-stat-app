"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Inbox,
  Package,
  Factory as FactoryIcon,
  Settings,
  LogOut,
  Building2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/lib/navigation/utils";

export default function Layout({ children }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  const isAdmin = user?.publicMetadata.role === "admin";

  const navigation = [
    {
      name: "Dashboard",
      page: "dashboard",
      icon: Home,
      roles: ["admin", "user"],
    },
    {
      name: "Crop Reception",
      page: "cropReception",
      icon: Inbox,
      roles: ["admin", "user"],
    },
    {
      name: "Crop Processing",
      page: "cropProcessing",
      icon: Package,
      roles: ["admin", "user"],
    },
    {
      name: "Factories",
      page: "factories",
      icon: FactoryIcon,
      roles: ["admin"],
    },
    { name: "Estates", page: "estates", icon: Building2, roles: ["admin"] },
    {
      name: "Supply Units",
      page: "supplyUnits",
      icon: TrendingUp,
      roles: ["admin"],
    },
    { name: "Settings", page: "settings", icon: Settings, roles: ["admin"] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes((user?.publicMetadata.role as string) || "user")
  );

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log("Error signing out", error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via">
      <style>{`
                :root {
                    --color-primary: 16 185 129;
                    --color-primary-dark: 5 150 105;
                    --color-accent: 59 130 246;
                    --color-earth: 120 113 108;
                }
                
                .glass-effect {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                }
            `}</style>
      <aside
        className={`
                fixed top-0 left-0 z-50 h-screen w-72 glass-effect shadow-2xl
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-emerald-100">
            <div className="flex flex-col items-center justify-between">
              <h1 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Factory Stats
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Management Application
              </p>
              <button
                className="lg:hidden text-slate-500 hover:text-slate-700"
                onClick={() => setIsSidebarOpen(false)}
              >
                close
              </button>
            </div>
          </div>
          {user && (
            <div className="p-4 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.fullName?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user.fullName || "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                      isAdmin
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isAdmin ? "Admin" : "User"}
                  </span>
                </div>
              </div>
            </div>
          )}
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === createPageUrl(item.page);
                return (
                  <Link
                    key={item.name}
                    href={createPageUrl(item.page)}
                    className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                            ${
                                              isActive
                                                ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                                : "text-slate-600 hover:bg-white hover:shadow-md"
                                            }
                                        `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-emerald-100">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 glass-effect border-b border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold bg-linear-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              AgriFlow
            </h1>
            <div className="w-6" />
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
