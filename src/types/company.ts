// Company data types from IQ Insight Service API
export type CompanySector = 'Real Estate' | 'Banking' | 'Technology' | 'Manufacturing' | 'Energy' | 'Healthcare' | 'Consumer Goods' | 'Materials' | 'Telecommunications' | 'Utilities' | 'Financials' | 'Industrials' | 'Other'

export type CompanyRating = 'M-PF' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'NR'

// Base company information
export interface CompanyBasicInfo {
  organCode: string
  ticker: string
  enOrganName: string
  viOrganName: string
  enOrganShortName?: string
  viOrganShortName?: string
  sector: CompanySector
  sectorVn?: string
  industry?: string
  subIndustry?: string
  listingDate: string // ISO date string
  rating?: CompanyRating
  ratingAsOf?: string
  exchange?: string // HSX, HNX, UPCOM
  analyst?: string
  enProfile?: string // HTML content for English profile
  profile?: string // HTML content for Vietnamese profile
  targetPrice?: number
  upsideToTargetPercent?: number
  projectedTSRPercentage?: number
  dividendPerShareTsr?: number
  inCu?: boolean
  icbCodeLv2?: string
  icbCodeLv4?: string
  freeFloat?: number
  prevInsight?: {
    targetPrice: number
    rating: string
    ratingAsOf: string
    analyst: string
    version: string
  }
  isBank?: boolean
  listing?: boolean
  bank?: boolean
}

// Financial metrics
export interface CompanyFinancialMetrics {
  currentPrice: number
  marketCap: number
  numberOfSharesMktCap: number
  averageMatchValue1Month: number
  averageMatchValue3Month?: number
  averageMatchValue6Month?: number
  averageMatchValue1Year?: number
  eps?: number // Earnings per share
  pe?: number // Price to earnings ratio
  pb?: number // Price to book ratio
  roe?: number // Return on equity
  roa?: number // Return on assets
  bookValuePerShare?: number
  dividendYield?: number
  priceToSales?: number
  enterpriseValue?: number
  ebitda?: number
}

// Ownership structure
export interface CompanyOwnership {
  foreignerPercentage: number
  maximumForeignPercentage: number
  statePercentage: number
  freeFloatPercentage: number
  institutionalPercentage?: number
  retailPercentage?: number
  majorShareholdersCount?: number
}

// Trading information
export interface CompanyTradingInfo {
  totalShares: number
  listedShares: number
  outstandingShares?: number
  tradingVolume1Month?: number
  tradingVolume3Month?: number
  averageDailyVolume?: number
  beta?: number
  volatility?: number
  priceRange52Week?: {
    high: number
    low: number
  }
}

// Business performance
export interface CompanyPerformance {
  revenue?: number
  netIncome?: number
  grossProfit?: number
  operatingProfit?: number
  totalAssets?: number
  totalEquity?: number
  totalDebt?: number
  cashAndEquivalents?: number
  quarterlyGrowth?: {
    revenue: number
    netIncome: number
  }
  yearlyGrowth?: {
    revenue: number
    netIncome: number
  }
}

// Complete company data - flat structure matching API response
export interface CompanyData extends CompanyBasicInfo {
  // Financial data (flat structure)
  currentPrice: number
  marketCap: number
  numberOfSharesMktCap: number
  averageMatchValue1Month: number
  averageMatchValue3Month?: number
  averageMatchValue6Month?: number
  averageMatchValue1Year?: number
  eps?: number // Earnings per share
  pe?: number // Price to earnings ratio
  pb?: number // Price to book ratio
  roe?: number // Return on equity
  roa?: number // Return on assets
  bookValuePerShare?: number
  dividendYield?: number
  priceToSales?: number
  enterpriseValue?: number
  ebitda?: number

  // Ownership data (flat structure)
  foreignerPercentage: number
  maximumForeignPercentage: number
  statePercentage: number
  freeFloatPercentage: number
  institutionalPercentage?: number
  retailPercentage?: number
  majorShareholdersCount?: number

