import axios, { type AxiosResponse } from "axios"
import {
  type GetNewsFromSlugRequest,
  type GetNewsFromSlugResponse,
  type GetNewsListRequest,
  type GetNewsListResponse,
  type NewsArticle,
  NewsError,
} from "@/types/news"

// Use the external API endpoint for news
const NEWS_API_BASE_URL = "https://proxy.iqx.vn/proxy/ai/api"
const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api"

// Create axios instance for news API
const newsHttp = axios.create({
  baseURL: NEWS_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Create axios instance for internal API (if needed for other news operations)
const internalNewsHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token if available for internal API
internalNewsHttp.interceptors.request.use(
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
      // Convert axios error to NewsError
      const message = error.response?.data?.message || error.message || "Có lỗi xảy ra"
      const statusCode = error.response?.status
      const errors = Array.isArray(error.response?.data?.message)
        ? error.response.data.message
        : undefined

      throw new NewsError(message, statusCode, errors)
    }
  )
}

// Apply error interceptors
createErrorInterceptor(newsHttp)
createErrorInterceptor(internalNewsHttp)

export class NewsService {
  /**
   * Get news article by slug from external API
   */
  static async getNewsFromSlug(
    slug: string,
    language: 'vi' | 'en' = 'vi'
  ): Promise<NewsArticle> {
    try {
      if (!slug || slug.trim() === '') {
        throw new NewsError("Slug không được để trống")
      }

      const response: AxiosResponse<NewsArticle> = await newsHttp.get("/news_from_slug", {
        params: {
          slug: slug.trim(),
          language,
        }
      })

      // The API returns the article data directly, not wrapped in a data property
      return response.data
    } catch (error) {
      if (error instanceof NewsError) {
        throw error
      }

      // Handle specific HTTP errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NewsError(`Không tìm thấy bài viết với slug: ${slug}`, 404)
        }
        if (error.response?.status === 400) {
          throw new NewsError("Slug không hợp lệ", 400)
        }
      }

      throw new NewsError(`Lấy bài viết thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get news list (if we have an internal endpoint for this)
   */
  static async getNewsList(params: GetNewsListRequest = {}): Promise<GetNewsListResponse> {
    try {
      const response: AxiosResponse<GetNewsListResponse> = await internalNewsHttp.get("/news", {
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 20,
        }
      })

      return response.data
    } catch (error) {
      throw error instanceof NewsError ? error : new NewsError("Lấy danh sách tin tức thất bại")
    }
  }

  /**
   * Search news articles
   */
  static async searchNews(query: string, limit = 10): Promise<NewsArticle[]> {
    try {
      if (!query.trim()) return []

      const response: AxiosResponse<GetNewsListResponse> = await internalNewsHttp.get("/news/search", {
        params: {
          search: query.trim(),
          limit,
        }
      })

      return response.data.data
    } catch (error) {
      throw error instanceof NewsError ? error : new NewsError("Tìm kiếm tin tức thất bại")
    }
  }

  /**
   * Get news by ticker
   */
  static async getNewsByTicker(ticker: string, limit = 20): Promise<NewsArticle[]> {
    try {
      if (!ticker.trim()) return []

      const response: AxiosResponse<GetNewsListResponse> = await internalNewsHttp.get("/news", {
        params: {
          ticker: ticker.trim().toUpperCase(),
          limit,
        }
      })

      return response.data.data
    } catch (error) {
      throw error instanceof NewsError ? error : new NewsError(`Lấy tin tức mã ${ticker} thất bại`)
    }
  }

  /**
   * Get trending news
   */
  static async getTrendingNews(limit = 10): Promise<NewsArticle[]> {
    try {
      const response: AxiosResponse<GetNewsListResponse> = await internalNewsHttp.get("/news/trending", {
        params: { limit }
      })

      return response.data.data
    } catch (error) {
      throw error instanceof NewsError ? error : new NewsError("Lấy tin tức nổi bật thất bại")
    }
  }

  /**
   * Get latest news
   */
  static async getLatestNews(limit = 20): Promise<NewsArticle[]> {
    try {
      const response: AxiosResponse<GetNewsListResponse> = await internalNewsHttp.get("/news/latest", {
        params: { limit }
      })

      return response.data.data
    } catch (error) {
      throw error instanceof NewsError ? error : new NewsError("Lấy tin tức mới nhất thất bại")
    }
  }

  /**
   * Get related articles by article ID or slug
   */
  static async getRelatedNews(articleId: string, limit = 5): Promise<NewsArticle[]> {
    try {
      const response: AxiosResponse<GetNewsListResponse> = await internalNewsHttp.get(`/news/${articleId}/related`, {
        params: { limit }
      })

      return response.data.data
    } catch (error) {
      throw error instanceof NewsError ? error : new NewsError("Lấy bài viết liên quan thất bại")
    }
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug: string): boolean {
    if (!slug || typeof slug !== 'string') return false

    // Basic slug validation: should contain only letters, numbers, and hyphens
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug.trim())
  }

  /**
   * Extract ticker from news content or title
   */
  static extractTicker(title: string, content: string): string | null {
    const text = `${title} ${content}`.toUpperCase()

    // Look for common ticker patterns: VNM, FPT, VIC, etc.
    const tickerRegex = /\b([A-Z]{3,4})\b/g
    const matches = text.match(tickerRegex)

    if (matches && matches.length > 0) {
      // Return the most frequently mentioned ticker
      const tickerCounts = matches.reduce((acc, ticker) => {
        acc[ticker] = (acc[ticker] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return Object.entries(tickerCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null
    }

    return null
  }

  /**
   * Calculate reading time based on content length
   */
  static calculateReadingTime(content: string): number {
    // Average reading speed: 200 words per minute for Vietnamese
    const wordsPerMinute = 200
    const textContent = content.replace(/<[^>]+>/g, '') // Remove HTML tags
    const wordCount = textContent.trim().split(/\s+/).length

    return Math.ceil(wordCount / wordsPerMinute)
  }

  /**
   * Extract plain text from HTML content
   */
  static extractTextFromHtml(htmlContent: string): string {
    // Remove HTML tags and decode HTML entities
    return htmlContent
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  /**
   * Get sentiment color for UI display
   */
  static getSentimentColor(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'negative':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      case 'neutral':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  /**
   * Format news date for display
   */
  static formatNewsDate(dateString: string): string {
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
          month: 'long',
          day: 'numeric'
        })
      }
    } catch {
      return dateString
    }
  }

  /**
   * Generate SEO-friendly URL from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove duplicate hyphens
      .trim('-') // Remove leading/trailing hyphens
  }
}

export default NewsService