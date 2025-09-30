import axios, { type AxiosResponse } from "axios"
import {
  type CreatePortfolioRequest,
  type CreatePortfolioResponse,
  type GetPortfolioResponse,
  type BuyStockRequest,
  type BuyStockResponse,
  type SellStockRequest,
  type SellStockResponse,
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  type GetPriceResponse,
  type GetLeaderboardRequest,
  type GetLeaderboardResponse,
  type TradingCalculation,
  VirtualTradingError,
  TRADING_FEE_RATE,
  SELLING_TAX_RATE,
} from "@/types/virtual-trading"

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api"

// Create axios instance for virtual trading API
const virtualTradingHttp = axios.create({
  baseURL: `${API_BASE_URL}/virtual-trading`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
virtualTradingHttp.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
virtualTradingHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Có lỗi xảy ra"
    const statusCode = error.response?.status
    const errors = Array.isArray(error.response?.data?.message)
      ? error.response.data.message
      : undefined

    throw new VirtualTradingError(message, statusCode, errors)
  }
)

export class VirtualTradingService {
  /**
   * Create a new virtual trading portfolio
   */
  static async createPortfolio(): Promise<CreatePortfolioResponse> {
    try {
      const response: AxiosResponse<CreatePortfolioResponse> = await virtualTradingHttp.post("/portfolio")
      return response.data
    } catch (error) {
      throw error instanceof VirtualTradingError
        ? error
        : new VirtualTradingError("Tạo portfolio thất bại")
    }
  }

  /**
   * Get portfolio information with holdings
   */
  static async getPortfolio(): Promise<GetPortfolioResponse> {
    try {
      const response: AxiosResponse<GetPortfolioResponse> = await virtualTradingHttp.get("/portfolio")
      return response.data
    } catch (error) {
      throw error instanceof VirtualTradingError
        ? error
        : new VirtualTradingError("Lấy thông tin portfolio thất bại")
    }
  }

  /**
   * Buy stock with market or limit order
   */
  static async buyStock(request: BuyStockRequest): Promise<BuyStockResponse> {
    try {
      // Validate request
      this.validateBuyRequest(request)

      const response: AxiosResponse<BuyStockResponse> = await virtualTradingHttp.post("/buy", request)
      return response.data
    } catch (error) {
      throw error instanceof VirtualTradingError
        ? error
        : new VirtualTradingError(`Mua cổ phiếu ${request.symbolCode} thất bại`)
    }
  }

  /**
   * Sell stock with market or limit order
   */
  static async sellStock(request: SellStockRequest): Promise<SellStockResponse> {
    try {
      // Validate request
      this.validateSellRequest(request)

      const response: AxiosResponse<SellStockResponse> = await virtualTradingHttp.post("/sell", request)
      return response.data
    } catch (error) {
      throw error instanceof VirtualTradingError
        ? error
        : new VirtualTradingError(`Bán cổ phiếu ${request.symbolCode} thất bại`)
    }
  }

