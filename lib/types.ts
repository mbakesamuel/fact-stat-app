import { LucideIcon } from "lucide-react";

// types.ts
export interface Reception {
  id?: string | undefined;
  operation_date: string; // ISO date string
  factory_id: string;
  field_grade_id: string;
  supply_unit_id: string;
  qty_crop: number;
  user_id?: string;
}

export interface Factory {
  id: string;
  factory_name: string;
}

export interface FieldSupply {
  id: string;
  crop: string;
}

export interface FactorySupply {
  id: string;
  crop: string;
}

export interface StockProductType {
  id: string;
  crop: string;
  productnature_id: number;
}

export interface SupplyUnit {
  id: string;
  SupplyUnit: string;
}

export interface Processing {
  id?: string;
  operation_date: string; // ISO date string
  factory_id: string;
  process_grade_id: string;
  qty_proc: number;
  user_id?: string;
}

export interface Factories {
  id: number;
  factory_name: string;
}

export interface FactWeeklyPhasing {
  id: number;
  BudYear: number;
  Period: string;
  WeekStart: string; // ISO date string from API
  WeekEnd: string; // ISO date string from API
  DaysAllocated: number;
  tbl_FactoryId: number;
  tbl_CropTypeId: number;
  weekNo: number;
  WkEst: number;
  factory_name: string;
  crop_type: string;
}

export interface DailyEstimate {
  cropTypeId: number;
  crop_type: string;
  dailyEstimate: number;
  actualReception: number;
  variance: number;
} // Define the shape of the accumulator
export interface Totals {
  actual: number;
  estimate: number;
  variance: number;
}

export interface MonthlyStats {
  actual: number;
  estimate: number;
  variance: number;
}

// Each month is a record of crop types -> stats
export type MonthlyRecord = Record<string, MonthlyStats>;
// The whole monthly object is month name -> crop
export type MonthlyEstimates = Record<string, MonthlyRecord>;

export interface YearlyStats {
  actual: number;
  estimate: number;
  variance: number;
}

export type YearlyEstimates = Record<string, YearlyStats>;

export interface CropDataResponse {
  factory_name?: string;
  estimates?: Record<PeriodValue, CropDataItem[]>;
}

// Types
export type PeriodValue = "daily" | "weekly" | "monthly" | "yearly";

export interface CropDataItem {
  cropTypeId?: number;
  crop_type: string;
  dailyEstimate?: number;
  weeklyEstimate?: number;
  monthlyEstimate?: number;
  yearlyEstimate?: number;
  actualReception?: number;
  variance?: number;
  [key: string]: any;
}

interface SingleNavItem {
  type: "single";
  name: string;
  page: string;
  icon: LucideIcon;
  roles: string[];
}

interface GroupNavItem {
  type: "group";
  name: string;
  icon: LucideIcon;
  roles: string[];
  children: {
    name: string;
    page: string;
    icon: LucideIcon;
  }[];
}

export type NavItem = SingleNavItem | GroupNavItem;

export type UpStockItem = { latex?: number; cuplump?: number; scrap?: number };
export type PStockItem = { rss?: number; "cnr 3l"?: number; "cnr 10"?: number };

export type StockLevel = {
  factory_id: string;
  grade_id: string;
  stock_type: string;
  quantity: number;
};

export type Transaction = {
  id?: string | undefined;
  stock_type: string;
  trans_date: string;
  factory_id: string;
  product_id: string;
  transaction_desc?: string;
  trans_mode: string;
  qty: number;
};

export type FactoryStock = {
  up: { latex: number; cuplump: number; scrap: number };
  p: { rss: number; "cnr 3l": number; "cnr 10": number };
};

export type Order = {
  contract_no: string;
  order_date: Date;
  buyer: string;
  period: string;
  destination: string;
  agent_id: number;
  created_at: Date;
  updated_at: Date;
};

export type Agents = {
  id: string;
  agent: string;
};

export type OrderDetails = {
  id?: number;
  contract_no?: string;
  class_id:string;
  grade_id: string;
  packing: string;
  qty: number;
};

export type RubberClass = {
  id: string;
  class: string;
};

export type PackingMethod = {
  id: string;
  method: string;
};

export type ShipmentLoadingDetails = {
  id: number;
  contractNo: string;
  factoryId: number;
  loadingDate: Date;
  departDate: Date;
  vessel: string;
  containerNo: string;
  sealNo: string;
  tallyNo: string;
  qty: number;
};
