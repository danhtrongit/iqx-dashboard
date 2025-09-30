import axios, { type AxiosResponse } from "axios";
import {
  type FinancialStatementMetricsResponse,
  type FinancialStatisticsResponse,
  type FinancialStatementDetailResponse,
  FinancialStatementMetricsResponseSchema,
  FinancialStatisticsResponseSchema,
  FinancialStatementDetailResponseSchema,
} from "@/lib/schemas/financial-statements";

// API base URL
const API_BASE_URL = "https://proxy.iqx.vn/proxy/trading/api/iq-insight-service/v1";

// Create axios instance
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.msg ||
                   error.response?.data?.message ||
                   error.message ||
                   "API request failed";
    const statusCode = error.response?.status;

    throw new Error(`${message} (Status: ${statusCode || 'unknown'})`);
  }
);

export class FinancialStatementsService {
  /**
   * Get financial statement metrics (template structure)
   */
  static async getFinancialStatementMetrics(ticker: string): Promise<FinancialStatementMetricsResponse> {
    try {
      if (!ticker || ticker.trim() === '') {
        throw new Error("Ticker symbol is required");
      }

      const response: AxiosResponse<FinancialStatementMetricsResponse> = await http.get(
        `/company/${ticker.trim().toUpperCase()}/financial-statement/metrics`
      );

      // Validate response with Zod schema
      return FinancialStatementMetricsResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch financial statement metrics for ${ticker}: ${error}`);
    }
  }

  /**
   * Get financial statistics
   */
  static async getFinancialStatistics(ticker: string): Promise<FinancialStatisticsResponse> {
    try {
      if (!ticker || ticker.trim() === '') {
        throw new Error("Ticker symbol is required");
      }

      const response: AxiosResponse<FinancialStatisticsResponse> = await http.get(
        `/company/${ticker.trim().toUpperCase()}/statistics-financial`
      );

      // Validate response with Zod schema
      return FinancialStatisticsResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch financial statistics for ${ticker}: ${error}`);
    }
  }

  /**
   * Get financial statement details by section
   */
  static async getFinancialStatementDetail(
    ticker: string,
    section: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW' = 'BALANCE_SHEET'
  ): Promise<FinancialStatementDetailResponse> {
    try {
      if (!ticker || ticker.trim() === '') {
        throw new Error("Ticker symbol is required");
      }

      const response: AxiosResponse<FinancialStatementDetailResponse> = await http.get(
        `/company/${ticker.trim().toUpperCase()}/financial-statement`,
        {
          params: { section }
        }
      );

      // Validate response with Zod schema
      return FinancialStatementDetailResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch financial statement detail for ${ticker}: ${error}`);
    }
  }

  /**
   * Validate ticker format
   */
  static isValidTicker(ticker: string): boolean {
    if (!ticker || typeof ticker !== 'string') return false;

    // Vietnamese stock tickers: 3-4 uppercase letters
    const tickerRegex = /^[A-Z]{3,4}$/;
    return tickerRegex.test(ticker.trim());
  }

  /**
   * Format large numbers for display - always display in billions (tỷ VND)
   */
  static formatLargeNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';

    // Always convert to billions (tỷ VND) = divide by 1e9
    return (value / 1e9).toFixed(2);
  }

  /**
   * Format percentage values
   */
  static formatPercentage(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Format ratio values
   */
  static formatRatio(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return value.toFixed(decimals);
  }

  /**
   * Get the latest financial statistics from the response
   */
  static getLatestStatistics(response: FinancialStatisticsResponse) {
    if (!response.data || response.data.length === 0) return null;

    // Sort by year and quarter to get the most recent data
    const sorted = response.data.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year.localeCompare(a.year);
      }
      return b.quarter - a.quarter;
    });

    return sorted[0];
  }

  /**
   * Calculate financial health score based on key metrics
   */
  static calculateFinancialHealthScore(statistics: any): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: string[];
  } {
    let score = 0;
    const factors: string[] = [];

    // Helper function to check if value is valid number
    const isValidNumber = (value: any): value is number =>
      typeof value === 'number' && !isNaN(value) && value !== null && value !== undefined;

    // Profitability ratios (30%)
    if (isValidNumber(statistics.roe) && statistics.roe > 0.15) {
      score += 10;
      factors.push('Strong ROE');
    } else if (isValidNumber(statistics.roe) && statistics.roe > 0.1) {
      score += 7;
      factors.push('Good ROE');
    }

    if (isValidNumber(statistics.roa) && statistics.roa > 0.1) {
      score += 10;
      factors.push('Strong ROA');
    } else if (isValidNumber(statistics.roa) && statistics.roa > 0.05) {
      score += 7;
      factors.push('Good ROA');
    }

    if (isValidNumber(statistics.netMargin) && statistics.netMargin > 0.15) {
      score += 10;
      factors.push('High profit margin');
    } else if (isValidNumber(statistics.netMargin) && statistics.netMargin > 0.1) {
      score += 7;
      factors.push('Good profit margin');
    }

    // Liquidity ratios (25%)
    if (isValidNumber(statistics.currentRatio) && statistics.currentRatio > 2) {
      score += 8;
      factors.push('Strong liquidity');
    } else if (isValidNumber(statistics.currentRatio) && statistics.currentRatio > 1.5) {
      score += 6;
      factors.push('Good liquidity');
    }

    if (isValidNumber(statistics.quickRatio) && statistics.quickRatio > 1) {
      score += 8;
      factors.push('Good quick ratio');
    }

    if (isValidNumber(statistics.cashRatio) && statistics.cashRatio > 0.2) {
      score += 9;
      factors.push('Strong cash position');
    }

    // Leverage ratios (25%)
    if (isValidNumber(statistics.debtToEquity) && statistics.debtToEquity < 0.3) {
      score += 10;
      factors.push('Low debt');
    } else if (isValidNumber(statistics.debtToEquity) && statistics.debtToEquity < 0.6) {
      score += 7;
      factors.push('Moderate debt');
    }

    if (isValidNumber(statistics.debtToAsset) && statistics.debtToAsset < 0.3) {
      score += 8;
      factors.push('Conservative leverage');
    }

    // Efficiency ratios (20%)
    if (isValidNumber(statistics.assetTurnover) && statistics.assetTurnover > 1) {
      score += 6;
      factors.push('Efficient asset use');
    }

    if (isValidNumber(statistics.inventoryTurnover) && statistics.inventoryTurnover > 6) {
      score += 6;
      factors.push('Good inventory management');
    }

    if (isValidNumber(statistics.receivableTurnover) && statistics.receivableTurnover > 8) {
      score += 6;
      factors.push('Efficient collections');
    }

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 80) grade = 'A';
    else if (score >= 65) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 35) grade = 'D';
    else grade = 'F';

    return { score, grade, factors };
  }

  /**
   * Compare financial metrics between periods
   */
  static compareFinancialMetrics(current: any, previous: any) {
    if (!current || !previous) return null;

    const comparisons = {
      revenue: this.calculateGrowth(current.revenuePerShare, previous.revenuePerShare),
      earnings: this.calculateGrowth(current.earningsPerShare, previous.earningsPerShare),
      roe: this.calculateChange(current.roe, previous.roe),
      roa: this.calculateChange(current.roa, previous.roa),
      currentRatio: this.calculateChange(current.currentRatio, previous.currentRatio),
      debtToEquity: this.calculateChange(current.debtToEquity, previous.debtToEquity),
    };

    return comparisons;
  }

  private static calculateGrowth(current: number | null | undefined, previous: number | null | undefined): number | null {
    if (!current || !previous || previous === 0 || isNaN(current) || isNaN(previous)) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  private static calculateChange(current: number | null | undefined, previous: number | null | undefined): number | null {
    if (current == null || previous == null || isNaN(current) || isNaN(previous)) return null;
    return current - previous;
  }
}

export default FinancialStatementsService;