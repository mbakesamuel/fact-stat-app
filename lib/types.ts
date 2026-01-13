// types.ts
export interface Reception {
  id: string;
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
