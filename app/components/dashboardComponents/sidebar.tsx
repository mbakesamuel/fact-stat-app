"use client";

import { useState } from "react";
import {
  Menu,
  Home,
  Inbox,
  Package,
  Factory as FactoryIcon,
  Settings,
  LogOut,
  Building2,
  TrendingUp,
  X,
  Sticker,
  Ship,
  LoaderPinwheel,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/lib/navigation/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NavItem } from "@/lib/types";
import { useClerk } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "../spinner";

export default function SidebarClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { signOut } = useClerk();
  const { user } = useUser();

  /* if (!user) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Spinner className="text-emeral-600 size-4" />
        <span>Loading...</span>
      </div>
    );
  }
 */
  const isAdmin = (user?.publicMetadata.role as string) === "admin";

  const navigation: NavItem[] = [
    {
      type: "single",
      name: "Dashboard",
      page: "dashboard",
      icon: Home,
      roles: ["admin", "pd", "mrp", "homc", "ium", "clerk"],
    },
    {
      type: "group",
      name: "Operations",
      icon: Package,
      roles: ["admin", "clerk"],
      children: [
        { name: "Reception", page: "CropReception", icon: Inbox },
        { name: "Processing", page: "CropProcessing", icon: Package },
        { name: "Rubber Stocks", page: "Stock", icon: Sticker },
        { name: "Rubber Shipment", page: "shipment", icon: Ship },
        { name: "Shipment Loading", page: "loading", icon: LoaderPinwheel },
      ],
    },
    {
      type: "group",
      name: "Management",
      icon: Building2,
      roles: ["admin"],
      children: [
        { name: "Factories", page: "Factories", icon: FactoryIcon },
        { name: "Estates", page: "Estates", icon: Building2 },
        { name: "Supply Units", page: "SupplyUnits", icon: TrendingUp },
        { name: "Users", page: "Users", icon: Users },
      ],
    },
    {
      type: "single",
      name: "Settings",
      page: "settings",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  // Role-based filtering
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes((user?.publicMetadata.role as string) || ""),
  );

  //clerk signout
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <>
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

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 glass-effect shadow-2xl transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  Group Rubber Stats
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Management Application
                </p>
              </div>
              <button
                className="lg:hidden text-slate-500 hover:text-slate-700"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* User info */}
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
                    {user.publicMetadata.role as string}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <Accordion type="multiple" className="space-y-1">
              {filteredNavigation.map((item, index) => {
                const Icon = item.icon;

                if (item.type === "single") {
                  const isActive = pathname === createPageUrl(item.page);
                  return (
                    <Link
                      key={item.name}
                      href={createPageUrl(item.page)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${
                          isActive
                            ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                            : "text-slate-600 hover:bg-white hover:shadow-md"
                        }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                }

                // group item
                return (
                  <AccordionItem
                    key={item.name}
                    value={`item-${index}`}
                    className="border-none"
                  >
                    <AccordionTrigger className="px-4 py-3 rounded-xl hover:bg-white hover:shadow-md text-slate-600 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-0 pt-1">
                      <div className="space-y-1 ml-4">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isActive =
                            pathname === createPageUrl(child.page);
                          return (
                            <Link
                              key={child.name}
                              href={createPageUrl(child.page)}
                              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-50"
                                }`}
                              onClick={() => setIsSidebarOpen(false)}
                            >
                              <ChildIcon
                                className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`}
                              />
                              <span className="text-sm font-medium">
                                {child.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </nav>

          {/* Logout */}
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

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 glass-effect border-b border-emerald-100 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-bold bg-linear-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            G-R STATS
          </h1>

          <div className="flex items-center gap-3">
            <Link
              href={createPageUrl("dashboard")}
              className="text-slate-600 hover:text-slate-900"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
