import axios, { type AxiosResponse } from "axios";
import {
  type FinancialRatioResponse,
  type FinancialRatioRequest,
  type FinancialRatioData,
  type Period,
  type FinancialRatioItem,
  FinancialRatioError,
} from "@/types/financial-ratio";

// API Base URL - using Simplize API
const FINANCIAL_RATIO_API_BASE_URL = "https://api2.simplize.vn/api";

// Create axios instance
const financialRatioHttp = axios.create({
  baseURL: FINANCIAL_RATIO_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
financialRatioHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ||
                   error.response?.data?.msg ||
                   error.message ||
                   "Có lỗi xảy ra khi lấy dữ liệu tài chính";
    const statusCode = error.response?.status;
    const errors = Array.isArray(error.response?.data?.errors)
      ? error.response.data.errors
      : undefined;

    throw new FinancialRatioError(message, statusCode, errors);
  }
);

export class FinancialRatioService {
  /**
   * Get financial ratios for a company
   * @param ticker - Stock ticker symbol (e.g., "GMD", "VNM")
   * @param period - Period type: 'Q' for quarterly, 'Y' for yearly
   * @param size - Number of periods to fetch (max 12 for Q, max 3 for Y)
   */
  static async getFinancialRatios(
    ticker: string,
    period: Period = 'Q',
    size: number = period === 'Q' ? 12 : 3
  ): Promise<FinancialRatioData> {
    try {
      // Validate inputs
      if (!ticker || ticker.trim() === '') {
        throw new FinancialRatioError("Mã cổ phiếu không được để trống");
      }

      // Validate size limits
      const maxSize = period === 'Q' ? 12 : 3;
      if (size > maxSize) {
        throw new FinancialRatioError(
          `Kích thước không hợp lệ. Tối đa ${maxSize} cho kỳ ${period}`
        );
      }

      if (size < 1) {
        throw new FinancialRatioError("Kích thước phải lớn hơn 0");
      }

      const upperTicker = ticker.trim().toUpperCase();
      
      const response: AxiosResponse<FinancialRatioResponse> = await financialRatioHttp.get(
        `/company/fi/ratio/${upperTicker}`,
        {
          params: {
            period,
            size,
          }
        }
      );

      if (response.data.status !== 200) {
        throw new FinancialRatioError(
          response.data.message || "Không thể lấy dữ liệu tỷ lệ tài chính",
          response.data.status
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof FinancialRatioError) {
        throw error;
      }

      // Handle specific HTTP errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new FinancialRatioError(
            `Không tìm thấy dữ liệu tài chính cho mã: ${ticker}`,
            404
          );
        }
        if (error.response?.status === 400) {
          throw new FinancialRatioError("Tham số không hợp lệ", 400);
        }
        if (error.response?.status === 429) {
          throw new FinancialRatioError(
            "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
            429
          );
        }
      }

