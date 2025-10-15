export interface ArixPlanPosition {
  symbol: string;       // Stock symbol
  buyPrice: number;     // Recommended buy price
  stopLoss: number;     // Stop loss price
  target: number;       // Target price
  returnRisk: number;   // Return/Risk ratio
}

export interface GoogleSheetsResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

export interface ArixPlanResponse {
  positions: ArixPlanPosition[];
  totalPositions: number;
  lastUpdated: string;
}

