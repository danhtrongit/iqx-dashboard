export interface ArixSellTrade {
  stockCode: string;      // MA CK
  buyDate: string;        // BUY DATE
  buyPrice: number;       // BUY PRICE
  quantity: number;       // KL mua
  sellDate: string;       // SELL DATE
  sellPrice: number;      // SELL PRICE
  returnPercent: string;  // % RETURN
  profitLoss: number;     // P/L
  daysHeld: number;       // DATE HOLD
}

export interface GoogleSheetsResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

export interface ArixSellResponse {
  trades: ArixSellTrade[];
  totalTrades: number;
  lastUpdated: string;
}

