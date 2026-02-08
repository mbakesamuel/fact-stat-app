// utils/navigation.ts
export function createPageUrl(page: string): string {
  const routes: Record<string, string> = {
    dashboard: "/dashboard",
    cropreception: "/dashboard/crop-reception",
    cropprocessing: "/dashboard/crop-processing",
    stock: "/dashboard/stock",
    shipment: "/dashboard/rubber-shipment",
    loading: "/dashboard/shipment-loading",
    factories: "/factories",
    estates: "/estates",
    supplyunits: "/supplyUnits",
    settings: "/settings",
    users: "/dashboard/create-account",
    // add more mappings as needed
  };

  // fallback if no match
  return routes[page.toLowerCase()] || "/";
}
