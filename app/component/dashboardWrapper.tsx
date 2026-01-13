"use client";

import { useUser } from "@clerk/nextjs";
import Dashboard from "./dashboard";
import { useEffect, useState } from "react";

export default function DashboardWrapper() {
  const [factoryName, setFactoryName] = useState<string>("");
  const { user } = useUser();

  // Assume factory_id is stored in publicMetadata
  const factoryId = user?.publicMetadata?.factoryId as number | undefined;

  /*  useEffect(() => {
    // Fetch factory name based on factoryId if needed
    async function fetchFactoryName() {
      const res = await fetch(
        `https://fact-data.onrender.com/api/factories/${factoryId}`
      );
      const data = await res.json();
      setFactoryName(data.name);
      console.log(factoryName);
    }
    fetchFactoryName();
  }, [factoryId]); */

  if (!factoryId) {
    return <p>No factory assigned to this user.</p>;
  }

  return <Dashboard factoryId={factoryId} />;
}