  // Trading data (flat structure)
  totalShares?: number
  listedShares?: number
  outstandingShares?: number
  tradingVolume1Month?: number
  tradingVolume3Month?: number
  averageDailyVolume?: number
  beta?: number
  volatility?: number
  priceRange52Week?: {
    high: number
    low: number
  }

  // Performance data (flat structure)
  revenue?: number
  netIncome?: number
  grossProfit?: number
  operatingProfit?: number
  totalAssets?: number
  totalEquity?: number
  totalDebt?: number
  cashAndEquivalents?: number
  quarterlyGrowth?: {
    revenue: number
    netIncome: number
  }
  yearlyGrowth?: {
    revenue: number
    netIncome: number
  }

  lastUpdated?: string
  dataSource?: string
}

// API Response structure
export interface CompanyApiResponse {
  serverDateTime: string
  status: number
  code: number
  msg: string
  successful: boolean
  data: CompanyData
}

// API Request types
export interface GetCompanyRequest {
  ticker: string
  includeFinancials?: boolean
  includeOwnership?: boolean
  includeTrading?: boolean
  includePerformance?: boolean
}

export interface GetMultipleCompaniesRequest {
  tickers: string[]
  includeFinancials?: boolean
  includeOwnership?: boolean
  limit?: number
}

// Search and filter types
export interface CompanySearchRequest {
  query?: string
  sector?: CompanySector
  minMarketCap?: number
  maxMarketCap?: number
  minPrice?: number
  maxPrice?: number
  exchange?: string
  rating?: CompanyRating[]
  page?: number
  limit?: number
  sortBy?: 'marketCap' | 'price' | 'volume' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface CompanyListResponse {
  data: CompanyData[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  message?: string
}

// Error types
export class CompanyError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'CompanyError'
  }
}

// Display helper types
export interface CompanyDisplayInfo {
  ticker: string
  name: string
  shortName?: string
  sector: string
  currentPrice: number
  marketCap: number
  priceChange?: number
  priceChangePercent?: number
  volume?: number
  logo?: string
}

export interface CompanyComparison {
  companies: CompanyData[]
  metrics: Array<{
    key: keyof CompanyFinancialMetrics
    label: string
    format: 'currency' | 'percentage' | 'number' | 'ratio'
  }>
}

// Financial ratios for analysis
export interface FinancialRatios {
  profitability: {
    grossMargin?: number
    operatingMargin?: number
    netMargin?: number
    roe?: number
    roa?: number
    roic?: number
  }
  liquidity: {
    currentRatio?: number
    quickRatio?: number
    cashRatio?: number
  }
  leverage: {
    debtToEquity?: number
    debtToAssets?: number
    equityMultiplier?: number
    interestCoverage?: number
  }
  efficiency: {
    assetTurnover?: number
    inventoryTurnover?: number
    receivablesTurnover?: number
    payablesTurnover?: number
  }
  valuation: {
    pe?: number
    pb?: number
    ps?: number
    ev_ebitda?: number
    peg?: number
  }
}

// Time series data for charts
export interface CompanyTimeSeriesData {
  ticker: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  data: Array<{
    date: string
    price: number
    volume?: number
    marketCap?: number
    [key: string]: unknown
  }>
}

// News and events related to company
export interface CompanyNews {
  id: string
  title: string
  summary: string
  publishedAt: string
  source: string
  url: string
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'high' | 'medium' | 'low'
}

export interface CompanyEvent {
  id: string
  type: 'earnings' | 'dividend' | 'meeting' | 'announcement' | 'other'
  title: string
  date: string
  description?: string
  importance: 'high' | 'medium' | 'low'
}

