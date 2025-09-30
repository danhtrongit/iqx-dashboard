import axios, { type AxiosResponse } from "axios"
import {
  type WatchlistItem,
  type GetWatchlistResponse,
  type GetWatchlistCountResponse,
  type GetAlertsResponse,
  type GetPopularStocksResponse,
  type CheckWatchlistResponse,
  type AddToWatchlistRequest,
  type AddToWatchlistResponse,
  type UpdateWatchlistRequest,
  type UpdateWatchlistResponse,
  type DeleteFromWatchlistResponse,
  type DeleteAllWatchlistResponse,
  type GetPopularStocksRequest,
  type WatchlistStats,
  WatchlistError,
} from "@/types/watchlist"

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api"

// Create axios instance for watchlist API
const watchlistHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
watchlistHttp.interceptors.request.use(
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
watchlistHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    // Convert axios error to WatchlistError
    const message = error.response?.data?.message || error.message || "Có lỗi xảy ra"
    const statusCode = error.response?.status
    const errors = Array.isArray(error.response?.data?.errors)
      ? error.response.data.errors
      : undefined

    throw new WatchlistError(message, statusCode, errors)
  }
)

export class WatchlistService {
  /**
   * Get user's watchlist
   */
  static async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const response: AxiosResponse<GetWatchlistResponse> = await watchlistHttp.get("/watchlist")
      return response.data.data
    } catch (error) {
      throw error instanceof WatchlistError ? error : new WatchlistError("Lấy danh sách yêu thích thất bại")
    }
  }

  /**
   * Get watchlist count
   */
  static async getWatchlistCount(): Promise<number> {
    try {
      const response: AxiosResponse<GetWatchlistCountResponse> = await watchlistHttp.get("/watchlist/count")
      return response.data.count
    } catch (error) {
      throw error instanceof WatchlistError ? error : new WatchlistError("Lấy số lượng yêu thích thất bại")
    }
  }

  /**
   * Get watchlist items with alerts enabled
   */
  static async getAlertsEnabled(): Promise<WatchlistItem[]> {
    try {
      const response: AxiosResponse<GetAlertsResponse> = await watchlistHttp.get("/watchlist/alerts")
      return response.data.data
    } catch (error) {
      throw error instanceof WatchlistError ? error : new WatchlistError("Lấy danh sách cảnh báo thất bại")
    }
  }

  /**
   * Get popular stocks across all users
   */
  static async getPopularStocks(params: GetPopularStocksRequest = {}): Promise<GetPopularStocksResponse> {
    try {
      const response: AxiosResponse<GetPopularStocksResponse> = await watchlistHttp.get("/watchlist/popular", {
        params: {
          limit: params.limit || 10,
        }
      })
      return response.data
    } catch (error) {
      throw error instanceof WatchlistError ? error : new WatchlistError("Lấy danh sách phổ biến thất bại")
    }
  }

  /**
   * Check if symbol is in watchlist
   */
  static async checkInWatchlist(symbolCode: string): Promise<CheckWatchlistResponse> {
    try {
      if (!symbolCode || symbolCode.trim() === '') {
        throw new WatchlistError("Mã cổ phiếu không được để trống")
      }

      const response: AxiosResponse<CheckWatchlistResponse> = await watchlistHttp.get(
        `/watchlist/check/${symbolCode.trim().toUpperCase()}`
      )
      return response.data
    } catch (error) {
      throw error instanceof WatchlistError ? error : new WatchlistError(`Kiểm tra cổ phiếu ${symbolCode} thất bại`)
    }
  }

  /**
   * Add symbol to watchlist
   */
  static async addToWatchlist(data: AddToWatchlistRequest): Promise<AddToWatchlistResponse> {
    try {
      if (!data.symbolCode || data.symbolCode.trim() === '') {
        throw new WatchlistError("Mã cổ phiếu không được để trống")
      }

      const response: AxiosResponse<AddToWatchlistResponse> = await watchlistHttp.post("/watchlist", {
        ...data,
        symbolCode: data.symbolCode.trim().toUpperCase(),
      })
      return response.data
    } catch (error) {
      if (error instanceof WatchlistError) {
        throw error
      }

      // Handle specific HTTP errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new WatchlistError(`Mã chứng khoán ${data.symbolCode} không tồn tại`, 404)
        }
        if (error.response?.status === 409) {
          throw new WatchlistError(`Mã chứng khoán ${data.symbolCode} đã có trong danh sách yêu thích`, 409)
        }
      }

      throw new WatchlistError(`Thêm cổ phiếu ${data.symbolCode} thất bại`)
    }
  }

  /**
   * Update watchlist item
   */
  static async updateWatchlistItem(id: string, data: UpdateWatchlistRequest): Promise<UpdateWatchlistResponse> {
    try {
      if (!id || id.trim() === '') {
        throw new WatchlistError("ID mục yêu thích không được để trống")
      }

      // Validate alert prices if provided
      if (data.alertPriceHigh && data.alertPriceLow && data.alertPriceHigh <= data.alertPriceLow) {
        throw new WatchlistError("Giá cảnh báo cao phải lớn hơn giá cảnh báo thấp", 400)
      }

      const response: AxiosResponse<UpdateWatchlistResponse> = await watchlistHttp.put(`/watchlist/${id}`, data)
      return response.data
    } catch (error) {
      if (error instanceof WatchlistError) {
        throw error
      }

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new WatchlistError("Mục yêu thích không tồn tại hoặc không thuộc về bạn", 404)
        }
        if (error.response?.status === 400) {
          throw new WatchlistError(error.response.data.message || "Dữ liệu không hợp lệ", 400)
        }
      }

      throw new WatchlistError("Cập nhật mục yêu thích thất bại")
    }
  }

  /**
   * Remove item from watchlist by ID
   */
  static async removeFromWatchlist(id: string): Promise<DeleteFromWatchlistResponse> {
    try {
      if (!id || id.trim() === '') {
        throw new WatchlistError("ID mục yêu thích không được để trống")
      }

      const response: AxiosResponse<DeleteFromWatchlistResponse> = await watchlistHttp.delete(`/watchlist/${id}`)
      return response.data
    } catch (error) {
      if (error instanceof WatchlistError) {
        throw error
      }

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new WatchlistError("Mục yêu thích không tồn tại hoặc không thuộc về bạn", 404)
        }
      }

      throw new WatchlistError("Xóa mục yêu thích thất bại")
    }
  }

  /**
   * Remove symbol from watchlist by symbol code
   */
  static async removeBySymbol(symbolCode: string): Promise<DeleteFromWatchlistResponse> {
    try {
      if (!symbolCode || symbolCode.trim() === '') {
        throw new WatchlistError("Mã cổ phiếu không được để trống")
      }

      const response: AxiosResponse<DeleteFromWatchlistResponse> = await watchlistHttp.delete(
        `/watchlist/symbol/${symbolCode.trim().toUpperCase()}`
      )
      return response.data
    } catch (error) {
      if (error instanceof WatchlistError) {
        throw error
      }

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new WatchlistError("Cổ phiếu không có trong danh sách yêu thích", 404)
        }
      }

      throw new WatchlistError(`Xóa cổ phiếu ${symbolCode} thất bại`)
    }
  }

  /**
   * Clear entire watchlist
   */
  static async clearWatchlist(): Promise<DeleteAllWatchlistResponse> {
    try {
      const response: AxiosResponse<DeleteAllWatchlistResponse> = await watchlistHttp.delete("/watchlist")
      return response.data
    } catch (error) {
      throw error instanceof WatchlistError ? error : new WatchlistError("Xóa toàn bộ danh sách thất bại")
    }
  }

  /**
   * Generate watchlist statistics
   */
  static async getWatchlistStats(items: WatchlistItem[]): Promise<WatchlistStats> {
    const stats: WatchlistStats = {
      totalItems: items.length,
      alertsEnabled: items.filter(item => item.isAlertEnabled).length,
      topSectors: [],
      recentlyAdded: items
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    }

    // Count sectors
    const sectorCounts: Record<string, number> = {}
    items.forEach(item => {
      const sector = this.getSectorFromSymbol(item.symbol.symbol) // Simplified sector detection
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1
    })

    stats.topSectors = Object.entries(sectorCounts)
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return stats
  }

  /**
   * Validate symbol code format
   */
  static isValidSymbolCode(symbolCode: string): boolean {
    if (!symbolCode || typeof symbolCode !== 'string') return false

    // Vietnamese stock symbols: 3-4 uppercase letters
    const symbolRegex = /^[A-Z]{3,4}$/
    return symbolRegex.test(symbolCode.trim().toUpperCase())
  }

  /**
   * Format alert price for display
   */
  static formatAlertPrice(price?: number): string {
    if (!price) return 'Không đặt'

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price)
  }

  /**
   * Get board color for UI display
   */
  static getBoardColor(board: string): string {
    const boardColors: Record<string, string> = {
      'HOSE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'HNX': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'UPCOM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    }

    return boardColors[board] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  /**
   * Get symbol type color for UI display
   */
  static getTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
      'STOCK': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'BOND': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'FU': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'ETF': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'CW': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    }

    return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        return `${diffInMinutes} phút trước`
      } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`
      } else if (diffInHours < 168) { // Less than 1 week
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} ngày trước`
      } else {
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    } catch {
      return dateString
    }
  }

  /**
   * Check if alerts are properly configured
   */
  static isAlertValid(item: WatchlistItem): boolean {
    if (!item.isAlertEnabled) return true

    const hasHighAlert = item.alertPriceHigh && item.alertPriceHigh > 0
    const hasLowAlert = item.alertPriceLow && item.alertPriceLow > 0

    if (hasHighAlert && hasLowAlert) {
      return item.alertPriceHigh! > item.alertPriceLow!
    }

    return hasHighAlert || hasLowAlert || false
  }

  /**
   * Get display name for watchlist item
   */
  static getDisplayName(item: WatchlistItem): string {
    return item.customName || item.symbol.organShortName || item.symbol.organName || item.symbol.symbol
  }

  /**
   * Generate export data
   */
  static generateExportData(items: WatchlistItem[], userId: string) {
    return {
      items: items.map(item => ({
        symbol: item.symbol.symbol,
        customName: item.customName,
        notes: item.notes,
        alertPriceHigh: item.alertPriceHigh,
        alertPriceLow: item.alertPriceLow,
        isAlertEnabled: item.isAlertEnabled,
        createdAt: item.createdAt,
      })),
      exportedAt: new Date().toISOString(),
      userInfo: {
        userId,
        totalItems: items.length,
      }
    }
  }

  /**
   * Simple sector detection based on symbol (would be better to get from company API)
   */
  private static getSectorFromSymbol(symbol: string): string {
    // This is a simplified mapping - in real app, you'd get this from company data
    const sectorMap: Record<string, string> = {
      'VCB': 'Banking',
      'VNM': 'Consumer Goods',
      'VIC': 'Real Estate',
      'HPG': 'Materials',
      'FPT': 'Technology',
      'GAS': 'Energy',
      'MSN': 'Consumer Goods',
      'ACB': 'Banking',
      'VJC': 'Transportation',
      'SAB': 'Consumer Goods',
    }

    return sectorMap[symbol] || 'Other'
  }

  /**
   * Batch operations helper
   */
  static async batchAddToWatchlist(symbolCodes: string[]): Promise<{
    successful: string[]
    failed: Array<{ symbol: string; error: string }>
  }> {
    const results = {
      successful: [] as string[],
      failed: [] as Array<{ symbol: string; error: string }>
    }

    // Process in parallel but with error handling
    const promises = symbolCodes.map(async (symbolCode) => {
      try {
        await this.addToWatchlist({ symbolCode })
        results.successful.push(symbolCode)
      } catch (error) {
        results.failed.push({
          symbol: symbolCode,
          error: error instanceof WatchlistError ? error.message : 'Unknown error'
        })
      }
    })

    await Promise.allSettled(promises)
    return results
  }
}

export default WatchlistService