  /**
   * Get transaction history with pagination
   */
  static async getTransactions(params: GetTransactionsRequest = {}): Promise<GetTransactionsResponse> {
    try {
      const response: AxiosResponse<GetTransactionsResponse> = await virtualTradingHttp.get("/transactions", {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          type: params.type,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof VirtualTradingError
        ? error
        : new VirtualTradingError("Lấy lịch sử giao dịch thất bại")
    }
  }

  /**
   * Get real-time stock price
   */
  static async getStockPrice(symbol: string): Promise<GetPriceResponse> {
    try {
      if (!symbol || typeof symbol !== 'string') {
        throw new VirtualTradingError("Mã chứng khoán không hợp lệ")
      }

      const response: AxiosResponse<any> = await virtualTradingHttp.get(`/price/${symbol.toUpperCase()}`)

      // Handle both formats: { data: {...} } and flat { symbol, currentPrice, ... }
      const responseData = response.data

      if (responseData.data) {
        // Standard format with data wrapper
        return responseData as GetPriceResponse
      } else {
        // Flat format - wrap it
        return {
          data: {
            symbol: responseData.symbol,
            currentPrice: responseData.currentPrice,
            timestamp: responseData.timestamp,
          },
          message: responseData.message || 'Lấy giá thành công',
        }
      }
    } catch (error) {
      throw error instanceof VirtualTradingError
        ? error
        : new VirtualTradingError(`Lấy giá cổ phiếu ${symbol} thất bại`)
    }
  }

  /**
   * Get leaderboard rankings
   */
  static async getLeaderboard(params: GetLeaderboardRequest = {}): Promise<GetLeaderboardResponse> {
    try {
      const response: AxiosResponse<GetLeaderboardResponse> = await virtualTradingHttp.get("/leaderboard", {
        params: {
          limit: Math.min(params.limit || 50, 100), // Max 100
          sortBy: params.sortBy || 'percentage',
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof VirtualTradingError
        ? error
        : new VirtualTradingError("Lấy bảng xếp hạng thất bại")
    }
  }

  /**
   * Calculate trading fees and amounts
   */
  static calculateTradingCost(
    totalAmount: number,
    transactionType: 'BUY' | 'SELL'
  ): TradingCalculation {
    const fee = Math.round(totalAmount * TRADING_FEE_RATE)
    const tax = transactionType === 'SELL' ? Math.round(totalAmount * SELLING_TAX_RATE) : 0

    const netAmount = transactionType === 'BUY'
      ? totalAmount + fee  // Cost includes fee for buying
      : totalAmount - fee - tax  // Revenue minus fees and tax for selling

    return {
      totalAmount,
      fee,
      tax,
      netAmount,
    }
  }

  /**
   * Check if user has sufficient balance for purchase
   */
  static canAffordPurchase(
    cashBalance: number,
    quantity: number,
    pricePerShare: number
  ): { canAfford: boolean; required: number; shortfall: number } {
    const totalAmount = quantity * pricePerShare
    const calculation = this.calculateTradingCost(totalAmount, 'BUY')
    const required = calculation.netAmount
    const shortfall = Math.max(0, required - cashBalance)

    return {
      canAfford: cashBalance >= required,
      required,
      shortfall,
    }
  }

  /**
   * Get maximum quantity that can be purchased with available cash
   */
  static getMaxPurchaseQuantity(cashBalance: number, pricePerShare: number): number {
    if (pricePerShare <= 0) return 0

    // Binary search for max quantity considering fees
    let low = 0
    let high = Math.floor(cashBalance / pricePerShare) + 100 // Add buffer for fees
    let maxQuantity = 0

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const { canAfford } = this.canAffordPurchase(cashBalance, mid, pricePerShare)

      if (canAfford) {
        maxQuantity = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return maxQuantity
  }

  /**
   * Format currency amount in Vietnamese Dong
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Format percentage with proper signs and colors, handling string inputs from API
   */
  static formatPercentage(
    percentage: number | string,
    options: { decimals?: number; showSign?: boolean } = {}
  ): { text: string; color: string } {
    const decimals = options.decimals ?? 2
    const showSign = options.showSign ?? true

    // Convert to number if it's a string
    const numPercentage = typeof percentage === 'string' ? Number(percentage) : percentage

    const sign = numPercentage > 0 ? '+' : ''
    const text = `${showSign ? sign : ''}${numPercentage.toFixed(decimals)}%`

    const color = numPercentage > 0
      ? 'text-green-600'
      : numPercentage < 0
        ? 'text-red-600'
        : 'text-gray-600'

    return { text, color }
  }

  /**
   * Safely convert API percentage string to number
   */
  static parsePercentage(percentage: string | number | null | undefined): number {
    if (percentage === null || percentage === undefined) return 0
    if (typeof percentage === 'number') return percentage
    return Number(percentage) || 0
  }

  /**
   * Calculate portfolio allocation percentages
   */
  static calculatePortfolioAllocation(
    holdings: Array<{ currentValue: number; symbolCode: string }>,
    cashBalance: number
  ): Array<{ symbol: string; percentage: number; value: number }> {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0) + cashBalance

    if (totalValue === 0) return []

    const stockAllocations = holdings.map(h => ({
      symbol: h.symbolCode,
      percentage: (h.currentValue / totalValue) * 100,
      value: h.currentValue,
    }))

    const cashAllocation = {
      symbol: 'CASH',
      percentage: (cashBalance / totalValue) * 100,
      value: cashBalance,
    }

    return [...stockAllocations, cashAllocation].sort((a, b) => b.value - a.value)
  }

  /**
   * Calculate win rate from successful trades
   */
  static calculateWinRate(successfulTrades: number, totalTransactions: number): number {
    if (totalTransactions === 0) return 0
    return (successfulTrades / totalTransactions) * 100
  }

  /**
   * Get portfolio performance metrics
   */
  static getPortfolioMetrics(portfolio: {
    totalAssetValue: number
    totalProfitLoss: number
    profitLossPercentage: string | number
    totalTransactions: number
    successfulTrades: number
    cashBalance: number
    stockValue: number
  }): {
    totalAssetValue: number
    cashBalance: number
    stockValue: number
    totalPnL: number
    pnlPercentage: number
    winRate: number
    totalTransactions: number
    successfulTrades: number
  } {
    return {
      totalAssetValue: portfolio.totalAssetValue,
      cashBalance: portfolio.cashBalance,
      stockValue: portfolio.stockValue,
      totalPnL: portfolio.totalProfitLoss,
      pnlPercentage: this.parsePercentage(portfolio.profitLossPercentage),
      winRate: this.calculateWinRate(portfolio.successfulTrades, portfolio.totalTransactions),
      totalTransactions: portfolio.totalTransactions,
      successfulTrades: portfolio.successfulTrades,
    }
  }

  // Private validation methods
  private static validateBuyRequest(request: BuyStockRequest): void {
    if (!request.symbolCode || typeof request.symbolCode !== 'string') {
      throw new VirtualTradingError("Mã chứng khoán không hợp lệ")
    }

    if (!request.quantity || request.quantity < 1 || !Number.isInteger(request.quantity)) {
      throw new VirtualTradingError("Số lượng phải là số nguyên dương")
    }

    if (request.quantity > 1_000_000) {
      throw new VirtualTradingError("Số lượng tối đa là 1,000,000 cổ phiếu")
    }

    if (!['MARKET', 'LIMIT'].includes(request.orderType)) {
      throw new VirtualTradingError("Loại lệnh không hợp lệ")
    }

    if (request.orderType === 'LIMIT') {
      if (!request.limitPrice || request.limitPrice <= 0) {
        throw new VirtualTradingError("Giá giới hạn phải lớn hơn 0")
      }
    }
  }

  private static validateSellRequest(request: SellStockRequest): void {
    if (!request.symbolCode || typeof request.symbolCode !== 'string') {
      throw new VirtualTradingError("Mã chứng khoán không hợp lệ")
    }

    if (!request.quantity || request.quantity < 1 || !Number.isInteger(request.quantity)) {
      throw new VirtualTradingError("Số lượng phải là số nguyên dương")
    }

    if (!['MARKET', 'LIMIT'].includes(request.orderType)) {
      throw new VirtualTradingError("Loại lệnh không hợp lệ")
    }

    if (request.orderType === 'LIMIT') {
      if (!request.limitPrice || request.limitPrice <= 0) {
        throw new VirtualTradingError("Giá giới hạn phải lớn hơn 0")
      }
    }
  }
}

export default VirtualTradingService