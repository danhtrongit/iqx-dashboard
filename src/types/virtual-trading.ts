// Virtual Trading Types based on VIRTUAL_TRADING_API.md documentation

export type TransactionType = 'BUY' | 'SELL'
export type OrderType = 'MARKET' | 'LIMIT'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

// Core entities
export interface VirtualPortfolio {
  id: string
  userId: string
  cashBalance: number
  totalAssetValue: number
  stockValue: number
  totalProfitLoss: number
  profitLossPercentage: string  // API returns this as string like "-0.0515"
  totalTransactions: number
  successfulTrades: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  holdings: VirtualHolding[]
}

export interface VirtualHolding {
  id: string
  portfolioId?: string
  symbolCode: string
  symbolName: string
  quantity: number
  averagePrice: number
  currentPrice: number
  currentValue: number
  unrealizedProfitLoss: number
  profitLossPercentage: string  // API returns this as string like "-0.2433"
  totalCost: number
  lastPriceUpdate?: string
  createdAt?: string
  updatedAt?: string
}

export interface VirtualTransaction {
  id: string
  portfolioId: string
  symbolCode: string
  transactionType: TransactionType
  quantity: number
  pricePerShare: number
  totalAmount: number
  fee: number
  tax: number
  netAmount: number
  status: TransactionStatus
  failureReason?: string
  marketData?: Record<string, any>
  portfolioBalanceBefore: number
  portfolioBalanceAfter: number
  createdAt: string
  executedAt?: string
}

export interface StockPrice {
  symbol: string
  currentPrice: number
  timestamp: string
}

// Leaderboard types - Updated to match actual API response
export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  totalAssetValue: number
  profitLoss: number  // API returns profitLoss, not totalProfitLoss
  profitLossPercentage: string  // API returns this as string
  totalTransactions: number
  successfulTrades: number
  cashBalance: number
  stockValue: number
  createdAt: string
  // These fields might not be present in API response, keeping for backward compatibility
  initialBalance?: number
  totalProfitLoss?: number  // Fallback field name
  winRate?: number  // Will be calculated from successfulTrades/totalTransactions
}

// API Request types
export interface CreatePortfolioRequest {
  // No body required - uses JWT token for user identification
}

export interface BuyStockRequest {
  symbolCode: string
  quantity: number
  orderType: OrderType
  limitPrice?: number
}

export interface SellStockRequest {
  symbolCode: string
  quantity: number
  orderType: OrderType
  limitPrice?: number
}

export interface GetTransactionsRequest {
  page?: number
  limit?: number
  type?: TransactionType
}

export interface GetLeaderboardRequest {
  limit?: number
  sortBy?: 'value' | 'percentage'
}

// API Response types
export interface ApiResponse<T = any> {
  data: T
  message: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreatePortfolioResponse extends ApiResponse<{
  id: string
  cashBalance: number
  totalAssetValue: number
}> {}

export interface GetPortfolioResponse extends ApiResponse<VirtualPortfolio> {}

export interface BuyStockResponse {
  transactionId: string
  symbolCode: string
  quantity: number
  pricePerShare: number
  totalAmount: number
  fee: number
  netAmount: number
  message: string
}

export interface SellStockResponse {
  transactionId: string
  symbolCode: string
  quantity: number
  pricePerShare: number
  totalAmount: number
  fee: number
  tax: number
  netAmount: number
  message: string
}

export interface GetTransactionsResponse extends PaginatedResponse<VirtualTransaction> {}

export interface GetPriceResponse extends ApiResponse<StockPrice> {}

export interface GetLeaderboardResponse extends ApiResponse<LeaderboardEntry[]> {}

// Error types
export class VirtualTradingError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'VirtualTradingError'
  }
}

// Query key types for React Query
export const VIRTUAL_TRADING_QUERY_KEYS = {
  all: ['virtual-trading'] as const,
  portfolio: () => [...VIRTUAL_TRADING_QUERY_KEYS.all, 'portfolio'] as const,
  transactions: () => [...VIRTUAL_TRADING_QUERY_KEYS.all, 'transactions'] as const,
  transactionsList: (params: GetTransactionsRequest) =>
    [...VIRTUAL_TRADING_QUERY_KEYS.transactions(), params] as const,
  price: (symbol: string) => [...VIRTUAL_TRADING_QUERY_KEYS.all, 'price', symbol] as const,
  leaderboard: () => [...VIRTUAL_TRADING_QUERY_KEYS.all, 'leaderboard'] as const,
  leaderboardList: (params: GetLeaderboardRequest) =>
    [...VIRTUAL_TRADING_QUERY_KEYS.leaderboard(), params] as const,
} as const

// UI specific types
export interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  symbolCode: string
  symbolName: string
  currentPrice: number
  mode: 'BUY' | 'SELL'
  maxQuantity?: number // For sell orders
  cashBalance?: number // For buy orders
}

export interface TradingFormData {
  quantity: number
  orderType: OrderType
  limitPrice?: number
}

// Constants
export const INITIAL_PORTFOLIO_BALANCE = 10_000_000_000 // 10 billion VND
export const TRADING_FEE_RATE = 0.0015 // 0.15%
export const SELLING_TAX_RATE = 0.001 // 0.1%

// Helper types
export interface TradingCalculation {
  totalAmount: number
  fee: number
  tax: number
  netAmount: number
}

export interface PortfolioSummary {
  totalValue: number
  cashBalance: number
  stockValue: number
  totalPnL: number
  pnlPercentage: number
  winRate: number
}