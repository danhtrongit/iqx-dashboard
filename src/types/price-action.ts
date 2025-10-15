export interface PriceActionItem {
  ticker: string;
  date: string;
  currentPrice: number;
  change1D: number; // % change in 1 day
  change7D: number; // % change in 7 days
  change30D: number; // % change in 30 days
  volume: number;
  avgVolume3M: number;
  high3M: number;
  percentFromHigh3M: number; // % from 3-month high
}

export interface PriceActionResponse {
  data: PriceActionItem[];
}

export interface PriceActionStats {
  totalStocks: number;
  positiveChange1D: number;
  negativeChange1D: number;
  avgChange1D: number;
  avgChange7D: number;
  avgChange30D: number;
  highestGainer1D: PriceActionItem | null;
  highestLoser1D: PriceActionItem | null;
}
