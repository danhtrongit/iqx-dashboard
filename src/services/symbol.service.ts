import axios, { type AxiosResponse } from "axios"
import {
  type GetSymbolsRequest,
  type GetSymbolsResponse,
  type GetAllSymbolsResponse,
  type GetSymbolRequest,
  type GetSymbolResponse,
  type GetSymbolCountResponse,
  type SyncSymbolsResponse,
  type SymbolSearchResponse,
  SymbolError,
} from "@/types/symbol"

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api"

// Create axios instance for symbols API
const symbolHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token if available
symbolHttp.interceptors.request.use(
  (config) => {
    // Get token from auth service if available
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
symbolHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    // Convert axios error to SymbolError
    const message = error.response?.data?.message || error.message || "Có lỗi xảy ra"
    const statusCode = error.response?.status
    const errors = Array.isArray(error.response?.data?.message)
      ? error.response.data.message
      : undefined

    throw new SymbolError(message, statusCode, errors)
  }
)

export class SymbolService {
  /**
   * Get symbols with pagination
   */
  static async getSymbols(params: GetSymbolsRequest = {}): Promise<GetSymbolsResponse> {
    try {
      const response: AxiosResponse<GetSymbolsResponse> = await symbolHttp.get("/symbols", {
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 20,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof SymbolError ? error : new SymbolError("Lấy danh sách chứng khoán thất bại")
    }
  }

  /**
   * Get all symbols without pagination
   */
  static async getAllSymbols(params: Omit<GetSymbolsRequest, 'page' | 'limit'> = {}): Promise<GetAllSymbolsResponse> {
    try {
      const response: AxiosResponse<GetAllSymbolsResponse> = await symbolHttp.get("/symbols/all", {
        params
      })

      return response.data
    } catch (error) {
      throw error instanceof SymbolError ? error : new SymbolError("Lấy tất cả chứng khoán thất bại")
    }
  }

  /**
   * Search symbols
   */
  static async searchSymbols(params: GetSymbolsRequest): Promise<SymbolSearchResponse> {
    try {
      const response: AxiosResponse<SymbolSearchResponse> = await symbolHttp.get("/symbols/search", {
        params: {
          ...params,
          limit: params.limit || 10,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof SymbolError ? error : new SymbolError("Tìm kiếm chứng khoán thất bại")
    }
  }

  /**
   * Get symbol by code
   */
  static async getSymbol(symbolCode: string, includePrices = false): Promise<GetSymbolResponse> {
    try {
      const response: AxiosResponse<GetSymbolResponse> = await symbolHttp.get(`/symbols/${symbolCode}`, {
        params: { includePrices }
      })

      return response.data
    } catch (error) {
      throw error instanceof SymbolError ? error : new SymbolError(`Lấy thông tin chứng khoán ${symbolCode} thất bại`)
    }
  }

  /**
   * Get total symbol count
   */
  static async getSymbolCount(): Promise<GetSymbolCountResponse> {
    try {
      const response: AxiosResponse<GetSymbolCountResponse> = await symbolHttp.get("/symbols/count")

      return response.data
    } catch (error) {
      throw error instanceof SymbolError ? error : new SymbolError("Lấy số lượng chứng khoán thất bại")
    }
  }

  /**
   * Sync symbols data (requires authentication)
   */
  static async syncSymbols(): Promise<SyncSymbolsResponse> {
    try {
      const response: AxiosResponse<SyncSymbolsResponse> = await symbolHttp.post("/symbols/sync")

      return response.data
    } catch (error) {
      throw error instanceof SymbolError ? error : new SymbolError("Đồng bộ dữ liệu chứng khoán thất bại")
    }
  }

  /**
   * Quick search for autocomplete/suggestions
   */
  static async quickSearch(query: string, limit = 10): Promise<SymbolSearchResponse> {
    if (!query.trim()) {
      return {
        data: [],
        meta: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
        message: "Không có kết quả tìm kiếm"
      }
    }

    return this.searchSymbols({
      search: query.trim(),
      limit,
    })
  }

  /**
   * Check if symbol exists
   */
  static async symbolExists(symbolCode: string): Promise<boolean> {
    try {
      await this.getSymbol(symbolCode, false)
      return true
    } catch (error) {
      if (error instanceof SymbolError && error.statusCode === 404) {
        return false
      }
      throw error
    }
  }
}

export default SymbolService