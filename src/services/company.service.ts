import axios, { type AxiosResponse } from "axios"
import {
  type CompanyData,
  type CompanyApiResponse,
  type GetMultipleCompaniesRequest,
  type CompanySearchRequest,
  type CompanyListResponse,
  type CompanyTimeSeriesData,
  type CompanyNews,
  type CompanyEvent,
  type FinancialRatios,
  type CompanyRelationshipResponse,
  type ShareholderStructureResponse,
  type CompanyShareholderResponse,
  CompanyError,
} from "@/types/company"

// Company API base URL
const COMPANY_API_BASE_URL = "https://proxy.iqx.vn/proxy/iq/api/iq-insight-service/v1"
const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api"

// Create axios instance for company API
const companyHttp = axios.create({
  baseURL: COMPANY_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Create axios instance for internal API (if needed for additional company operations)
const internalCompanyHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token if available for internal API
internalCompanyHttp.interceptors.request.use(
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
const createErrorInterceptor = (httpInstance: typeof axios) => {
  httpInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Convert axios error to CompanyError
      const message = error.response?.data?.msg ||
                     error.response?.data?.message ||
                     error.message ||
                     "Có lỗi xảy ra"
      const statusCode = error.response?.status
      const errors = Array.isArray(error.response?.data?.errors)
        ? error.response.data.errors
        : undefined

      throw new CompanyError(message, statusCode, errors)
    }
  )
}

// Apply error interceptors
createErrorInterceptor(companyHttp)
createErrorInterceptor(internalCompanyHttp)

export class CompanyService {
  /**
   * Get company information by ticker
   */
  static async getCompany(ticker: string): Promise<CompanyData> {
    try {
      if (!ticker || ticker.trim() === '') {
        throw new CompanyError("Mã cổ phiếu không được để trống")
      }

      const response: AxiosResponse<CompanyApiResponse> = await companyHttp.get(`/company/${ticker.trim().toUpperCase()}`)

      if (!response.data.successful) {
        throw new CompanyError(response.data.msg || "Không thể lấy thông tin công ty", response.data.status)
      }

      return response.data.data
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error
      }

      // Handle specific HTTP errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new CompanyError(`Không tìm thấy công ty với mã: ${ticker}`, 404)
        }
        if (error.response?.status === 400) {
          throw new CompanyError("Mã cổ phiếu không hợp lệ", 400)
        }
        if (error.response?.status === 429) {
          throw new CompanyError("Quá nhiều yêu cầu. Vui lòng thử lại sau.", 429)
        }
      }

      throw new CompanyError(`Lấy thông tin công ty thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get multiple companies by tickers
   */
  static async getMultipleCompanies(
    tickers: string[],
    options: Omit<GetMultipleCompaniesRequest, 'tickers'> = {}
  ): Promise<CompanyData[]> {
    try {
      if (!tickers || tickers.length === 0) {
        return []
      }

      const validTickers = tickers
        .map(ticker => ticker.trim().toUpperCase())
        .filter(ticker => ticker.length > 0)

      if (validTickers.length === 0) {
        return []
      }

      // Process in batches to avoid API limits
      const batchSize = options.limit || 10
      const batches = []

      for (let i = 0; i < validTickers.length; i += batchSize) {
        batches.push(validTickers.slice(i, i + batchSize))
      }

      const results: CompanyData[] = []

      for (const batch of batches) {
        const promises = batch.map(ticker =>
          this.getCompany(ticker).catch(error => {
            return null
          })
        )

        const batchResults = await Promise.all(promises)
        const validResults = batchResults.filter((result): result is CompanyData => result !== null)
        results.push(...validResults)
      }

      return results
    } catch (error) {
      throw error instanceof CompanyError ? error : new CompanyError("Lấy thông tin nhiều công ty thất bại")
    }
  }

  /**
   * Search companies (using internal API if available)
   */
  static async searchCompanies(params: CompanySearchRequest = {}): Promise<CompanyListResponse> {
    try {
      const response: AxiosResponse<CompanyListResponse> = await internalCompanyHttp.get("/companies/search", {
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 20,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof CompanyError ? error : new CompanyError("Tìm kiếm công ty thất bại")
    }
  }

  /**
   * Get companies by sector
   */
  static async getCompaniesBySector(sector: string, limit = 20): Promise<CompanyData[]> {
    try {
      const response: AxiosResponse<CompanyListResponse> = await internalCompanyHttp.get(`/companies/sector/${sector}`, {
        params: { limit }
      })

      return response.data.data
    } catch (error) {
      throw error instanceof CompanyError ? error : new CompanyError(`Lấy danh sách công ty ngành ${sector} thất bại`)
    }
  }

  /**
   * Get top companies by market cap
   */
  static async getTopCompanies(limit = 50): Promise<CompanyData[]> {
    try {
      const response: AxiosResponse<CompanyListResponse> = await internalCompanyHttp.get("/companies/top", {
        params: { limit, sortBy: 'marketCap', sortOrder: 'desc' }
      })

      return response.data.data
    } catch (error) {
      throw error instanceof CompanyError ? error : new CompanyError("Lấy danh sách công ty hàng đầu thất bại")
    }
  }

  /**
   * Get company financial ratios
   */
  static async getCompanyRatios(ticker: string): Promise<FinancialRatios> {
    try {
      const response: AxiosResponse<{ data: FinancialRatios }> = await internalCompanyHttp.get(`/companies/${ticker}/ratios`)
      return response.data.data
    } catch (error) {
      throw error instanceof CompanyError ? error : new CompanyError(`Lấy chỉ số tài chính ${ticker} thất bại`)
    }
  }

  /**
   * Get company time series data
   */
  static async getCompanyTimeSeries(
    ticker: string,
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'daily',
    days = 30
  ): Promise<CompanyTimeSeriesData> {
    try {
      const response: AxiosResponse<{ data: CompanyTimeSeriesData }> = await internalCompanyHttp.get(
        `/companies/${ticker}/timeseries`,
        {
          params: { period, days }
        }
      )

      return response.data.data
    } catch (error) {
      throw error instanceof CompanyError ? error : new CompanyError(`Lấy dữ liệu chuỗi thời gian ${ticker} thất bại`)
    }
  }

  /**
   * Get company news
   */
  static async getCompanyNews(ticker: string, limit = 10): Promise<CompanyNews[]> {
    try {
      const response: AxiosResponse<{ data: CompanyNews[] }> = await internalCompanyHttp.get(
        `/companies/${ticker}/news`,
        {
          params: { limit }
        }
      )

      return response.data.data
    } catch (error) {
      throw error instanceof CompanyError ? error : new CompanyError(`Lấy tin tức ${ticker} thất bại`)
    }
  }

  /**
   * Get company events
   */
  static async getCompanyEvents(ticker: string, limit = 10): Promise<CompanyEvent[]> {
    try {
      const response: AxiosResponse<{ data: CompanyEvent[] }> = await internalCompanyHttp.get(
        `/companies/${ticker}/events`,
        {
          params: { limit }
        }
      )

      return response.data.data
    } catch (error) {
      throw error instanceof CompanyError ? error : new CompanyError(`Lấy sự kiện ${ticker} thất bại`)
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
   * Format market cap for display
   */
  static formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `${(marketCap / 1e12).toFixed(1)} nghìn tỷ`
    } else if (marketCap >= 1e9) {
      return `${(marketCap / 1e9).toFixed(1)} tỷ`
    } else if (marketCap >= 1e6) {
      return `${(marketCap / 1e6).toFixed(1)} triệu`
    } else {
      return marketCap.toLocaleString('vi-VN')
    }
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(value: number, decimals = 2): string {
    return `${(value * 100).toFixed(decimals)}%`
  }

  /**
   * Get sector color for UI display
   */
  static getSectorColor(sector: string): string {
    const sectorColors: Record<string, string> = {
      'Real Estate': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Banking': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Technology': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Manufacturing': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Energy': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Healthcare': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Consumer Goods': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Telecommunications': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    }

    return sectorColors[sector] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  /**
   * Calculate basic financial metrics
   */
  static calculateBasicMetrics(company: CompanyData) {
    const { financial, ownership } = company

    return {
      enterpriseValue: financial.marketCap + (financial.marketCap * 0.3), // Simplified calculation
      pegRatio: financial.pe ? financial.pe / 15 : undefined, // Simplified PEG calculation
      debtToEquity: financial.marketCap * 0.2, // Simplified D/E calculation
      workingCapital: financial.marketCap * 0.15, // Simplified working capital
      freeCashFlow: financial.marketCap * 0.1, // Simplified FCF
      dividendYield: financial.dividendYield || 0.02, // Default 2%
      floatShares: company.financial.numberOfSharesMktCap * ownership.freeFloatPercentage,
    }
  }

  /**
   * Compare companies
   */
  static compareCompanies(companies: CompanyData[]): Record<string, unknown> {
    if (companies.length === 0) return {}

    const comparison: Record<string, unknown> = {
      marketCap: {},
      price: {},
      pe: {},
      pb: {},
      roe: {},
      foreignOwnership: {},
    }

    companies.forEach(company => {
      const ticker = company.ticker
      comparison.marketCap[ticker] = company.financial.marketCap
      comparison.price[ticker] = company.financial.currentPrice
      comparison.pe[ticker] = company.financial.pe
      comparison.pb[ticker] = company.financial.pb
      comparison.roe[ticker] = company.financial.roe
      comparison.foreignOwnership[ticker] = company.ownership.foreignerPercentage
    })

    return comparison
  }

  /**
   * Get company risk level based on financial metrics
   */
  static getCompanyRiskLevel(company: unknown): 'low' | 'medium' | 'high' {
    let riskScore = 0

    // PE ratio analysis - use direct properties from API
    const pe = company.pe || company.financial?.pe
    if (pe && pe > 30) riskScore += 2
    else if (pe && pe > 20) riskScore += 1

    // Debt analysis (simplified) - use P/B ratio
    const pb = company.pb || company.financial?.pb
    if (pb && pb > 3) riskScore += 2
    else if (pb && pb > 2) riskScore += 1

    // Foreign ownership (high foreign ownership = lower risk)
    const foreignerPercentage = company.foreignerPercentage || company.ownership?.foreignerPercentage || 0
    if (foreignerPercentage < 0.1) riskScore += 1

    // Free float (low free float = higher risk)
    const freeFloatPercentage = company.freeFloatPercentage || company.ownership?.freeFloatPercentage || 0
    if (freeFloatPercentage < 0.2) riskScore += 2
    else if (freeFloatPercentage < 0.3) riskScore += 1

    if (riskScore >= 5) return 'high'
    if (riskScore >= 3) return 'medium'
    return 'low'
  }

  /**
   * Get company relationships (affiliates and subsidiaries)
   */
  static async getCompanyRelationships(ticker: string): Promise<CompanyRelationshipResponse> {
    try {
      const response: AxiosResponse<CompanyRelationshipResponse> = await companyHttp.get(
        `/company/${ticker}/relationship`
      )
      return response.data
    } catch (error: unknown) {
      throw new CompanyError(
        `Failed to fetch company relationships: ${error.response?.data?.msg || error.message}`,
        error.response?.status
      )
    }
  }

  /**
   * Get shareholder structure
   */
  static async getShareholderStructure(ticker: string): Promise<ShareholderStructureResponse> {
    try {
      const response: AxiosResponse<ShareholderStructureResponse> = await companyHttp.get(
        `/company/${ticker}/shareholder-structure`
      )
      return response.data
    } catch (error: unknown) {
      throw new CompanyError(
        `Failed to fetch shareholder structure: ${error.response?.data?.msg || error.message}`,
        error.response?.status
      )
    }
  }

  /**
   * Get individual shareholders
   */
  static async getCompanyShareholders(ticker: string): Promise<CompanyShareholderResponse> {
    try {
      const response: AxiosResponse<CompanyShareholderResponse> = await companyHttp.get(
        `/company/${ticker}/shareholder`
      )
      return response.data
    } catch (error: unknown) {
      throw new CompanyError(
        `Failed to fetch company shareholders: ${error.response?.data?.msg || error.message}`,
        error.response?.status
      )
    }
  }

  /**
   * Generate company summary for display
   */
  static generateCompanySummary(company: unknown): string {
    const marketCap = company.marketCap || company.financial?.marketCap || 0
    const currentPrice = company.currentPrice || company.financial?.currentPrice || 0
    const foreignerPercentage = company.foreignerPercentage || company.ownership?.foreignerPercentage || 0

    const marketCapFormatted = this.formatMarketCap(marketCap)
    const priceFormatted = this.formatPrice(currentPrice)
    const foreignOwnership = this.formatPercentage(foreignerPercentage)

    const companyName = company.viOrganName || company.organName || company.ticker
    const sector = company.sector || 'N/A'

    return `${companyName} (${company.ticker}) là công ty thuộc ngành ${sector} với vốn hóa thị trường ${marketCapFormatted}. Giá cổ phiếu hiện tại là ${priceFormatted}, tỷ lệ sở hữu nước ngoài ${foreignOwnership}.`
  }
}

export default CompanyService