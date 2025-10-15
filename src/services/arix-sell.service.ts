import { googleSheetsResponseSchema } from "@/lib/schemas/arix-sell.schema";
import type { ArixSellResponse, ArixSellTrade } from "@/types/arix-sell";

const GOOGLE_SHEETS_API_URL =
  "https://sheets.googleapis.com/v4/spreadsheets/1ekb2bYAQJZbtmqMUzsagb4uWBdtkAzTq3kuIMHQ22RI/values/ARIXSELL?key=AIzaSyB9PPBCGbWFv1TxH_8s_AsiqiChLs9MqXU";

/**
 * Parse a number string with potential formatting
 * Handles formats like: "27.400", "26.459.854"
 */
const parseNumber = (value: string): number => {
  if (!value) return 0;
  // Remove dots used as thousand separators and parse
  const cleanValue = value.replace(/\./g, "");
  return parseFloat(cleanValue) || 0;
};

/**
 * Parse percentage string
 * Handles formats like: "26%", "-3%"
 */
const parsePercent = (value: string): string => {
  if (!value) return "0%";
  return value.trim();
};

/**
 * Transform Google Sheets row data to ArixSellTrade object
 */
const transformRowToTrade = (row: string[]): ArixSellTrade => {
  return {
    stockCode: row[0] || "",
    buyDate: row[1] || "",
    buyPrice: parseNumber(row[2]),
    quantity: parseNumber(row[3]),
    sellDate: row[4] || "",
    sellPrice: parseNumber(row[5]),
    returnPercent: parsePercent(row[6]),
    profitLoss: parseNumber(row[7]),
    daysHeld: parseInt(row[8]) || 0,
  };
};

export const arixSellService = {
  /**
   * Get ARIX SELL trading history from Google Sheets
   * Returns processed trading data with all completed trades
   */
  async getArixSellTrades(): Promise<ArixSellResponse> {
    try {
      const response = await fetch(GOOGLE_SHEETS_API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`ARIX SELL API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const validatedData = googleSheetsResponseSchema.parse(data);

      // Skip header row (index 0) and transform remaining rows
      const trades: ArixSellTrade[] = validatedData.values
        .slice(1)
        .filter((row) => row.length >= 9) // Ensure row has all columns
        .map(transformRowToTrade);

      return {
        trades,
        totalTrades: trades.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("ARIX SELL service error:", error);
      throw error;
    }
  },

  /**
   * Get statistics from ARIX SELL trades
   */
  async getTradeStatistics() {
    const { trades } = await this.getArixSellTrades();

    const totalProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const profitableTrades = trades.filter((trade) => trade.profitLoss > 0);
    const lossTrades = trades.filter((trade) => trade.profitLoss < 0);
    const winRate = (profitableTrades.length / trades.length) * 100;

    const avgDaysHeld =
      trades.reduce((sum, trade) => sum + trade.daysHeld, 0) / trades.length;

    const avgProfit =
      profitableTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) /
      profitableTrades.length;

    const avgLoss =
      lossTrades.length > 0
        ? lossTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) /
          lossTrades.length
        : 0;

    return {
      totalTrades: trades.length,
      totalProfit,
      profitableTrades: profitableTrades.length,
      lossTrades: lossTrades.length,
      winRate: parseFloat(winRate.toFixed(2)),
      avgDaysHeld: parseFloat(avgDaysHeld.toFixed(1)),
      avgProfit,
      avgLoss,
      trades,
    };
  },

  /**
   * Get trades for a specific stock code
   */
  async getTradesByStock(stockCode: string) {
    const { trades } = await this.getArixSellTrades();
    return trades.filter(
      (trade) => trade.stockCode.toLowerCase() === stockCode.toLowerCase()
    );
  },

  /**
   * Get recent trades (last N trades)
   */
  async getRecentTrades(limit: number = 10) {
    const { trades } = await this.getArixSellTrades();
    return trades.slice(-limit).reverse(); // Get last N and reverse to show newest first
  },
};

