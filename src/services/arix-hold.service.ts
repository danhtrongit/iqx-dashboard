import { googleSheetsResponseSchema } from "@/lib/schemas/arix-hold.schema";
import type { 
  ArixHoldResponse, 
  ArixHoldPosition, 
  VietcapPriceResponse 
} from "@/types/arix-hold";

const GOOGLE_SHEETS_API_URL =
  "https://sheets.googleapis.com/v4/spreadsheets/1ekb2bYAQJZbtmqMUzsagb4uWBdtkAzTq3kuIMHQ22RI/values/ArixHold?key=AIzaSyB9PPBCGbWFv1TxH_8s_AsiqiChLs9MqXU";

const VIETCAP_PRICE_API_URL = 
  "https://proxy.iqx.vn/proxy/trading/api/chart/OHLCChart/gap-chart";

/**
 * Parse a number string with potential formatting
 * Handles formats like: "35.000", "2.857", "69000"
 */
const parseNumber = (value: string): number => {
  if (!value) return 0;
  // Remove dots used as thousand separators and parse
  const cleanValue = value.replace(/\./g, "");
  return parseFloat(cleanValue) || 0;
};

/**
 * Fetch current market prices from Vietcap API
 */
const fetchMarketPrices = async (symbols: string[]): Promise<Map<string, number>> => {
  try {
    const uniqueSymbols = [...new Set(symbols)];
    const to = Date.now();
    
    const response = await fetch(VIETCAP_PRICE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://trading.vietcap.com.vn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        timeFrame: 'ONE_MINUTE',
        symbols: uniqueSymbols,
        to: to,
        countBack: uniqueSymbols.length,
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch market prices:', response.statusText);
      return new Map();
    }

    const data: VietcapPriceResponse[] = await response.json();
    const priceMap = new Map<string, number>();

    // Extract the latest close price for each symbol
    // Response is an array of objects with symbol and price arrays
    data.forEach((item) => {
      if (item.c && item.c.length > 0) {
        // Get the last close price from the array
        const latestPrice = item.c[item.c.length - 1];
        priceMap.set(item.symbol, latestPrice);
      }
    });

    return priceMap;
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return new Map();
  }
};

/**
 * Transform Google Sheets row data to ArixHoldPosition object
 */
const transformRowToPosition = (row: string[]): ArixHoldPosition => {
  return {
    symbol: row[0] || "",
    date: row[1] || "",
    price: parseNumber(row[2]),
    volume: parseNumber(row[3]),
  };
};

export const arixHoldService = {
  /**
   * Get ARIX HOLD positions from Google Sheets with current market prices
   * Returns current holding positions with purchase details and P/L calculations
   */
  async getArixHoldPositions(): Promise<ArixHoldResponse> {
    try {
      const response = await fetch(GOOGLE_SHEETS_API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`ARIX HOLD API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const validatedData = googleSheetsResponseSchema.parse(data);

      // Skip header row (index 0) and transform remaining rows
      const positions: ArixHoldPosition[] = validatedData.values
        .slice(1)
        .filter((row) => row.length >= 4) // Ensure row has all columns
        .map(transformRowToPosition);

      // Fetch current market prices for all symbols
      const symbols = positions.map(pos => pos.symbol);
      const marketPrices = await fetchMarketPrices(symbols);

      // Calculate P/L for each position with current market prices
      let totalProfitLoss = 0;
      let totalInvestment = 0;

      const positionsWithPrices = positions.map(position => {
        const currentPrice = marketPrices.get(position.symbol);
        
        if (currentPrice) {
          const investment = position.price * position.volume;
          const currentValue = currentPrice * position.volume;
          const profitLoss = currentValue - investment;
          const profitLossPercent = ((currentPrice - position.price) / position.price) * 100;

          totalProfitLoss += profitLoss;
          totalInvestment += investment;

          return {
            ...position,
            currentPrice,
            profitLoss,
            profitLossPercent,
          };
        }

        // If no current price available, return position without P/L data
        totalInvestment += position.price * position.volume;
        return position;
      });

      const totalProfitLossPercent = totalInvestment > 0 
        ? (totalProfitLoss / totalInvestment) * 100 
        : 0;

      return {
        positions: positionsWithPrices,
        totalPositions: positionsWithPrices.length,
        lastUpdated: new Date().toISOString(),
        totalProfitLoss,
        totalProfitLossPercent,
      };
    } catch (error) {
      console.error("ARIX HOLD service error:", error);
      throw error;
    }
  },

  /**
   * Get statistics from ARIX HOLD positions
   */
  async getPositionStatistics() {
    const { positions } = await this.getArixHoldPositions();

    const totalValue = positions.reduce(
      (sum, pos) => sum + pos.price * pos.volume,
      0
    );
    const totalVolume = positions.reduce((sum, pos) => sum + pos.volume, 0);
    const avgPrice =
      positions.reduce((sum, pos) => sum + pos.price, 0) / positions.length;

    // Group by symbol for diversification analysis
    const symbolGroups = positions.reduce((acc, pos) => {
      if (!acc[pos.symbol]) {
        acc[pos.symbol] = [];
      }
      acc[pos.symbol].push(pos);
      return acc;
    }, {} as Record<string, ArixHoldPosition[]>);

    const uniqueSymbols = Object.keys(symbolGroups).length;

    return {
      totalPositions: positions.length,
      totalValue,
      totalVolume,
      avgPrice: parseFloat(avgPrice.toFixed(2)),
      uniqueSymbols,
      symbolGroups,
      positions,
    };
  },

  /**
   * Get positions for a specific symbol
   */
  async getPositionsBySymbol(symbol: string) {
    const { positions } = await this.getArixHoldPositions();
    return positions.filter(
      (pos) => pos.symbol.toLowerCase() === symbol.toLowerCase()
    );
  },

  /**
   * Get positions sorted by value (price * volume)
   */
  async getPositionsByValue() {
    const { positions } = await this.getArixHoldPositions();
    return positions
      .map((pos) => ({
        ...pos,
        totalValue: pos.price * pos.volume,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  },
};