      throw new FinancialRatioError(
        `Lấy dữ liệu tỷ lệ tài chính thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get quarterly financial ratios
   */
  static async getQuarterlyRatios(
    ticker: string,
    size: number = 12
  ): Promise<FinancialRatioData> {
    return this.getFinancialRatios(ticker, 'Q', Math.min(size, 12));
  }

  /**
   * Get yearly financial ratios
   */
  static async getYearlyRatios(
    ticker: string,
    size: number = 3
  ): Promise<FinancialRatioData> {
    return this.getFinancialRatios(ticker, 'Y', Math.min(size, 3));
  }

  /**
   * Get multiple companies' financial ratios
   */
  static async getMultipleCompanyRatios(
    tickers: string[],
    period: Period = 'Q',
    size?: number
  ): Promise<Record<string, FinancialRatioData>> {
    try {
      if (!tickers || tickers.length === 0) {
        return {};
      }

      const validTickers = tickers
        .map(ticker => ticker.trim().toUpperCase())
        .filter(ticker => ticker.length > 0);

      if (validTickers.length === 0) {
        return {};
      }

      const promises = validTickers.map(ticker =>
        this.getFinancialRatios(ticker, period, size)
          .then(data => ({ ticker, data }))
          .catch(() => ({ ticker, data: null }))
      );

      const results = await Promise.all(promises);
      
      const ratiosMap: Record<string, FinancialRatioData> = {};
      results.forEach(({ ticker, data }) => {
        if (data) {
          ratiosMap[ticker] = data;
        }
      });

      return ratiosMap;
    } catch (error) {
      throw error instanceof FinancialRatioError 
        ? error 
        : new FinancialRatioError("Lấy dữ liệu nhiều công ty thất bại");
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
   * Validate period type
   */
  static isValidPeriod(period: string): period is Period {
    return period === 'Q' || period === 'Y';
  }

  /**
   * Get max size for a period
   */
  static getMaxSize(period: Period): number {
    return period === 'Q' ? 12 : 3;
  }

  /**
   * Format period display name
   */
  static formatPeriodName(periodDateName: string, period: Period): string {
    if (period === 'Y') {
      return `Năm ${periodDateName}`;
    }
    // For quarterly, periodDateName might be like "2024Q3"
    const match = periodDateName.match(/(\d{4}).*?(\d+)/);
    if (match) {
      return `Quý ${match[2]} năm ${match[1]}`;
    }
    return periodDateName;
  }

  /**
   * Extract specific ratio category
   */
  static extractRatiosByPrefix(
    item: FinancialRatioItem,
    prefix: 'bs' | 'is' | 'op' | 'isg' | 'bsg'
  ): Record<string, number> {
    const ratios: Record<string, number> = {};
    
    Object.entries(item).forEach(([key, value]) => {
      if (key.startsWith(prefix) && typeof value === 'number') {
        ratios[key] = value;
      }
    });

    return ratios;
  }

  /**
   * Get balance sheet ratios
   */
  static getBalanceSheetRatios(item: FinancialRatioItem): Record<string, number> {
    return this.extractRatiosByPrefix(item, 'bs');
  }

  /**
   * Get income statement ratios
   */
  static getIncomeStatementRatios(item: FinancialRatioItem): Record<string, number> {
    return this.extractRatiosByPrefix(item, 'is');
  }

  /**
   * Get operational ratios
   */
  static getOperationalRatios(item: FinancialRatioItem): Record<string, number> {
    return this.extractRatiosByPrefix(item, 'op');
  }

  /**
   * Get growth ratios
   */
  static getGrowthRatios(item: FinancialRatioItem): Record<string, number> {
    return {
      ...this.extractRatiosByPrefix(item, 'isg'),
      ...this.extractRatiosByPrefix(item, 'bsg'),
    };
  }

  /**
   * Format number for display
   */
  static formatNumber(value: number | undefined, decimals = 2): string {
    if (value === undefined || value === null) return 'N/A';
    
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
    
    return isNegative ? `-${formatted}` : formatted;
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(value: number | undefined, decimals = 2): string {
    if (value === undefined || value === null) return 'N/A';
    
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    
    // Remove trailing zeros
    const formatted = parseFloat(absValue.toFixed(decimals)).toString().replace('.', ',');
    
    return isNegative ? `-${formatted}%` : `${formatted}%`;
  }

  /**
   * Format currency for display
   * Convert from VND to billions VND (divide by 1e9)
   * Example: 28,742,356,000,000 VND → 28.742,36 (tỷ VND)
   */
  static formatCurrency(value: number | undefined, decimals = 2): string {
    if (value === undefined || value === null) return 'N/A';
    
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    
    // Convert to billions (divide by 1e9)
    const billions = absValue / 1e9;
    
    // Format with thousand separators and decimals, remove trailing zeros
    const formatted = billions.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
    
    return isNegative ? `-${formatted}` : formatted;
  }

  /**
   * Calculate growth rate between two periods
   */
  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get latest period data
   */
  static getLatestPeriod(data: FinancialRatioData): FinancialRatioItem | null {
    if (!data.items || data.items.length === 0) return null;
    return data.items[0]; // Assuming items are sorted by date descending
  }

  /**
   * Compare ratios between two periods
   */
  static compareRatios(
    current: FinancialRatioItem,
    previous: FinancialRatioItem
  ): Record<string, { current: number; previous: number; change: number; changePercent: number }> {
    const comparison: Record<string, any> = {};

    // Get all numeric keys from both items
    const keys = new Set([
      ...Object.keys(current).filter(k => typeof current[k as keyof FinancialRatioItem] === 'number'),
      ...Object.keys(previous).filter(k => typeof previous[k as keyof FinancialRatioItem] === 'number'),
    ]);

    keys.forEach(key => {
      const currentValue = current[key as keyof FinancialRatioItem] as number | undefined;
      const previousValue = previous[key as keyof FinancialRatioItem] as number | undefined;

      if (currentValue !== undefined && previousValue !== undefined) {
        const change = currentValue - previousValue;
        const changePercent = previousValue !== 0 
          ? (change / previousValue) * 100 
          : 0;

        comparison[key] = {
          current: currentValue,
          previous: previousValue,
          change,
          changePercent,
        };
      }
    });

    return comparison;
  }

  /**
   * Generate financial summary text
   */
  static generateSummary(data: FinancialRatioData): string {
    const latest = this.getLatestPeriod(data);
    if (!latest) return "Không có dữ liệu";

    const ticker = latest.ticker;
    const period = latest.periodDateName;
    const industryGroup = data.industryGroup;

    return `Dữ liệu tài chính ${ticker} thuộc ngành ${industryGroup} cho kỳ ${period}`;
  }
}

export default FinancialRatioService;

