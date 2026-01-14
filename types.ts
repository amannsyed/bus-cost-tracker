
export interface FareCategory {
  id: string;
  label: string;
  price: number;
}

export interface AppConfig {
  startDate: string;
  monthlyDebit: number;
  adminFee: number;
  weeklyCap: number; // User adjustable weekly PAYG cap
  isSetup: boolean;
  fareCategories: FareCategory[]; // Dynamic categories
}

export interface FareEntry {
  label: string;
  priceAtTime: number;
}

export interface DailyFare {
  date: string; // ISO format date string
  entries: FareEntry[]; // Stores label and price at time of entry for history
}

export interface SubscriptionPayment {
  id: string;
  date: string;
  amount: number;
  label: string;
}

export interface ChartDataPoint {
  day: string;
  cumulativePayg: number;
  subscriptionCost: number;
  label: string;
  timestamp: number;
}
