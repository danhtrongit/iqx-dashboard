// Financial Ratio Types for Company Financial Analysis
// API: https://api2.simplize.vn/api/company/fi/ratio/{ticker}

export type Period = 'Q' | 'Y';

// Balance Sheet fields prefix
export interface BalanceSheetRatios {
  // Asset fields (bs1-bs60)
  bs1?: number;  // Total Assets
  bs2?: number;  // Current Assets
  bs3?: number;  // Non-current Assets
  bs4?: number;  // Cash and Cash Equivalents
  bs5?: number;  // Short-term Investments
  bs6?: number;  // Accounts Receivable
  bs7?: number;  // Inventory
  bs8?: number;  // Prepaid Expenses
  bs9?: number;  // Other Current Assets
  bs10?: number; // Long-term Investments
  bs11?: number; // Property, Plant & Equipment
  bs12?: number; // Intangible Assets
  bs13?: number; // Goodwill
  bs14?: number; // Other Non-current Assets
  
  // Liability fields (bs15-bs100)
  bs15?: number; // Total Liabilities
  bs16?: number; // Current Liabilities
  bs17?: number; // Non-current Liabilities
  bs18?: number; // Short-term Debt
  bs19?: number; // Accounts Payable
  bs20?: number; // Accrued Expenses
  bs21?: number; // Other Current Liabilities
  bs22?: number; // Long-term Debt
  bs23?: number; // Deferred Tax Liabilities
  bs24?: number; // Other Non-current Liabilities
  
  // Equity fields (bs101-bs200)
  bs101?: number; // Total Equity
  bs102?: number; // Share Capital
  bs103?: number; // Retained Earnings
  bs104?: number; // Other Equity Components
  bs105?: number; // Treasury Stock
  
  // Additional balance sheet fields
  [key: `bs${number}`]: number | undefined;
}

// Income Statement fields prefix
export interface IncomeStatementRatios {
  // Revenue and Profit fields (is1-is50)
  is1?: number;  // Total Revenue
  is2?: number;  // Cost of Goods Sold
  is3?: number;  // Gross Profit
  is4?: number;  // Operating Expenses
  is5?: number;  // Operating Income
  is6?: number;  // Interest Expense
  is7?: number;  // Interest Income
  is8?: number;  // Other Income/Expenses
  is9?: number;  // Earnings Before Tax
  is10?: number; // Income Tax Expense
  is11?: number; // Net Income
  is12?: number; // Earnings Per Share (EPS)
  is13?: number; // Diluted EPS
  
  // Additional income statement fields
  [key: `is${number}`]: number | undefined;
}

// Operational Ratios fields prefix
export interface OperationalRatios {
  // Profitability Ratios (op1-op20)
  op1?: number;  // Gross Margin %
  op2?: number;  // Operating Margin %
  op3?: number;  // Net Margin %
  op4?: number;  // ROE (Return on Equity)
  op5?: number;  // ROA (Return on Assets)
  op6?: number;  // ROIC (Return on Invested Capital)
  op7?: number;  // ROC (Return on Capital)
  
  // Liquidity Ratios (op8-op15)
  op8?: number;  // Current Ratio
  op9?: number;  // Quick Ratio
  op10?: number; // Cash Ratio
  op11?: number; // Working Capital Ratio
  
  // Leverage Ratios (op16-op25)
  op12?: number; // Debt to Equity
  op13?: number; // Debt to Assets
  op14?: number; // Interest Coverage
  op15?: number; // Equity Multiplier
  
  // Efficiency Ratios (op26-op35)
  op16?: number; // Asset Turnover
  op17?: number; // Inventory Turnover
  op18?: number; // Receivables Turnover
  op19?: number; // Payables Turnover
  op20?: number; // Cash Conversion Cycle
  
  // Valuation Ratios (op36-op48)
  op21?: number; // P/E Ratio
  op22?: number; // P/B Ratio
  op23?: number; // P/S Ratio
  op24?: number; // EV/EBITDA
  op25?: number; // PEG Ratio
  op26?: number; // Dividend Yield
  op27?: number; // Dividend Payout Ratio
  op28?: number; // Book Value Per Share
  op29?: number; // Tangible Book Value Per Share
  op30?: number; // Revenue Per Share
  
  // Additional operational fields
  [key: `op${number}`]: number | undefined;
}