// Query keys for React Query
export const COMPANY_QUERY_KEYS = {
  all: ['companies'] as const,
  lists: () => [...COMPANY_QUERY_KEYS.all, 'list'] as const,
  list: (filters: CompanySearchRequest) => [...COMPANY_QUERY_KEYS.lists(), filters] as const,
  details: () => [...COMPANY_QUERY_KEYS.all, 'detail'] as const,
  detail: (ticker: string) => [...COMPANY_QUERY_KEYS.details(), ticker] as const,
  financials: (ticker: string) => [...COMPANY_QUERY_KEYS.detail(ticker), 'financials'] as const,
  ownership: (ticker: string) => [...COMPANY_QUERY_KEYS.detail(ticker), 'ownership'] as const,
  performance: (ticker: string) => [...COMPANY_QUERY_KEYS.detail(ticker), 'performance'] as const,
  timeSeries: (ticker: string, period: string) => [...COMPANY_QUERY_KEYS.detail(ticker), 'timeSeries', period] as const,
  comparison: (tickers: string[]) => [...COMPANY_QUERY_KEYS.all, 'comparison', tickers.sort().join(',')] as const,
  sector: (sector: CompanySector) => [...COMPANY_QUERY_KEYS.all, 'sector', sector] as const,
  news: (ticker: string) => [...COMPANY_QUERY_KEYS.detail(ticker), 'news'] as const,
  events: (ticker: string) => [...COMPANY_QUERY_KEYS.detail(ticker), 'events'] as const,
} as const

// Utility types for UI components
export interface CompanyCardProps {
  company: CompanyData
  compact?: boolean
  showFinancials?: boolean
  showOwnership?: boolean
  onClick?: (company: CompanyData) => void
}

export interface CompanyFilterOptions {
  sectors: CompanySector[]
  exchanges: string[]
  ratings: CompanyRating[]
  marketCapRange: {
    min: number
    max: number
  }
  priceRange: {
    min: number
    max: number
  }
}

// Chart data types
export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
  color?: string
}

export interface CompanyChartData {
  ticker: string
  title: string
  data: ChartDataPoint[]
  type: 'line' | 'bar' | 'candlestick' | 'area'
  xAxisLabel?: string
  yAxisLabel?: string
  currency?: boolean
}

// Organization structure types for company relationships
export interface CompanyAffiliate {
  rightOrganCode: string
  rightTicker: string
  rightOrganNameVi: string
  rightOrganNameEn: string
  ownedQuantity: number
  ownedPercentage: number
}

export interface CompanySubsidiary {
  rightOrganCode: string
  rightTicker: string
  rightOrganNameVi: string
  rightOrganNameEn: string
  ownedQuantity: number
  ownedPercentage: number
}

export interface CompanyRelationshipData {
  affiliates: CompanyAffiliate[]
  subsidiaries: CompanySubsidiary[]
}

export interface CompanyRelationshipResponse {
  serverDateTime: string
  status: number
  code: number
  msg: string
  exception: null
  successful: boolean
  data: CompanyRelationshipData
}

// Shareholder structure types
export interface ShareholderStructureData {
  totalShares: number
  statePercentage: number
  foreignPercentage: number
  otherPercentage: number
  foreignerVolume: number
  otherVolume: number
  stateVolume: number
  bodPercentage: number
  institutionPercentage: number
}

export interface ShareholderStructureResponse {
  serverDateTime: string
  status: number
  code: number
  msg: string
  exception: null
  successful: boolean
  data: ShareholderStructureData
}

// Individual shareholder types
export interface CompanyShareholder {
  ownerName: string
  ownerNameEn: string
  ownerCode: string
  positionName: string | null
  positionNameEn: string | null
  quantity: number
  percentage: number
  ownerType: 'CORPORATE' | 'INDIVIDUAL'
  updateDate: string
}

export interface CompanyShareholderResponse {
  serverDateTime: string
  status: number
  code: number
  msg: string
  exception: null
  successful: boolean
  data: CompanyShareholder[]
}

// Export summary type for easy importing
export type {
  CompanyData as Company,
  CompanyApiResponse as CompanyResponse,
  CompanyFinancialMetrics as Financials,
  CompanyOwnership as Ownership,
  CompanyRelationshipData as Relationships,
  ShareholderStructureData as ShareholderStructure,
  CompanyShareholder as Shareholder,
}