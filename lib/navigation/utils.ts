// utils/navigation.ts
export function createPageUrl(page: string): string {
  const routes: Record<string, string> = {
    dashboard: "/dashboard",
    cropreception: "/dashboard/cropReception",
    cropprocessing: "/dashboard/cropProcessing",
    factories: "/factories",
    estates: "/estates",
    supplyunits: "/supplyUnits",
    settings: "/settings",
    // add more mappings as needed
  };

  // fallback if no match
  return routes[page.toLowerCase()] || "/";
}
