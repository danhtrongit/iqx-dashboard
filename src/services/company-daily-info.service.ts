import axios, { type AxiosResponse } from "axios"
import {
  type CompanyDailyInfoResponse,
  type GetCompanyDailyInfoRequest,
  type ForeignNetEntry,
  CompanyDailyInfoError,
} from "@/types/company-daily-info"

// Company API base URL
const COMPANY_API_BASE_URL = "https://proxy.iqx.vn/proxy/iq/api/iq-insight-service/v1"

// Create axios instance for company daily info API
const companyDailyInfoHttp = axios.create({
  baseURL: COMPANY_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Response interceptor for error handling
companyDailyInfoHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    // Convert axios error to CompanyDailyInfoError
    const message = error.response?.data?.msg ||
                   error.response?.data?.message ||
                   error.message ||
                   "Có lỗi xảy ra"
    const statusCode = error.response?.status
    const errors = Array.isArray(error.response?.data?.errors)
      ? error.response.data.errors
      : undefined

    throw new CompanyDailyInfoError(message, statusCode, errors)
  }
)

export class CompanyDailyInfoService {
  /**
   * Get company daily info (foreign net data) by ticker
   */
  static async getCompanyDailyInfo(ticker: string): Promise<ForeignNetEntry[]> {
    try {
      if (!ticker || ticker.trim() === '') {
        throw new CompanyDailyInfoError("Mã cổ phiếu không được để trống")
      }

      const response: AxiosResponse<CompanyDailyInfoResponse> = await companyDailyInfoHttp.get(
        `/company/${ticker.trim().toUpperCase()}/daily-info`
      )

      if (!response.data.successful) {
        throw new CompanyDailyInfoError(
          response.data.msg || "Không thể lấy thông tin daily info",
          response.data.status
        )
      }

      return response.data.data
    } catch (error) {
      if (error instanceof CompanyDailyInfoError) {
        throw error
      }

      // Handle specific HTTP errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new CompanyDailyInfoError(`Không tìm thấy daily info cho mã: ${ticker}`, 404)
        }
        if (error.response?.status === 400) {
          throw new CompanyDailyInfoError("Mã cổ phiếu không hợp lệ", 400)
        }
        if (error.response?.status === 429) {
          throw new CompanyDailyInfoError("Quá nhiều yêu cầu. Vui lòng thử lại sau.", 429)
        }
      }

      throw new CompanyDailyInfoError(
        `Lấy daily info thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get company daily info with formatted data
   */
  static async getCompanyDailyInfoFormatted(ticker: string) {
    try {
      const data = await this.getCompanyDailyInfo(ticker)

      return {
        ticker: ticker.toUpperCase(),
        data: data.map(entry => ({
          date: entry.tradingDate,
          value: entry.foreignNet,
          formattedValue: this.formatForeignNet(entry.foreignNet),
          color: this.getForeignNetColor(entry.foreignNet)
        })),
        summary: {
          totalInflow: data.filter(entry => entry.foreignNet > 0).reduce((sum, entry) => sum + entry.foreignNet, 0),
          totalOutflow: data.filter(entry => entry.foreignNet < 0).reduce((sum, entry) => sum + Math.abs(entry.foreignNet), 0),
          netChange: data.reduce((sum, entry) => sum + entry.foreignNet, 0),
          periods: {
            start: data.length > 0 ? data[data.length - 1].tradingDate : '',
            end: data.length > 0 ? data[0].tradingDate : ''
          }
        }
      }
    } catch (error) {
      throw error instanceof CompanyDailyInfoError
        ? error
        : new CompanyDailyInfoError("Lấy daily info formatted thất bại")
    }
  }

  /**
   * Validate ticker format
   */
  static isValidTicker(ticker: string): boolean {
    if (!ticker || typeof ticker !== 'string') return false

    // Vietnamese stock tickers: 3-4 uppercase letters
    const tickerRegex = /^[A-Z]{3,4}$/
    return tickerRegex.test(ticker.trim())
  }

  /**
   * Format foreign net value for display
   */
  static formatForeignNet(value: number): string {
    if (value === 0) return '0'

    const absValue = Math.abs(value)
    const isNegative = value < 0
    const sign = isNegative ? '-' : '+'

    if (absValue >= 1e9) {
      return `${sign}${(absValue / 1e9).toFixed(1)} tỷ`
    } else if (absValue >= 1e6) {
      return `${sign}${(absValue / 1e6).toFixed(1)} triệu`
    } else if (absValue >= 1e3) {
      return `${sign}${(absValue / 1e3).toFixed(1)} nghìn`
    } else {
      return `${sign}${absValue.toLocaleString('vi-VN')}`
    }
  }

  /**
   * Get color classification for foreign net value
   */
  static getForeignNetColor(value: number): 'positive' | 'negative' | 'neutral' {
    if (value > 0) return 'positive'
    if (value < 0) return 'negative'
    return 'neutral'
  }

  /**
   * Filter foreign net data by date range
   */
  static filterByDateRange(
    data: ForeignNetEntry[],
    startDate: string,
    endDate: string
  ): ForeignNetEntry[] {
    const start = new Date(startDate)
    const end = new Date(endDate)

    return data.filter(entry => {
      const entryDate = new Date(entry.tradingDate)
      return entryDate >= start && entryDate <= end
    })
  }

  /**
   * Calculate foreign net statistics
   */
  static calculateStatistics(data: ForeignNetEntry[]) {
    if (data.length === 0) {
      return {
        totalInflow: 0,
        totalOutflow: 0,
        netChange: 0,
        averageDaily: 0,
        positivedays: 0,
        negativeDays: 0,
        neutralDays: 0
      }
    }

    const totalInflow = data.filter(entry => entry.foreignNet > 0)
                           .reduce((sum, entry) => sum + entry.foreignNet, 0)

    const totalOutflow = data.filter(entry => entry.foreignNet < 0)
                            .reduce((sum, entry) => sum + Math.abs(entry.foreignNet), 0)

    const netChange = data.reduce((sum, entry) => sum + entry.foreignNet, 0)

    const averageDaily = netChange / data.length

    const positiveDays = data.filter(entry => entry.foreignNet > 0).length
    const negativeDays = data.filter(entry => entry.foreignNet < 0).length
    const neutralDays = data.filter(entry => entry.foreignNet === 0).length

    return {
      totalInflow,
      totalOutflow,
      netChange,
      averageDaily,
      positiveDays,
      negativeDays,
      neutralDays
    }
  }

  /**
   * Get recent foreign net trend (last 7 days vs previous 7 days)
   */
  static getTrend(data: ForeignNetEntry[]) {
    if (data.length < 14) {
      return {
        trend: 'insufficient-data' as const,
        change: 0,
        changePercent: 0
      }
    }

    // Data is sorted by date descending, so first 7 are most recent
    const recent7Days = data.slice(0, 7)
    const previous7Days = data.slice(7, 14)

    const recentSum = recent7Days.reduce((sum, entry) => sum + entry.foreignNet, 0)
    const previousSum = previous7Days.reduce((sum, entry) => sum + entry.foreignNet, 0)

    const change = recentSum - previousSum
    const changePercent = previousSum !== 0 ? (change / Math.abs(previousSum)) * 100 : 0

    let trend: 'increasing' | 'decreasing' | 'stable'
    if (Math.abs(changePercent) < 5) {
      trend = 'stable'
    } else if (change > 0) {
      trend = 'increasing'
    } else {
      trend = 'decreasing'
    }

    return {
      trend,
      change,
      changePercent
    }
  }
}

export default CompanyDailyInfoService