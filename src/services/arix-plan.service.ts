import { googleSheetsResponseSchema } from "@/lib/schemas/arix-plan.schema";
import type { ArixPlanResponse, ArixPlanPosition } from "@/types/arix-plan";

const GOOGLE_SHEETS_API_URL =
  "https://sheets.googleapis.com/v4/spreadsheets/1ekb2bYAQJZbtmqMUzsagb4uWBdtkAzTq3kuIMHQ22RI/values/ArixPlan?key=AIzaSyB9PPBCGbWFv1TxH_8s_AsiqiChLs9MqXU";

/**
 * Parse a number string with potential formatting
 * Handles formats like: "85000", "3,353", "1,607"
 */
const parseNumber = (value: string): number => {
  if (!value) return 0;
  // Remove commas and dots used as thousand separators and parse
  const cleanValue = value.replace(/[,.]/g, "");
  return parseFloat(cleanValue) || 0;
};

/**
 * Transform Google Sheets row data to ArixPlanPosition object
 */
const transformRowToPosition = (row: string[]): ArixPlanPosition => {
  return {
    symbol: row[0] || "",
    buyPrice: parseNumber(row[1]),
    stopLoss: parseNumber(row[2]),
    target: parseNumber(row[3]),
    returnRisk: parseNumber(row[4]),
  };
};

export const arixPlanService = {
  /**
   * Get ARIX PLAN positions from Google Sheets
   * Returns recommended trading plans with buy/sell targets
   */
  async getArixPlanPositions(): Promise<ArixPlanResponse> {
    try {
      const response = await fetch(GOOGLE_SHEETS_API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`ARIX PLAN API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const validatedData = googleSheetsResponseSchema.parse(data);

      // Skip header row (index 0) and transform remaining rows
      const positions: ArixPlanPosition[] = validatedData.values
        .slice(1)
        .filter((row) => row.length >= 5) // Ensure row has all columns
        .map(transformRowToPosition);

      return {
        positions,
        totalPositions: positions.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("ARIX PLAN service error:", error);
      throw error;
    }
  },

  /**
   * Get statistics from ARIX PLAN positions
   */
  async getPositionStatistics() {
    const { positions } = await this.getArixPlanPositions();

    const avgBuyPrice =
      positions.reduce((sum, pos) => sum + pos.buyPrice, 0) / positions.length;
    const avgTarget =
      positions.reduce((sum, pos) => sum + pos.target, 0) / positions.length;
    const avgReturnRisk =
      positions.reduce((sum, pos) => sum + pos.returnRisk, 0) /
      positions.length;

    // Calculate potential returns
    const positionsWithReturns = positions.map((pos) => ({
      ...pos,
      potentialReturn: pos.target - pos.buyPrice,
      potentialReturnPercent:
        ((pos.target - pos.buyPrice) / pos.buyPrice) * 100,
      riskAmount: pos.buyPrice - pos.stopLoss,
      riskPercent: ((pos.buyPrice - pos.stopLoss) / pos.buyPrice) * 100,
    }));

    // Find best opportunities (highest return/risk ratio)
    const sortedByReturnRisk = [...positions].sort(
      (a, b) => b.returnRisk - a.returnRisk
    );

    return {
      totalPositions: positions.length,
      avgBuyPrice: parseFloat(avgBuyPrice.toFixed(2)),
      avgTarget: parseFloat(avgTarget.toFixed(2)),
      avgReturnRisk: parseFloat(avgReturnRisk.toFixed(2)),
      positionsWithReturns,
      topOpportunities: sortedByReturnRisk.slice(0, 5),
      positions,
    };
  },

  /**
   * Get position for a specific symbol
   */
  async getPositionBySymbol(symbol: string) {
    const { positions } = await this.getArixPlanPositions();
    return positions.find(
      (pos) => pos.symbol.toLowerCase() === symbol.toLowerCase()
    );
  },

  /**
   * Get positions sorted by return/risk ratio
   */
  async getPositionsByReturnRisk() {
    const { positions } = await this.getArixPlanPositions();
    return positions.sort((a, b) => b.returnRisk - a.returnRisk);
  },

  /**
   * Get positions sorted by potential return percentage
   */
  async getPositionsByPotentialReturn() {
    const { positions } = await this.getArixPlanPositions();
    return positions
      .map((pos) => ({
        ...pos,
        potentialReturnPercent:
          ((pos.target - pos.buyPrice) / pos.buyPrice) * 100,
      }))
      .sort((a, b) => b.potentialReturnPercent - a.potentialReturnPercent);
  },

  /**
   * Calculate risk/reward metrics for all positions
   */
  async getRiskRewardAnalysis() {
    const { positions } = await this.getArixPlanPositions();

    return positions.map((pos) => {
      const potentialGain = pos.target - pos.buyPrice;
      const potentialLoss = pos.buyPrice - pos.stopLoss;
      const riskRewardRatio = potentialLoss !== 0 ? potentialGain / potentialLoss : 0;

      return {
        symbol: pos.symbol,
        buyPrice: pos.buyPrice,
        stopLoss: pos.stopLoss,
        target: pos.target,
        potentialGain,
        potentialLoss,
        riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
        potentialGainPercent: parseFloat(
          ((potentialGain / pos.buyPrice) * 100).toFixed(2)
        ),
        potentialLossPercent: parseFloat(
          ((potentialLoss / pos.buyPrice) * 100).toFixed(2)
        ),
        returnRisk: pos.returnRisk,
      };
    });
  },
};

