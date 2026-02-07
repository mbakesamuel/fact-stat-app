import { format } from "date-fns";
import { Factory, StockProductType, SupplyUnit } from "./types";
import { Value } from "@radix-ui/react-select";

export const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
};


export const fDate = (value: Date | string | null): string | null => {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

// Utility to format date as dd/mm/yyyy
export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getFactoryName = (id: string, factories: Factory[]) =>
  factories.find((f) => f.id === id)?.factory_name || "Unknown";

/* export const getGradeName = (id: string, fieldSupplies: FieldSupply[]) => */
export const getGradeName = (id: number, products: StockProductType[]) =>
  products.find((f) => Number(f.id) === id)?.crop || "Unknown";

export const getSupplyUnitName = (
  id: string,
  supplyUnits: SupplyUnit[],
): string => {
  const unit = supplyUnits.find((u) => u.id === id);
  return unit ? unit.SupplyUnit : "Unknown";
};

export function formatPeriod(
  period: string,
  type: "day" | "week" | "month" | "year",
) {
  const date = new Date(period);
  switch (type) {
    case "day":
      return format(date, "MMM dd, yyyy");
    case "week":
      return `Week ${format(date, "I")} - ${format(date, "yyyy")}`;
    case "month":
      return format(date, "MMM yyyy");
    case "year":
      return format(date, "yyyy");
    default:
      return format(date, "MMM dd, yyyy");
  }
}
