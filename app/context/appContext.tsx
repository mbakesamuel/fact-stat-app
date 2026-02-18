"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "../components/spinner";

interface AppContext {
  userId: string;
  factoryId: string;
  role: string;
}

const AppContext = createContext<AppContext | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="text-emeral-600 size-24" />
        <span>Loading...</span>
      </div>
    );
  }

  const userId = (user?.id as string) ?? "";
  const factoryId = (user?.publicMetadata.factoryId as string) ?? "";
  const role = (user?.publicMetadata.role as string) ?? "";

  return (
    <AppContext.Provider value={{ userId, factoryId, role }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