// Industry & Sector Growth Ratios
export interface IndustryGrowthRatios {
  isg1?: number;  // Revenue Growth % (YoY)
  isg2?: number;  // Net Income Growth % (YoY)
  isg3?: number;  // Asset Growth % (YoY)
  isg4?: number;  // Equity Growth % (YoY)
  isg5?: number;  // EPS Growth % (YoY)
  isg6?: number;  // Operating Income Growth % (YoY)
  isg7?: number;  // EBITDA Growth % (YoY)
  isg8?: number;  // Cash Flow Growth % (YoY)
  isg9?: number;  // Market Cap Growth % (YoY)
  isg10?: number; // Dividend Growth % (YoY)
  isg11?: number; // Book Value Growth % (YoY)
  isg12?: number; // Total Revenue Growth % (QoQ)
  isg13?: number; // Net Income Growth % (QoQ)
  
  [key: `isg${number}`]: number | undefined;
}

// Balance Sheet Growth Ratios
export interface BalanceSheetGrowthRatios {
  bsg1?: number;  // Total Assets Growth %
  bsg2?: number;  // Current Assets Growth %
  bsg3?: number;  // Non-current Assets Growth %
  bsg4?: number;  // Total Liabilities Growth %
  bsg5?: number;  // Current Liabilities Growth %
  bsg6?: number;  // Non-current Liabilities Growth %
  bsg7?: number;  // Total Equity Growth %
  bsg8?: number;  // Retained Earnings Growth %
  bsg9?: number;  // Cash Growth %
  bsg10?: number; // Receivables Growth %
  bsg11?: number; // Inventory Growth %
  bsg12?: number; // Property, Plant & Equipment Growth %
  bsg13?: number; // Debt Growth %
  
  [key: `bsg${number}`]: number | undefined;
}

// Complete Financial Ratio Item
export interface FinancialRatioItem extends 
  BalanceSheetRatios, 
  IncomeStatementRatios, 
  OperationalRatios,
  IndustryGrowthRatios,
  BalanceSheetGrowthRatios {
  ticker: string;
  periodDateName: string;
  periodDate: string;
}

// Financial Ratio Data Response
export interface FinancialRatioData {
  industryGroup: string;
  items: FinancialRatioItem[];
}

// API Response
export interface FinancialRatioResponse {
  status: number;
  message: string;
  data: FinancialRatioData;
}

// API Request Parameters
export interface FinancialRatioRequest {
  ticker: string;
  period: Period;
  size: number;
}

// Query Options
export interface FinancialRatioQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
}

// Error Response
export class FinancialRatioError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'FinancialRatioError';
  }
}

// Query Keys for React Query
export const FINANCIAL_RATIO_QUERY_KEYS = {
  all: ['financial-ratios'] as const,
  lists: () => [...FINANCIAL_RATIO_QUERY_KEYS.all, 'list'] as const,
  list: (ticker: string, period: Period, size: number) => 
    [...FINANCIAL_RATIO_QUERY_KEYS.lists(), ticker, period, size] as const,
  detail: (ticker: string, period: Period) => 
    [...FINANCIAL_RATIO_QUERY_KEYS.all, 'detail', ticker, period] as const,
  yearly: (ticker: string) => 
    [...FINANCIAL_RATIO_QUERY_KEYS.all, 'yearly', ticker] as const,
  quarterly: (ticker: string) => 
    [...FINANCIAL_RATIO_QUERY_KEYS.all, 'quarterly', ticker] as const,
} as const;

// Helper types for ratio categories
export type RatioCategory = 
  | 'profitability'
  | 'liquidity'
  | 'leverage'
  | 'efficiency'
  | 'valuation'
  | 'growth';

export interface RatioCategoryData {
  category: RatioCategory;
  label: string;
  metrics: {
    key: string;
    label: string;
    value: number | undefined;
    format: 'percentage' | 'number' | 'currency' | 'ratio';
  }[];
}

// Utility type for chart data
export interface FinancialRatioChartData {
  ticker: string;
  periods: string[];
  series: {
    name: string;
    data: (number | null)[];
    format: 'percentage' | 'number' | 'currency' | 'ratio';
  }[];
}

// Comparison types
export interface FinancialRatioComparison {
  tickers: string[];
  period: Period;
  ratios: {
    key: string;
    label: string;
    values: Record<string, number | undefined>;
  }[];
}

