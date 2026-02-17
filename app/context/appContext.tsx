"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";

interface AppContext {
  userId: string;
  factoryId: string;
  role: string;
}

const AppContext = createContext<AppContext | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();

  console.log(user);

  const userId = user?.id as string;
  const factoryId = user?.publicMetadata.factoryId as string;
  const role = user?.publicMetadata.role as string;

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
