import axios, { type AxiosResponse } from "axios"
import {
  type GetSymbolsRequest,
  type GetSymbolsResponse,
  type GetAllSymbolsRequest,
  type GetAllSymbolsResponse,
  type GetSymbolResponse,
  type GetSymbolCountResponse,
  type SyncSymbolsResponse,
  type Symbol,
  type SymbolWithPrice,
  SymbolsError,
} from "@/types/symbols"

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api"

// Create axios instance for symbols API
const symbolsHttp = axios.create({
  baseURL: `${API_BASE_URL}/symbols`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
symbolsHttp.interceptors.request.use(
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
symbolsHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Có lỗi xảy ra"
    const statusCode = error.response?.status
    const errors = Array.isArray(error.response?.data?.message)
      ? error.response.data.message
      : undefined

    throw new SymbolsError(message, statusCode, errors)
  }
)

export class SymbolsService {
  /**
   * Get paginated list of symbols with search and filters
   */
  static async getSymbols(params: GetSymbolsRequest = {}): Promise<GetSymbolsResponse> {
    try {
      const response: AxiosResponse<GetSymbolsResponse> = await symbolsHttp.get("/search", {
        params: {
          page: params.page || 1,
          limit: Math.min(params.limit || 20, 100), // Max 100 per page
          search: params.search,
          symbol: params.symbol,
          type: params.type,
          board: params.board,
          includePrices: params.includePrices || false,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof SymbolsError
        ? error
        : new SymbolsError("Lấy danh sách chứng khoán thất bại")
    }
  }

  /**
   * Get all symbols without pagination (use with caution)
   */
  static async getAllSymbols(params: GetAllSymbolsRequest = {}): Promise<GetAllSymbolsResponse> {
    try {
      const response: AxiosResponse<GetAllSymbolsResponse> = await symbolsHttp.get("/all", {
        params: {
          search: params.search,
          symbol: params.symbol,
          type: params.type,
          board: params.board,
          includePrices: params.includePrices || false,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof SymbolsError
        ? error
        : new SymbolsError("Lấy tất cả chứng khoán thất bại")
    }
  }

  /**
   * Search symbols (alias for getSymbols)
   */
  static async searchSymbols(params: GetSymbolsRequest = {}): Promise<GetSymbolsResponse> {
    try {
      const response: AxiosResponse<GetSymbolsResponse> = await symbolsHttp.get("/search", {
        params: {
          page: params.page || 1,
          limit: Math.min(params.limit || 20, 100),
          search: params.search,
          symbol: params.symbol,
          type: params.type,
          board: params.board,
          includePrices: params.includePrices || false,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof SymbolsError
        ? error
        : new SymbolsError("Tìm kiếm chứng khoán thất bại")
    }
  }

  /**
   * Get symbol details by symbol code
   */
  static async getSymbol(symbol: string, includePrices = false): Promise<GetSymbolResponse> {
    try {
      if (!symbol || typeof symbol !== 'string') {
        throw new SymbolsError("Mã chứng khoán không hợp lệ")
      }

      const response: AxiosResponse<GetSymbolResponse> = await symbolsHttp.get(`/${symbol.toUpperCase()}`, {
        params: {
          includePrices: includePrices || false,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof SymbolsError
        ? error
        : new SymbolsError(`Lấy thông tin chứng khoán ${symbol} thất bại`)
    }
  }

  /**
   * Get total count of symbols
   */
  static async getSymbolsCount(): Promise<GetSymbolCountResponse> {
    try {
      const response: AxiosResponse<GetSymbolCountResponse> = await symbolsHttp.get("/count")
      return response.data
    } catch (error) {
      throw error instanceof SymbolsError
        ? error
        : new SymbolsError("Lấy số lượng chứng khoán thất bại")
    }
  }

  /**
   * Sync symbols data from VietCap (admin only)
   */
  static async syncSymbols(): Promise<SyncSymbolsResponse> {
    try {
      const response: AxiosResponse<SyncSymbolsResponse> = await symbolsHttp.post("/sync")
      return response.data
    } catch (error) {
      throw error instanceof SymbolsError
        ? error
        : new SymbolsError("Đồng bộ dữ liệu chứng khoán thất bại")
    }
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
   * Format number with thousands separator
   */
  static formatNumber(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  /**
   * Get symbol type display name in Vietnamese
   */
  static getTypeDisplayName(type: string): string {
    const typeMap: Record<string, string> = {
      'STOCK': 'Cổ phiếu',
      'BOND': 'Trái phiếu',
      'FU': 'Phái sinh',
      'FUND': 'Quỹ',
      'ETF': 'ETF',
    }
    return typeMap[type] || type
  }

  /**
   * Get board display name in Vietnamese
   */
  static getBoardDisplayName(board: string): string {
    const boardMap: Record<string, string> = {
      'HSX': 'Sở GDCK TP.HCM',
      'HNX': 'Sở GDCK Hà Nội',
      'UPCOM': 'UPCoM',
    }
    return boardMap[board] || board
  }

  /**
   * Check if symbol has price data
   */
  static hasPrice(symbol: Symbol | SymbolWithPrice): symbol is SymbolWithPrice {
    return 'currentPrice' in symbol && typeof symbol.currentPrice === 'number'
  }

  /**
   * Get symbol display name (prefer Vietnamese name)
   */
  static getDisplayName(symbol: Symbol | SymbolWithPrice): string {
    return symbol.organ_name || symbol.organ_short_name || symbol.en_organ_name || symbol.symbol
  }

  /**
   * Get symbol short name for display
   */
  static getShortName(symbol: Symbol | SymbolWithPrice): string {
    return symbol.organ_short_name || symbol.organ_name || symbol.symbol
  }

  /**
   * Check if symbol is a stock
   */
  static isStock(symbol: Symbol | SymbolWithPrice): boolean {
    return symbol.type === 'STOCK'
  }

  /**
   * Format percentage change with color indication
   */
  static formatPercentageChange(percentage: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'always'
    }).format(percentage / 100)
  }

  /**
   * Format volume with proper unit
   */
  static formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  /**
   * Get price change color class
   */
  static getPriceChangeColor(change: number): string {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-yellow-600'
  }

  /**
   * Get percentage change with proper formatting and color
   */
  static getFormattedPercentageChange(percentage: number): { text: string; colorClass: string } {
    const formattedText = this.formatPercentageChange(percentage)
    const colorClass = this.getPriceChangeColor(percentage)
    return { text: formattedText, colorClass }
  }

  /**
   * Check if symbol is traded on main boards (HSX/HNX)
   */
  static isMainBoard(symbol: Symbol | SymbolWithPrice): boolean {
    return symbol.board === 'HSX' || symbol.board === 'HNX'
  }
}

export default SymbolsService