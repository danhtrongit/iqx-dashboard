export interface ArixHoldPosition {
  symbol: string;           // Stock symbol
  date: string;             // Purchase date
  price: number;            // Purchase price
  volume: number;           // Quantity purchased
  currentPrice?: number;    // Current market price
  profitLoss?: number;      // Profit/Loss amount
  profitLossPercent?: number; // Profit/Loss percentage
}

export interface GoogleSheetsResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

export interface ArixHoldResponse {
  positions: ArixHoldPosition[];
  totalPositions: number;
  lastUpdated: string;
  totalProfitLoss?: number;
  totalProfitLossPercent?: number;
}

export interface VietcapPriceResponse {
  symbol: string;
  o: number[];  // open prices
  h: number[];  // high prices
  l: number[];  // low prices
  c: number[];  // close prices
  v: number[];  // volumes
  t: string[];  // timestamps
  accumulatedVolume: number[];
  accumulatedValue: number[];
  minBatchTruncTime: string;
}

